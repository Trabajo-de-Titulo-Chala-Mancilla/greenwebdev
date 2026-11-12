import { useState } from "react";
import type { AnalysisResult } from "../types";

export default function ExportButton({ result }: { result: AnalysisResult }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [failed, setFailed] = useState(false);

  const generate = async () => {
    setIsGenerating(true);
    setFailed(false);
    try {
      // @react-pdf pesa más que el resto de la app: solo se descarga al usarlo.
      const { downloadReport } = await import("../report/downloadReport");
      await downloadReport(result);
    } catch (error) {
      console.error(error);
      setFailed(true);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1 sm:items-end">
      <button
        type="button"
        onClick={() => void generate()}
        disabled={isGenerating}
        className="rounded-lg bg-accent px-5 py-2.5 font-bold text-black hover:brightness-110 disabled:opacity-60"
      >
        {isGenerating ? "Generando PDF…" : "Descargar reporte PDF"}
      </button>
      {failed && (
        <p role="alert" className="text-sm text-red-400">
          No se pudo generar el PDF. Intenta de nuevo.
        </p>
      )}
    </div>
  );
}
