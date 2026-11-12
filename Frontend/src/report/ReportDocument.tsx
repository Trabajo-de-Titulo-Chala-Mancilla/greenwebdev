import { Circle, Document, Line, Page, Polyline, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";
import {
  formatAxisKg,
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
  SCENARIO_COLORS,
  shorten,
  YEAR_LABELS,
} from "../format";
import type { AnalysisResult, Scenario } from "../types";

export const FONT_FAMILY = "Montserrat";

const INK = "#0f172a";
const BODY = "#334155";
const MUTED = "#64748b";
const LINE = "#e2e8f0";
const TINT = "#f1f5f9";
const BRAND = "#0f766e";
const BAR = "#0ea5a4";

const s = StyleSheet.create({
  page: { fontFamily: FONT_FAMILY, fontSize: 9.5, color: BODY, padding: 40, paddingBottom: 58 },
  brand: { fontSize: 9, fontWeight: 700, color: BRAND, letterSpacing: 0.6 },
  title: { fontSize: 22, fontWeight: 700, color: INK, marginTop: 8, lineHeight: 1.2 },
  host: { fontSize: 13, fontWeight: 700, color: BRAND, marginTop: 8 },
  meta: { color: MUTED, marginTop: 3 },
  rule: { borderBottomWidth: 1, borderBottomColor: LINE, marginVertical: 16 },
  h2: { fontSize: 13, fontWeight: 700, color: INK, marginBottom: 8, lineHeight: 1.3 },
  // El interlineado va aquí: heredado desde Page, @react-pdf descarta los textos dinámicos del pie.
  section: { marginBottom: 18, fontSize: 9.5, lineHeight: 1.4 },
  row: { flexDirection: "row", gap: 8 },
  tile: { flex: 1, backgroundColor: TINT, borderRadius: 6, padding: 10 },
  tileLabel: { fontSize: 8, color: MUTED, lineHeight: 1.3 },
  tileValue: { fontSize: 17, fontWeight: 700, color: INK, marginTop: 3, lineHeight: 1.25 },
  tileNote: { fontSize: 7.5, color: MUTED, marginTop: 2, lineHeight: 1.3 },
  legendRow: { flexDirection: "row", alignItems: "flex-start", gap: 6, marginTop: 7 },
  swatch: { width: 9, height: 9, borderRadius: 2, marginTop: 2 },
  strong: { fontWeight: 700, color: INK },
  th: { fontSize: 8, color: MUTED, paddingVertical: 5 },
  tr: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: LINE },
  td: { fontSize: 8.5, paddingVertical: 3 },
  num: { textAlign: "right" },
  footerLeft: { position: "absolute", left: 40, bottom: 26, fontSize: 8, color: MUTED },
  footerRight: { position: "absolute", left: 40, right: 40, bottom: 26, fontSize: 8, color: MUTED, textAlign: "right" },
  bullet: { marginBottom: 5 },
});

function Tile({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <View style={s.tile}>
      <Text style={s.tileLabel}>{label}</Text>
      <Text style={s.tileValue}>{value}</Text>
      <Text style={s.tileNote}>{note}</Text>
    </View>
  );
}

function Footer() {
  return (
    <>
      <Text style={s.footerLeft} fixed>© {new Date().getFullYear()} Grow Better Agency</Text>
      <Text style={s.footerRight} fixed render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
    </>
  );
}

