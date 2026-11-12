import type { ReactNode } from "react";
import {
  formatBytes,
  formatDate,
  formatGrams,
  formatInteger,
  formatKg,
  formatPercent,
  hostingLabel,
  LIFECYCLE_COLORS,
  lifecycleShares,
  resourceLabel,
  resourceName,
  shorten,
} from "../format";
import type { AnalysisResult } from "../types";
import { PagesChart, ResourceTypesChart, ScenariosChart } from "./Charts";
import ExportButton from "./ExportButton";

function Card({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 rounded-xl border border-line bg-surface p-5 ${className}`}>
      <h2 className="mb-4 font-bold">{title}</h2>
      {children}
    </section>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-3xl font-extrabold">{value}</p>
      <p className="mt-1 text-xs text-muted">{note}</p>
    </div>
  );
}

function LifecycleBar({ result }: { result: AnalysisResult }) {
  const shares = lifecycleShares(result);
  const parts = [
    {
      name: "Uso",
      detail: "Operación de centros de datos, redes y dispositivos",
      grams: result.lifecycle.useGrams,
      share: shares.use,
      color: LIFECYCLE_COLORS.use.dark,
    },
    {
      name: "Producción",
      detail: "Energía incorporada en fabricar ese hardware",
      grams: result.lifecycle.productionGrams,
      share: shares.production,
      color: LIFECYCLE_COLORS.production.dark,
    },
  ];
  return (
    <>
      <div className="flex h-4 gap-0.5" role="img" aria-label={`Uso ${formatPercent(shares.use)}, producción ${formatPercent(shares.production)}`}>
        {parts.map((part) => (
          <div key={part.name} className="rounded" style={{ width: `${part.share * 100}%`, background: part.color }} />
        ))}
      </div>
      <ul className="mt-4 space-y-3">
        {parts.map((part) => (
          <li key={part.name} className="flex items-start gap-2">
            <span className="mt-1 size-3 shrink-0 rounded-sm" style={{ background: part.color }} />
            <div>
              <p className="font-bold">
                {part.name}: {formatPercent(part.share)}{" "}
                <span className="font-normal text-muted">({formatGrams(part.grams)} g por visita)</span>
              </p>
              <p className="text-sm text-muted">{part.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

const headerCell = "py-2 pr-4 font-normal text-muted";
const numericCell = "py-2 pr-4 text-right tabular-nums";

export default function Results({ result }: { result: AnalysisResult }) {
  const { summary, equivalences } = result;
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-extrabold">{result.hostname}</h2>
          <p className="text-sm text-muted">
            {formatDate(result.analyzedAt)} · {formatInteger(result.monthlyVisits)} visitas al mes · Hosting:{" "}
            {hostingLabel(result.greenHosting)}
          </p>
        </div>
        <ExportButton result={result} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="CO₂e por visita" value={`${formatGrams(summary.co2ePerVisitGrams)} g`} note="Promedio de las páginas medidas" />
        <Stat label="Calificación" value={summary.rating} note="Escala Sustainable Web Design (A+ a F)" />
        <Stat label="Proyección a 12 meses" value={`${formatKg(summary.annualKg)} kg`} note="CO₂e según las visitas estimadas" />
        <Stat label="Peso promedio" value={formatBytes(summary.averageBytes)} note={`${summary.pagesMeasured} ${summary.pagesMeasured === 1 ? "página medida" : "páginas medidas"}`} />
      </div>

      {result.failedPages.length > 0 && (
        <p role="status" className="rounded-xl border border-amber-500/60 bg-amber-950/30 p-4 text-sm">
          ⚠ {result.failedPages.length} {result.failedPages.length === 1 ? "página no se pudo medir y quedó" : "páginas no se pudieron medir y quedaron"} fuera del promedio:{" "}
          {result.failedPages.map((page) => page.path).join(", ")}
        </p>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Uso y producción">
          <LifecycleBar result={result} />
        </Card>
        <Card title="Equivalencias de la proyección anual">
          <ul className="space-y-3">
            <li><strong>{formatInteger(equivalences.carKm)} km</strong> <span className="text-muted">en un automóvil a gasolina</span></li>
            <li><strong>{formatInteger(equivalences.smartphones)}</strong> <span className="text-muted">cargas completas de smartphone</span></li>
            <li><strong>{formatKg(equivalences.urbanTrees10Years)}</strong> <span className="text-muted">árboles urbanos creciendo durante 10 años</span></li>
          </ul>
          <p className="mt-4 text-xs text-muted">Factores: calculadora de equivalencias de la EPA.</p>
        </Card>

        <Card title="Emisiones por página">
          <PagesChart pages={result.pages} />
        </Card>
        <Card title="Peso por tipo de recurso">
          <ResourceTypesChart types={result.resourceTypes} />
        </Card>

        <Card title="Escenarios a 4 años" className="xl:col-span-2">
          <ScenariosChart scenarios={result.scenarios} />
          <ul className="mt-4 grid gap-2 text-sm text-muted lg:grid-cols-3">
            {result.scenarios.map((scenario) => (
              <li key={scenario.id}>
                <strong className="text-ink">{scenario.label}: {formatKg(scenario.annualKg.at(-1) ?? 0)} kg/año.</strong>{" "}
                {scenario.description}
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Páginas medidas" className="xl:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className={headerCell}>Página</th>
                  <th className={`${headerCell} text-right`}>Peso</th>
                  <th className={`${headerCell} text-right`}>Peticiones</th>
                  <th className={`${headerCell} text-right`}>CO₂e / visita</th>
                  <th className={`${headerCell} text-right`}>Calificación</th>
                </tr>
              </thead>
              <tbody>
                {result.pages.map((page) => (
                  <tr key={page.url} className="border-b border-line/50">
                    <td className="py-2 pr-4 break-all">{page.path}</td>
                    <td className={numericCell}>{formatBytes(page.transferBytes)}</td>
                    <td className={numericCell}>{page.requests}</td>
                    <td className={numericCell}>{formatGrams(page.co2eGrams)} g</td>
                    <td className={numericCell}>{page.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Recursos más pesados" className="xl:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className={headerCell}>Recurso</th>
                  <th className={headerCell}>Tipo</th>
                  <th className={`${headerCell} text-right`}>Peso</th>
                </tr>
              </thead>
              <tbody>
                {result.heaviestResources.map((resource, index) => (
                  <tr key={`${resource.url}-${index}`} className="border-b border-line/50">
                    <td className="py-2 pr-4 break-all" title={resource.url}>{shorten(resourceName(resource.url), 90)}</td>
                    <td className="py-2 pr-4">{resourceLabel(resource.type)}</td>
                    <td className={numericCell}>{formatBytes(resource.bytes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <p className="text-xs leading-relaxed text-muted">
        Estimación con el modelo Sustainable Web Design v4 (CO2.js) a partir de los bytes transferidos en una primera
        visita sin caché. No es una medición directa de consumo eléctrico.
      </p>
    </div>
  );
}
