import type { AnalysisResult } from "./types";

export interface AnalysisRequest {
  url: string;
  monthlyVisits: number;
}

export async function requestAnalysis(request: AnalysisRequest): Promise<AnalysisResult> {
  let response: Response;
  try {
    response = await fetch("/api/analyses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "El servidor no pudo completar el análisis.");
  }
  return response.json() as Promise<AnalysisResult>;
}
