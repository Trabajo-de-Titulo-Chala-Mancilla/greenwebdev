import { useMutation } from "@tanstack/react-query";
import { requestAnalysis } from "./api";
import AnalysisForm from "./components/AnalysisForm";
import Results from "./components/Results";
import Sidebar from "./components/Sidebar";

export default function App() {
  const analysis = useMutation({ mutationFn: requestAnalysis });

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar />
      <main className="min-w-0 flex-1 space-y-6 p-4 sm:p-8">
        <header className="space-y-5">
          <h1 className="text-xl font-extrabold">Calculadora digital de carbono</h1>
          <AnalysisForm onSubmit={analysis.mutate} isLoading={analysis.isPending} />
        </header>

        {analysis.isPending && (
          <p role="status" className="rounded-xl border border-line bg-surface p-6 text-muted">
            Midiendo la portada y sus páginas enlazadas en un navegador real. Puede tardar hasta un
            minuto.
          </p>
        )}

        {analysis.isError && (
          <p role="alert" className="rounded-xl border border-red-500/60 bg-red-950/40 p-4">
            {analysis.error.message}
          </p>
        )}

        {analysis.isIdle && (
          <p className="rounded-xl border border-line bg-surface p-6 text-muted">
            Ingresa un sitio y sus visitas mensuales estimadas para calcular su huella de carbono y
            generar el reporte PDF.
          </p>
        )}

        {analysis.data && <Results result={analysis.data} />}
      </main>
    </div>
  );
}
