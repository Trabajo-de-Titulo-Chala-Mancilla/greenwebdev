import { estimate } from "../carbon/estimate.js";
import { equivalences, scenarios } from "../carbon/projections.js";
import { AppError, PageLoadError } from "../errors.js";
import { pageKey, selectInternalLinks } from "../measure/links.js";
import type { PageMeasurement } from "../measure/measurePage.js";
import type { AnalysisResult, FailedPage, PageResult, Resource, ResourceTypeUsage } from "../types.js";

export interface AnalyzeDependencies {
  /** Debe limitar por sí misma la concurrencia global. */
  measure: (url: string) => Promise<PageMeasurement>;
  checkGreenHosting: (hostname: string) => Promise<boolean | null>;
  maxLinkedPages: number;
  now?: () => Date;
}

const HEAVIEST_RESOURCES = 10;
const MONTHS_PER_YEAR = 12;

const sumBytes = (resources: Resource[]) => resources.reduce((total, r) => total + r.bytes, 0);

/** Un mismo archivo suele repetirse en varias páginas: se lista una sola vez. */
function heaviestUnique(resources: Resource[], limit: number): Resource[] {
  const largestByUrl = new Map<string, Resource>();
  for (const resource of resources) {
    const known = largestByUrl.get(resource.url);
    if (!known || resource.bytes > known.bytes) largestByUrl.set(resource.url, resource);
  }
  return [...largestByUrl.values()].sort((a, b) => b.bytes - a.bytes).slice(0, limit);
}

function pathOf(url: string): string {
  const { pathname, search } = new URL(url);
  return pathname + search;
}

function groupByType(resources: Resource[]): ResourceTypeUsage[] {
  const groups = new Map<string, ResourceTypeUsage>();
  for (const { type, bytes } of resources) {
    const group = groups.get(type) ?? { type, bytes: 0, requests: 0 };
    group.bytes += bytes;
    group.requests += 1;
    groups.set(type, group);
  }
  return [...groups.values()].sort((a, b) => b.bytes - a.bytes);
}

/** Mide la portada y sus enlaces internos y calcula el reporte completo. */
export async function analyzeSite(
  url: URL,
  monthlyVisits: number,
  deps: AnalyzeDependencies,
): Promise<AnalysisResult> {
  let home: PageMeasurement;
  try {
    home = await deps.measure(url.href);
  } catch (error) {
    if (error instanceof PageLoadError) {
      throw new AppError(422, "SITE_UNREACHABLE", error.message);
    }
    throw error;
  }

  const hostname = new URL(home.url).hostname;
  const links = selectInternalLinks(home.links, home.url, deps.maxLinkedPages);
  const [greenHosting, linked] = await Promise.all([
    deps.checkGreenHosting(hostname),
    Promise.allSettled(links.map((link) => deps.measure(link))),
  ]);

  const measured = [home];
  const seen = new Set([pageKey(new URL(home.url))]);
  const failedPages: FailedPage[] = [];

  linked.forEach((result, index) => {
    if (result.status === "fulfilled") {
      // Dos enlaces distintos pueden redirigir a la misma página.
      const key = pageKey(new URL(result.value.url));
      if (!seen.has(key)) {
        seen.add(key);
        measured.push(result.value);
      }
      return;
    }
    const link = links[index]!;
    failedPages.push({
      url: link,
      path: pathOf(link),
      reason: result.reason instanceof Error ? result.reason.message : "No se pudo cargar la página.",
    });
  });

  const green = greenHosting === true;
  const pages: PageResult[] = measured.map((page) => {
    const transferBytes = sumBytes(page.resources);
    const pageEstimate = estimate(transferBytes, green);
    return {
      url: page.url,
      path: pathOf(page.url),
      transferBytes,
      requests: page.resources.length,
      co2eGrams: pageEstimate.totalGrams,
      rating: pageEstimate.rating,
    };
  });

  const averageBytes = pages.reduce((total, page) => total + page.transferBytes, 0) / pages.length;
  const average = estimate(averageBytes, green);
  const annualKg = (average.totalGrams * monthlyVisits * MONTHS_PER_YEAR) / 1000;
  const highest = pages.reduce((max, page) => (page.co2eGrams > max.co2eGrams ? page : max));
  const allResources = measured.flatMap((page) => page.resources);

  return {
    url: home.url,
    hostname,
    analyzedAt: (deps.now?.() ?? new Date()).toISOString(),
    monthlyVisits,
    greenHosting,
    summary: {
      pagesMeasured: pages.length,
      averageBytes,
      co2ePerVisitGrams: average.totalGrams,
      rating: average.rating,
      highestEmitter: { path: highest.path, co2eGrams: highest.co2eGrams },
      annualKg,
    },
    lifecycle: { useGrams: average.useGrams, productionGrams: average.productionGrams },
    systemSegments: {
      dataCenter: average.dataCenterGrams,
      network: average.networkGrams,
      userDevice: average.userDeviceGrams,
    },
    equivalences: equivalences(annualKg),
    pages,
    failedPages,
    resourceTypes: groupByType(allResources),
    heaviestResources: heaviestUnique(allResources, HEAVIEST_RESOURCES),
    scenarios: scenarios(annualKg),
  };
}
