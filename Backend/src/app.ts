import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import Fastify, { type FastifyInstance } from "fastify";
import pLimit from "p-limit";
import { analyzeSite } from "./analysis/analyzeSite.js";
import { checkGreenHosting } from "./carbon/greenHosting.js";
import { config } from "./config.js";
import { AppError } from "./errors.js";
import { closeBrowser, getBrowser } from "./measure/browser.js";
import { measurePage, type PageMeasurement } from "./measure/measurePage.js";
import { analysisRequestSchema } from "./schemas.js";
import type { AnalysisResult } from "./types.js";

export type Analyze = (url: URL, monthlyVisits: number) => Promise<AnalysisResult>;

function createAnalyzer(): Analyze {
  const limit = pLimit(config.measureConcurrency);
  const measure = (url: string): Promise<PageMeasurement> =>
    limit(async () => measurePage(await getBrowser(), url, config));

  return (url, monthlyVisits) =>
    analyzeSite(url, monthlyVisits, {
      measure,
      checkGreenHosting,
      maxLinkedPages: config.maxLinkedPages,
    });
}

export async function buildApp(analyze: Analyze = createAnalyzer()): Promise<FastifyInstance> {
  const app = Fastify({ logger: process.env.NODE_ENV !== "test", trustProxy: config.trustProxy });

  await app.register(cors, { origin: config.corsOrigins });
  await app.register(rateLimit, {
    max: config.rateLimitPerMinute,
    timeWindow: "1 minute",
    global: false,
    errorResponseBuilder: () =>
      new AppError(429, "RATE_LIMITED", "Demasiados análisis seguidos. Espera un minuto e intenta de nuevo."),
  });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({ code: error.code, error: error.message });
    }
    request.log.error(error);
    return reply.status(500).send({ code: "INTERNAL", error: "Ocurrió un error inesperado en el análisis." });
  });

  app.get("/api/health", async () => ({ status: "ok" }));

  app.post(
    "/api/analyses",
    { config: { rateLimit: { max: config.rateLimitPerMinute, timeWindow: "1 minute" } } },
    async (request) => {
      const parsed = analysisRequestSchema.safeParse(request.body);
      if (!parsed.success) {
        const message = parsed.error.issues[0]?.message ?? "Solicitud inválida.";
        throw new AppError(400, "INVALID_REQUEST", message);
      }
      return analyze(parsed.data.url, parsed.data.monthlyVisits);
    },
  );

  app.addHook("onClose", closeBrowser);
  return app;
}
