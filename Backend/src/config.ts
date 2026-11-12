function positiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

const env = process.env;

export const config = {
  port: positiveInt(env.PORT, 3000),
  corsOrigins: (env.CORS_ORIGIN ?? "http://localhost:5173").split(","),
  trustProxy: env.TRUST_PROXY === "true",
  rateLimitPerMinute: positiveInt(env.RATE_LIMIT_PER_MINUTE, 10),
  /** Páginas simultáneas en Chromium, sumando todos los análisis en curso. */
  measureConcurrency: positiveInt(env.MEASURE_CONCURRENCY, 3),
  /** Páginas enlazadas que se miden además de la portada. */
  maxLinkedPages: positiveInt(env.MAX_LINKED_PAGES, 10),
  navigationTimeoutMs: positiveInt(env.NAVIGATION_TIMEOUT_MS, 30_000),
  /** Espera acotada para recursos que cargan después del evento load. */
  networkIdleTimeoutMs: positiveInt(env.NETWORK_IDLE_TIMEOUT_MS, 5_000),
  allowPrivateHosts: env.ALLOW_PRIVATE_HOSTS === "true",
};
