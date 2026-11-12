/** Replica el contrato de Backend/src/types.ts. */

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
  annualKg: number[];
}

export interface AnalysisResult {
  url: string;
  hostname: string;
  analyzedAt: string;
  monthlyVisits: number;
  greenHosting: boolean | null;
  summary: {
    pagesMeasured: number;
    averageBytes: number;
    co2ePerVisitGrams: number;
    rating: string;
    highestEmitter: { path: string; co2eGrams: number };
    annualKg: number;
  };
  lifecycle: { useGrams: number; productionGrams: number };
  systemSegments: { dataCenter: number; network: number; userDevice: number };
  equivalences: { carKm: number; smartphones: number; urbanTrees10Years: number };
  pages: PageResult[];
  failedPages: FailedPage[];
  resourceTypes: ResourceTypeUsage[];
  heaviestResources: Resource[];
  scenarios: Scenario[];
}
