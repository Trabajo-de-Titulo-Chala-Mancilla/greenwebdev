import { afterEach, describe, expect, it, vi } from "vitest";
import { buildApp, type Analyze } from "./app.js";
import { AppError } from "./errors.js";
import type { AnalysisResult } from "./types.js";

let close: (() => Promise<unknown>) | undefined;

async function appWith(analyze: Analyze) {
  const app = await buildApp(analyze);
  close = () => app.close();
  return app;
}

afterEach(async () => {
  await close?.();
});

const post = (body: unknown) => ({ method: "POST" as const, url: "/api/analyses", payload: body as object });

describe("POST /api/analyses", () => {
  it("normaliza la URL antes de analizar", async () => {
    const analyze = vi.fn<Analyze>(async () => ({ hostname: "ejemplo.cl" }) as AnalysisResult);
    const app = await appWith(analyze);

    const response = await app.inject(post({ url: "ejemplo.cl", monthlyVisits: 500 }));

    expect(response.statusCode).toBe(200);
    expect(analyze.mock.calls[0]?.[0].href).toBe("https://ejemplo.cl/");
    expect(analyze.mock.calls[0]?.[1]).toBe(500);
  });

  it("devuelve 400 con mensaje legible si faltan datos", async () => {
    const app = await appWith(vi.fn<Analyze>());

    const response = await app.inject(post({ url: "ejemplo.cl", monthlyVisits: 0 }));

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe("Las visitas mensuales deben ser mayores a 0.");
  });

  it("propaga el mensaje de un error conocido", async () => {
    const app = await appWith(async () => {
      throw new AppError(422, "SITE_UNREACHABLE", "No se encontró el dominio.");
    });

    const response = await app.inject(post({ url: "ejemplo.cl", monthlyVisits: 1 }));

    expect(response.statusCode).toBe(422);
    expect(response.json()).toEqual({ code: "SITE_UNREACHABLE", error: "No se encontró el dominio." });
  });

  it("no filtra detalles de un error inesperado", async () => {
    const app = await appWith(async () => {
      throw new Error("detalle interno");
    });

    const response = await app.inject(post({ url: "ejemplo.cl", monthlyVisits: 1 }));

    expect(response.statusCode).toBe(500);
    expect(response.body).not.toContain("detalle interno");
  });
});
