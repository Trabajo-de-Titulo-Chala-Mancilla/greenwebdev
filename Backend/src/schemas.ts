import { z } from "zod";

/** Acepta "ejemplo.cl" o una URL completa y devuelve una URL http(s) válida. */
export function normalizeUrl(input: string): URL | null {
  const trimmed = input.trim();
  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(candidate);
    const isWeb = url.protocol === "http:" || url.protocol === "https:";
    if (!isWeb || url.username || url.password) return null;
    url.hash = "";
    return url;
  } catch {
    return null;
  }
}

export const analysisRequestSchema = z.object({
  url: z.string().max(2048).transform((value, ctx) => {
    const url = normalizeUrl(value);
    if (!url) {
      ctx.addIssue({ code: "custom", message: "Ingresa una URL o dominio válido." });
      return z.NEVER;
    }
    return url;
  }),
  monthlyVisits: z
    .number({ error: "Ingresa un número de visitas válido." })
    .int("Las visitas mensuales deben ser un número entero.")
    .min(1, "Las visitas mensuales deben ser mayores a 0.")
    .max(1e12, "El número de visitas es demasiado alto."),
});
