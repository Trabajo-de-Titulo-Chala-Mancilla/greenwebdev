import type { Browser, Request, Route } from "playwright";
import { BlockedHostError, PageLoadError } from "../errors.js";
import { classifyHost, type HostClass } from "../security/hostPolicy.js";
import type { Resource } from "../types.js";

export interface PageMeasurement {
  /** URL final, después de redirecciones. */
  url: string;
  resources: Resource[];
  links: string[];
}

export interface MeasureOptions {
  navigationTimeoutMs: number;
  networkIdleTimeoutMs: number;
  allowPrivateHosts: boolean;
}

/** Decide cada petición del navegador, incluidas redirecciones y subrecursos. */
function createHostGuard(allowPrivateHosts: boolean) {
  const known = new Map<string, Promise<HostClass>>();
  let privateHostBlocked = false;

  const handle = async (route: Route) => {
    const { protocol, hostname } = new URL(route.request().url());
    if (allowPrivateHosts || (protocol !== "http:" && protocol !== "https:")) {
      return route.continue();
    }
    let hostClass = known.get(hostname);
    if (!hostClass) {
      hostClass = classifyHost(hostname);
      known.set(hostname, hostClass);
    }
    const result = await hostClass;
    if (result === "public") return route.continue();
    if (result === "private" && route.request().isNavigationRequest()) privateHostBlocked = true;
    return route.abort("blockedbyclient");
  };

  return { handle, wasPrivateHostBlocked: () => privateHostBlocked };
}

function userAgent(browserVersion: string): string {
  return (
    `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) ` +
    `Chrome/${browserVersion} Safari/537.36 GreenWebDev/2.0`
  );
}

async function toResource(request: Request): Promise<Resource> {
  const sizes = await request.sizes();
  return {
    url: request.url(),
    type: request.resourceType(),
    bytes: sizes.responseHeadersSize + sizes.responseBodySize,
  };
}

/** Carga la página con caché vacía y cuenta los bytes transferidos por red. */
export async function measurePage(
  browser: Browser,
  url: string,
  options: MeasureOptions,
): Promise<PageMeasurement> {
  const context = await browser.newContext({
    serviceWorkers: "block",
    viewport: { width: 1366, height: 768 },
    userAgent: userAgent(browser.version()),
  });
  const guard = createHostGuard(options.allowPrivateHosts);

  try {
    await context.route("**/*", guard.handle);
    const page = await context.newPage();

    const finished: Promise<Resource>[] = [];
    page.on("requestfinished", (request) => finished.push(toResource(request)));

    let status: number | undefined;
    try {
      const response = await page.goto(url, {
        waitUntil: "load",
        timeout: options.navigationTimeoutMs,
      });
      status = response?.status();
    } catch (error) {
      if (guard.wasPrivateHostBlocked()) throw new BlockedHostError();
      throw new PageLoadError(describeNavigationError(error));
    }
    if (status === undefined || status >= 400) {
      throw new PageLoadError(`El sitio respondió con estado HTTP ${status ?? "desconocido"}.`);
    }

    await page.waitForLoadState("networkidle", { timeout: options.networkIdleTimeoutMs }).catch(() => {});

    const links = await page.$$eval("a[href]", (anchors) =>
      anchors.map((anchor) => (anchor as HTMLAnchorElement).href),
    );
    const finalUrl = page.url();

    // Un recurso puede fallar al consultar su tamaño si la página ya navegó.
    const settled = await Promise.allSettled(finished);
    const resources = settled
      .flatMap((result) => (result.status === "fulfilled" ? [result.value] : []))
      .filter((resource) => resource.bytes > 0);

    return { url: finalUrl, resources, links };
  } finally {
    await context.close();
  }
}

function describeNavigationError(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("Timeout")) return "El sitio tardó demasiado en cargar.";
  if (message.includes("ERR_NAME_NOT_RESOLVED") || message.includes("ERR_BLOCKED_BY_CLIENT")) {
    return "No se encontró el dominio.";
  }
  return "No se pudo cargar el sitio.";
}
