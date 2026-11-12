import { describe, expect, it } from "vitest";
import { AppError, PageLoadError } from "../errors.js";
import type { PageMeasurement } from "../measure/measurePage.js";
import { analyzeSite, type AnalyzeDependencies } from "./analyzeSite.js";

const page = (url: string, bytes: number, links: string[] = []): PageMeasurement => ({
  url,
  links,
  resources: [{ url: `${url}/recurso`, type: "image", bytes }],
});

function deps(pages: Record<string, PageMeasurement | Error>): AnalyzeDependencies {
  return {
    maxLinkedPages: 10,
    checkGreenHosting: async () => false,
    now: () => new Date("2026-01-15T12:00:00Z"),
    measure: async (url) => {
      const result = pages[url];
      if (!result || result instanceof Error) throw result ?? new PageLoadError("sin fixture");
      return result;
    },
  };
}

const HOME = "https://ejemplo.cl/";

describe("analyzeSite", () => {
  it("promedia las páginas medidas y proyecta el año", async () => {
    const result = await analyzeSite(
      new URL(HOME),
      analyzedVisits,
      deps({
        [HOME]: page(HOME, 1_000_000, ["/a"]),
        "https://ejemplo.cl/a": page("https://ejemplo.cl/a", 3_000_000),
      }),
    );

    expect(result.summary.pagesMeasured).toBe(2);
    expect(result.summary.averageBytes).toBe(2_000_000);
    expect(result.summary.annualKg).toBeCloseTo(
      (result.summary.co2ePerVisitGrams * analyzedVisits * 12) / 1000,
      9,
    );
    expect(result.summary.highestEmitter.path).toBe("/a");
    expect(result.lifecycle.useGrams + result.lifecycle.productionGrams).toBeCloseTo(
      result.summary.co2ePerVisitGrams,
      9,
    );
  });

  it("no inventa datos si la portada falla", async () => {
    await expect(
      analyzeSite(new URL(HOME), 100, deps({ [HOME]: new PageLoadError("El sitio tardó demasiado en cargar.") })),
    ).rejects.toMatchObject({
      constructor: AppError,
      statusCode: 422,
      message: "El sitio tardó demasiado en cargar.",
    });
  });

  it("informa las páginas enlazadas que fallan y sigue con el resto", async () => {
    const result = await analyzeSite(
      new URL(HOME),
      100,
      deps({
        [HOME]: page(HOME, 1_000_000, ["/ok", "/rota"]),
        "https://ejemplo.cl/ok": page("https://ejemplo.cl/ok", 1_000_000),
        "https://ejemplo.cl/rota": new PageLoadError("El sitio respondió con estado HTTP 404."),
      }),
    );

    expect(result.pages.map((p) => p.path)).toEqual(["/", "/ok"]);
    expect(result.failedPages).toEqual([
      { url: "https://ejemplo.cl/rota", path: "/rota", reason: "El sitio respondió con estado HTTP 404." },
    ]);
  });

  it("lista una sola vez un recurso repetido en varias páginas", async () => {
    const shared = { url: "https://ejemplo.cl/logo.png", type: "image", bytes: 5_000 };
    const withShared = (url: string, links: string[] = []): PageMeasurement => ({ url, links, resources: [shared] });

    const result = await analyzeSite(
      new URL(HOME),
      100,
      deps({ [HOME]: withShared(HOME, ["/a"]), "https://ejemplo.cl/a": withShared("https://ejemplo.cl/a") }),
    );

    expect(result.heaviestResources).toEqual([shared]);
    expect(result.resourceTypes).toEqual([{ type: "image", bytes: 10_000, requests: 2 }]);
  });

  it("no cuenta dos veces enlaces que redirigen a la misma página", async () => {
    const result = await analyzeSite(
      new URL(HOME),
      100,
      deps({
        [HOME]: page(HOME, 1_000_000, ["/inicio"]),
        "https://ejemplo.cl/inicio": page(HOME, 1_000_000),
      }),
    );

    expect(result.pages).toHaveLength(1);
  });
});

const analyzedVisits = 10_000;