function LifecycleSection({ result }: { result: AnalysisResult }) {
  const shares = lifecycleShares(result);
  const parts = [
    { name: "Uso", detail: "operación de centros de datos, redes y dispositivos.", grams: result.lifecycle.useGrams, share: shares.use, color: LIFECYCLE_COLORS.use.light },
    { name: "Producción", detail: "energía incorporada en fabricar ese hardware.", grams: result.lifecycle.productionGrams, share: shares.production, color: LIFECYCLE_COLORS.production.light },
  ];
  return (
    <View style={s.section}>
      <Text style={s.h2}>Emisiones de uso y de producción</Text>
      <View style={{ flexDirection: "row", gap: 2, height: 12 }}>
        {parts.map((part) => (
          <View key={part.name} style={{ flexGrow: part.share, flexBasis: 0, backgroundColor: part.color, borderRadius: 3 }} />
        ))}
      </View>
      {parts.map((part) => (
        <View key={part.name} style={s.legendRow}>
          <View style={[s.swatch, { backgroundColor: part.color }]} />
          <Text style={{ flex: 1 }}>
            <Text style={s.strong}>{part.name}: {formatPercent(part.share)}</Text> ({formatGrams(part.grams)} g por visita), {part.detail}
          </Text>
        </View>
      ))}
    </View>
  );
}

function Column({ widths, cells, header = false }: { widths: number[]; cells: { text: string; numeric?: boolean; bold?: boolean }[]; header?: boolean }) {
  return (
    <View style={s.tr} wrap={false}>
      {cells.map((cell, index) => (
        <Text
          key={index}
          style={[
            header ? s.th : s.td,
            { flexGrow: widths[index] ?? 1, flexBasis: 0, paddingRight: 6 },
            cell.numeric ? s.num : {},
            cell.bold ? s.strong : {},
          ]}
        >
          {cell.text}
        </Text>
      ))}
    </View>
  );
}

const PAGE_WIDTHS = [46, 13, 12, 16, 13];
const RESOURCE_WIDTHS = [70, 16, 14];

function ResourceBars({ result }: { result: AnalysisResult }) {
  const total = result.resourceTypes.reduce((sum, item) => sum + item.bytes, 0);
  const largest = result.resourceTypes[0]?.bytes ?? 1;
  return (
    <View>
      {result.resourceTypes.map((item) => (
        <View key={item.type} style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }} wrap={false}>
          <Text style={{ width: 80, fontSize: 8.5 }}>{resourceLabel(item.type)}</Text>
          <View style={{ flex: 1, height: 8 }}>
            <View style={{ width: `${(item.bytes / largest) * 100}%`, height: 8, backgroundColor: BAR, borderRadius: 2 }} />
          </View>
          <Text style={{ width: 96, fontSize: 8.5, textAlign: "right" }}>
            {formatBytes(item.bytes)} · {formatPercent(item.bytes / total)}
          </Text>
        </View>
      ))}
    </View>
  );
}

function niceMax(value: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((candidate) => candidate * magnitude >= value) ?? 10;
  return step * magnitude;
}

const CHART = { width: 515, height: 200, left: 48, right: 12, top: 10, bottom: 24 };

function ScenarioChart({ scenarios }: { scenarios: Scenario[] }) {
  const largest = Math.max(...scenarios.flatMap((scenario) => scenario.annualKg));
  const top = niceMax(largest);
  const plotWidth = CHART.width - CHART.left - CHART.right;
  const plotHeight = CHART.height - CHART.top - CHART.bottom;
  const x = (index: number) => CHART.left + (plotWidth * index) / (YEAR_LABELS.length - 1);
  const y = (kg: number) => CHART.top + plotHeight * (1 - kg / top);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((fraction) => fraction * top);
  const label = { fontFamily: FONT_FAMILY, fontSize: 7.5 };

  return (
    <Svg width={CHART.width} height={CHART.height} viewBox={`0 0 ${CHART.width} ${CHART.height}`}>
      {ticks.map((tick) => (
        <Line key={tick} x1={CHART.left} x2={CHART.width - CHART.right} y1={y(tick)} y2={y(tick)} stroke={LINE} strokeWidth={0.75} />
      ))}
      {ticks.map((tick) => (
        <Text key={tick} x={CHART.left - 6} y={y(tick) + 2.5} fill={MUTED} style={label} textAnchor="end">
          {formatAxisKg(tick)}
        </Text>
      ))}
      {YEAR_LABELS.map((year, index) => (
        <Text key={year} x={x(index)} y={CHART.height - 8} fill={MUTED} style={label} textAnchor="middle">
          {year}
        </Text>
      ))}
      {scenarios.map((scenario) => (
        <Polyline
          key={scenario.id}
          points={scenario.annualKg.map((kg, index) => `${x(index)},${y(kg)}`).join(" ")}
          fill="none"
          stroke={SCENARIO_COLORS[scenario.id].light}
          strokeWidth={2}
        />
      ))}
      {scenarios.flatMap((scenario) =>
        scenario.annualKg.map((kg, index) => (
          <Circle key={`${scenario.id}-${index}`} cx={x(index)} cy={y(kg)} r={3} fill={SCENARIO_COLORS[scenario.id].light} stroke="#ffffff" strokeWidth={1} />
        )),
      )}
    </Svg>
  );
}

