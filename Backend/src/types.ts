/** Contrato JSON de POST /api/analyses. Frontend/src/types.ts lo replica. */

export interface ResourceTypeUsage {
  type: string;
  bytes: number;
  requests: number;
}

export interface Resource {
  url: string;
  type: string;
  bytes: number;
}

export interface PageResult {
  url: string;
  path: string;
  transferBytes: number;
  requests: number;
  co2eGrams: number;
  rating: string;
}

export interface FailedPage {
  url: string;
  path: string;
  reason: string;
}

export interface Scenario {
  id: "traffic" | "heavier" | "lighter";
  label: string;
  description: string;
  /** kg CO2e por año. El índice 0 es el año actual. */
  annualKg: number[];
}

export interface AnalysisResult {
  url: string;
  hostname: string;
  analyzedAt: string;
  monthlyVisits: number;
  /** null cuando The Green Web Foundation no pudo responder. */
  greenHosting: boolean | null;
  summary: {
    pagesMeasured: number;
    averageBytes: number;
    co2ePerVisitGrams: number;
    rating: string;
    highestEmitter: { path: string; co2eGrams: number };
    annualKg: number;
  };
  /** Gramos por visita promedio. uso + producción = co2ePerVisitGrams. */
  lifecycle: { useGrams: number; productionGrams: number };
  /** Gramos por visita promedio, separados por parte del sistema. */
  systemSegments: { dataCenter: number; network: number; userDevice: number };
  equivalences: { carKm: number; smartphones: number; urbanTrees10Years: number };
  pages: PageResult[];
  failedPages: FailedPage[];
  resourceTypes: ResourceTypeUsage[];
  heaviestResources: Resource[];
  scenarios: Scenario[];
}
