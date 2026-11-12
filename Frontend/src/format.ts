import type { AnalysisResult, Scenario } from "./types";

const LOCALE = "es-CL";

const number = (value: number, decimals: number) =>
  value.toLocaleString(LOCALE, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export const formatInteger = (value: number) => number(Math.round(value), 0);

/** Tres decimales bajo 1 g para que los valores pequeños no se vean como 0. */
export const formatGrams = (grams: number) => number(grams, grams < 1 ? 3 : 2);

export const formatKg = (kg: number) => number(kg, kg < 10 ? 2 : 1);

export const formatAxisKg = (kg: number) => kg.toLocaleString(LOCALE, { maximumFractionDigits: 2 });

export function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000) return `${number(bytes / 1_000_000, 2)} MB`;
  return `${number(bytes / 1_000, 0)} KB`;
}

export const formatPercent = (share: number) => `${number(share * 100, 0)} %`;

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(LOCALE, { day: "numeric", month: "long", year: "numeric" });

const RESOURCE_LABELS: Record<string, string> = {
  document: "HTML",
  stylesheet: "CSS",
  script: "JavaScript",
  image: "Imágenes",
  font: "Fuentes",
  media: "Video y audio",
  xhr: "XHR",
  fetch: "Fetch",
  ping: "Ping",
  manifest: "Manifest",
  other: "Otros",
};

export const resourceLabel = (type: string) => RESOURCE_LABELS[type] ?? type;

export function hostingLabel(greenHosting: boolean | null): string {
  if (greenHosting === null) return "No verificado";
  return greenHosting ? "Verde" : "Sin registro verde";
}

export const YEAR_LABELS = ["Hoy", "Año 1", "Año 2", "Año 3", "Año 4"];

export function lifecycleShares({ lifecycle }: AnalysisResult) {
  const total = lifecycle.useGrams + lifecycle.productionGrams;
  return { use: lifecycle.useGrams / total, production: lifecycle.productionGrams / total };
}

/** Acorta rutas y URLs largas conservando el inicio y el final. */
export function shorten(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const side = Math.floor((maxLength - 1) / 2);
  return `${text.slice(0, side)}…${text.slice(-side)}`;
}

export function resourceName(url: string): string {
  const { hostname, pathname } = new URL(url);
  return `${hostname}${pathname}`;
}

/** Colores categóricos validados para daltonismo (fondo oscuro / fondo claro). */
export const SCENARIO_COLORS: Record<Scenario["id"], { dark: string; light: string }> = {
  traffic: { dark: "#3987e5", light: "#2a78d6" },
  heavier: { dark: "#d95926", light: "#eb6834" },
  lighter: { dark: "#199e70", light: "#1baf7a" },
};

export const LIFECYCLE_COLORS = {
  use: { dark: "#3987e5", light: "#2a78d6" },
  production: { dark: "#d95926", light: "#eb6834" },
};
