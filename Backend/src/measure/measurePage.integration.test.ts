import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { gzipSync } from "node:zlib";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { BlockedHostError, PageLoadError } from "../errors.js";
import { closeBrowser, getBrowser } from "./browser.js";
import { measurePage, type MeasureOptions } from "./measurePage.js";

const STYLESHEET_SIZE = 200_000;
const stylesheet = `/*${"x".repeat(STYLESHEET_SIZE - 4)}*/`;
const script = "/* relleno */".repeat(50_000);
const gzippedScript = gzipSync(script);

const html = `<!doctype html><title>Fixture</title>
<a href="/contacto">Contacto</a>
<link rel="stylesheet" href="/estilos.css">
<script src="/app.js"></script>
<script>fetch("/tardio.json")</script>`;

let server: Server;
let origin: string;

const options: MeasureOptions = {
  navigationTimeoutMs: 15_000,
  networkIdleTimeoutMs: 3_000,
  allowPrivateHosts: true,
};

beforeAll(async () => {
  server = createServer((request, response) => {
    switch (request.url) {
      case "/":
        response.setHeader("content-type", "text/html");
        return response.end(html);
      case "/estilos.css":
        response.setHeader("content-type", "text/css");
        return response.end(stylesheet);
      case "/app.js":
        response.setHeader("content-type", "text/javascript");
        response.setHeader("content-encoding", "gzip");
        return response.end(gzippedScript);
      case "/tardio.json":
        response.setHeader("content-type", "application/json");
        return response.end('{"ok":true}');
      default:
        response.statusCode = 404;
        return response.end("no");
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await closeBrowser();
  server.close();
});

describe("measurePage en Chromium real", () => {
  it("cuenta subrecursos con su tamaño comprimido por red", async () => {
    const result = await measurePage(await getBrowser(), `${origin}/`, options);
    const byName = (name: string) => result.resources.find((r) => r.url.endsWith(name));

    expect(byName("/")?.type).toBe("document");
    expect(byName("/tardio.json")?.type).toBe("fetch");

    const stylesheetBytes = byName("/estilos.css")?.bytes ?? 0;
    expect(stylesheetBytes).toBeGreaterThanOrEqual(STYLESHEET_SIZE);
    expect(stylesheetBytes).toBeLessThan(STYLESHEET_SIZE + 2_000);

    const scriptBytes = byName("/app.js")?.bytes ?? 0;
    expect(scriptBytes).toBeGreaterThanOrEqual(gzippedScript.length);
    expect(scriptBytes).toBeLessThan(script.length / 10);

    expect(result.links).toEqual([`${origin}/contacto`]);
  }, 30_000);

  it("falla de forma explícita con un estado HTTP de error", async () => {
    await expect(measurePage(await getBrowser(), `${origin}/no-existe`, options)).rejects.toThrow(
      new PageLoadError("El sitio respondió con estado HTTP 404."),
    );
  }, 30_000);

  it("bloquea hosts privados", async () => {
    await expect(
      measurePage(await getBrowser(), `${origin}/`, { ...options, allowPrivateHosts: false }),
    ).rejects.toBeInstanceOf(BlockedHostError);
  }, 30_000);
});