export default function ReportDocument({ result }: { result: AnalysisResult }) {
  const { summary, equivalences, failedPages } = result;
  const visits = formatInteger(result.monthlyVisits);

  return (
    <Document title={`Reporte de huella de carbono - ${result.hostname}`} author="Grow Better Agency" language="es">
      <Page size="A4" style={s.page}>
        <Text style={s.brand}>GREEN WEB DEVELOPMENT</Text>
        <Text style={s.title}>Reporte de huella de carbono digital</Text>
        <Text style={s.host}>{result.hostname}</Text>
        <Text style={s.meta}>
          {formatDate(result.analyzedAt)} · {visits} visitas mensuales estimadas · Hosting: {hostingLabel(result.greenHosting)}
        </Text>
        <View style={s.rule} />

        <View style={s.section}>
          <Text style={s.h2}>Resumen</Text>
          <Text style={{ marginBottom: 10 }}>
            Cada visita a este sitio emite en promedio <Text style={s.strong}>{formatGrams(summary.co2ePerVisitGrams)} g de CO2e</Text>, según {summary.pagesMeasured} {summary.pagesMeasured === 1 ? "página medida" : "páginas medidas"}. Con {visits} visitas al mes, la proyección a 12 meses es de <Text style={s.strong}>{formatKg(summary.annualKg)} kg de CO2e</Text>.
          </Text>
          <View style={s.row}>
            <Tile label="Emisión por visita" value={`${formatGrams(summary.co2ePerVisitGrams)} g`} note="Promedio de páginas medidas" />
            <Tile label="Calificación" value={summary.rating} note="Escala SWD, de A+ a F" />
            <Tile label="Proyección a 12 meses" value={`${formatKg(summary.annualKg)} kg`} note="Según visitas estimadas" />
            <Tile label="Peso promedio" value={formatBytes(summary.averageBytes)} note="Transferido por página" />
          </View>
        </View>

        <LifecycleSection result={result} />

        <View style={s.section}>
          <Text style={s.h2}>Equivalencias de la proyección anual</Text>
          <View style={s.row}>
            <Tile label="Automóvil a gasolina" value={`${formatInteger(equivalences.carKm)} km`} note="Distancia recorrida" />
            <Tile label="Smartphones" value={formatInteger(equivalences.smartphones)} note="Cargas completas" />
            <Tile label="Árboles urbanos" value={formatKg(equivalences.urbanTrees10Years)} note="Creciendo durante 10 años" />
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.h2}>Página con mayor emisión</Text>
          <Text>
            <Text style={s.strong}>{shorten(summary.highestEmitter.path, 80)}</Text> emite {formatGrams(summary.highestEmitter.co2eGrams)} g de CO2e en cada visita.
          </Text>
        </View>
        <Footer />
      </Page>

      <Page size="A4" style={s.page}>
        <View style={s.section}>
          <Text style={s.h2}>Detalle por página</Text>
          <Column header widths={PAGE_WIDTHS} cells={[{ text: "Página" }, { text: "Peso", numeric: true }, { text: "Peticiones", numeric: true }, { text: "g por visita", numeric: true }, { text: "Calificación", numeric: true }]} />
          {result.pages.map((page) => (
            <Column
              key={page.url}
              widths={PAGE_WIDTHS}
              cells={[
                { text: shorten(page.path, 46) },
                { text: formatBytes(page.transferBytes), numeric: true },
                { text: String(page.requests), numeric: true },
                { text: formatGrams(page.co2eGrams), numeric: true },
                { text: page.rating, numeric: true, bold: true },
              ]}
            />
          ))}
        </View>

        <View style={s.section} wrap={false}>
          <Text style={s.h2}>Peso por tipo de recurso</Text>
          <ResourceBars result={result} />
        </View>

        <View style={s.section}>
          <Text style={s.h2}>Recursos más pesados</Text>
          <Column header widths={RESOURCE_WIDTHS} cells={[{ text: "Recurso" }, { text: "Tipo" }, { text: "Peso", numeric: true }]} />
          {result.heaviestResources.map((resource, index) => (
            <Column
              key={`${resource.url}-${index}`}
              widths={RESOURCE_WIDTHS}
              cells={[
                { text: shorten(resourceName(resource.url), 64) },
                { text: resourceLabel(resource.type) },
                { text: formatBytes(resource.bytes), numeric: true },
              ]}
            />
          ))}
        </View>
        <Footer />
      </Page>

      <Page size="A4" style={s.page}>
        <View style={s.section}>
          <Text style={s.h2}>Escenarios a 4 años (kg de CO2e al año)</Text>
          <ScenarioChart scenarios={result.scenarios} />
          {result.scenarios.map((scenario) => (
            <View key={scenario.id} style={s.legendRow}>
              <View style={[s.swatch, { backgroundColor: SCENARIO_COLORS[scenario.id].light }]} />
              <Text style={{ flex: 1 }}>
                <Text style={s.strong}>{scenario.label}: {formatKg(scenario.annualKg.at(-1) ?? 0)} kg al año 4.</Text> {scenario.description}
              </Text>
            </View>
          ))}
        </View>

        {failedPages.length > 0 && (
          <View style={s.section}>
            <Text style={s.h2}>Páginas que no se pudieron medir</Text>
            {failedPages.map((page) => (
              <Text key={page.url} style={s.bullet}>• {shorten(page.path, 60)}: {page.reason}</Text>
            ))}
            <Text style={{ color: MUTED }}>Estas páginas no se incluyen en los promedios.</Text>
          </View>
        )}

        <View style={s.section}>
          <Text style={s.h2}>Metodología</Text>
          <Text style={s.bullet}>• Cada página se cargó en un navegador Chromium con caché vacía y se sumaron los bytes transferidos por red: HTML, CSS, JavaScript, imágenes, fuentes y otros recursos.</Text>
          <Text style={s.bullet}>• Las emisiones se estimaron con el modelo Sustainable Web Design v4 mediante la librería CO2.js, usando su intensidad promedio mundial de la red eléctrica.</Text>
          <Text style={s.bullet}>• El hosting se consultó en The Green Web Foundation. Si es verde, se descuenta la operación del centro de datos.</Text>
          <Text style={s.bullet}>• Las equivalencias usan los factores de la calculadora de la EPA de Estados Unidos.</Text>
        </View>

        <View style={s.section}>
          <Text style={s.h2}>Limitaciones</Text>
          <Text style={s.bullet}>• Es una estimación basada en promedios del modelo, no una medición directa del consumo eléctrico.</Text>
          <Text style={s.bullet}>• La proyección usa las visitas mensuales ingresadas y un promedio simple entre páginas, porque no se dispone del tráfico real de cada una.</Text>
          <Text style={s.bullet}>• La medición corresponde a una primera visita, en este momento y sin desplazar la página. El contenido que carga al hacer scroll no se contabiliza.</Text>
        </View>
        <Footer />
      </Page>
    </Document>
  );
}
