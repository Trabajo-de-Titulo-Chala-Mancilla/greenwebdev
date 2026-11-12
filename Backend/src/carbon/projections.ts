import type { AnalysisResult, Scenario } from "../types.js";

/**
 * Factores de la calculadora de equivalencias de la EPA:
 * https://www.epa.gov/energy/greenhouse-gases-equivalencies-calculator-calculations-and-references
 */
const GRAMS_PER_MILE_GASOLINE_CAR = 393;
const KM_PER_MILE = 1.609344;
const GRAMS_PER_SMARTPHONE_CHARGE = 12.4;
const KG_PER_URBAN_TREE_GROWN_10_YEARS = 60;

export function equivalences(annualKg: number): AnalysisResult["equivalences"] {
  const grams = annualKg * 1000;
  return {
    carKm: grams / (GRAMS_PER_MILE_GASOLINE_CAR / KM_PER_MILE),
    smartphones: grams / GRAMS_PER_SMARTPHONE_CHARGE,
    urbanTrees10Years: annualKg / KG_PER_URBAN_TREE_GROWN_10_YEARS,
  };
}

const TRAFFIC_GROWTH = 1.1;
const PROJECTION_YEARS = 4;

function project(baseKg: number, yearlyFactor: number): number[] {
  return Array.from({ length: PROJECTION_YEARS + 1 }, (_, year) => baseKg * yearlyFactor ** year);
}

/** Emisiones proporcionales a visitas y peso, con tráfico creciendo 10% al año. */
export function scenarios(annualKg: number): Scenario[] {
  return [
    {
      id: "traffic",
      label: "Peso sin cambios",
      description: "El tráfico crece 10% al año y el peso de las páginas se mantiene.",
      annualKg: project(annualKg, TRAFFIC_GROWTH),
    },
    {
      id: "heavier",
      label: "Páginas más pesadas",
      description: "El tráfico crece 10% al año y el peso de las páginas aumenta 15% al año.",
      annualKg: project(annualKg, TRAFFIC_GROWTH * 1.15),
    },
    {
      id: "lighter",
      label: "Páginas optimizadas",
      description: "El tráfico crece 10% al año y el peso de las páginas baja 15% al año.",
      annualKg: project(annualKg, TRAFFIC_GROWTH * 0.85),
    },
  ];
}
