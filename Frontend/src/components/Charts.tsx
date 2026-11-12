import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { formatAxisKg, formatBytes, formatGrams, formatKg, resourceLabel, SCENARIO_COLORS, shorten, YEAR_LABELS } from "../format";
import type { PageResult, ResourceTypeUsage, Scenario } from "../types";

ChartJS.register(BarElement, CategoryScale, Legend, LinearScale, LineElement, PointElement, Tooltip);

const ACCENT = "#0ea5a4";
const MUTED = "#a3b1c4";
const GRID = "#2c2c2a";
const FONT = { family: "Montserrat, system-ui, sans-serif", size: 12 };

const tooltip = {
  backgroundColor: "#000000",
  borderColor: "#333333",
  borderWidth: 1,
  titleFont: FONT,
  bodyFont: FONT,
};

function horizontalOptions(formatValue: (value: number) => string): ChartOptions<"bar"> {
  return {
    indexAxis: "y",
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { ...tooltip, callbacks: { label: (item) => formatValue(item.parsed.x ?? 0) } },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: GRID },
        ticks: { color: MUTED, font: FONT, maxRotation: 0, maxTicksLimit: 5, callback: (value) => formatValue(Number(value)) },
      },
      y: { grid: { display: false }, ticks: { color: MUTED, font: FONT } },
    },
  };
}

const ROW_HEIGHT = 30;
const AXIS_HEIGHT = 44;

function HorizontalBars(props: {
  labels: string[];
  values: number[];
  title: string;
  formatValue: (value: number) => string;
}) {
  const data = {
    labels: props.labels,
    datasets: [
      { label: props.title, data: props.values, backgroundColor: ACCENT, borderRadius: 4, barThickness: 14 },
    ],
  };
  return (
    <div style={{ height: props.labels.length * ROW_HEIGHT + AXIS_HEIGHT }}>
      <Bar aria-label={props.title} data={data} options={horizontalOptions(props.formatValue)} />
    </div>
  );
}

export function PagesChart({ pages }: { pages: PageResult[] }) {
  return (
    <HorizontalBars
      title="Gramos de CO₂e por visita, por página"
      labels={pages.map((page) => shorten(page.path, 26))}
      values={pages.map((page) => page.co2eGrams)}
      formatValue={(value) => `${formatGrams(value)} g`}
    />
  );
}

export function ResourceTypesChart({ types }: { types: ResourceTypeUsage[] }) {
  return (
    <HorizontalBars
      title="Bytes transferidos por tipo de recurso"
      labels={types.map((item) => resourceLabel(item.type))}
      values={types.map((item) => item.bytes)}
      formatValue={formatBytes}
    />
  );
}

export function ScenariosChart({ scenarios }: { scenarios: Scenario[] }) {
  const data = {
    labels: YEAR_LABELS,
    datasets: scenarios.map((scenario) => ({
      label: scenario.label,
      data: scenario.annualKg,
      borderColor: SCENARIO_COLORS[scenario.id].dark,
      backgroundColor: SCENARIO_COLORS[scenario.id].dark,
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    })),
  };
  const options: ChartOptions<"line"> = {
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { position: "bottom", labels: { color: MUTED, font: FONT, usePointStyle: true } },
      tooltip: {
        ...tooltip,
        callbacks: { label: (item) => `${item.dataset.label}: ${formatKg(item.parsed.y ?? 0)} kg` },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: MUTED, font: FONT } },
      y: {
        beginAtZero: true,
        grid: { color: GRID },
        ticks: { color: MUTED, font: FONT, callback: (value) => `${formatAxisKg(Number(value))} kg` },
      },
    },
  };
  return (
    <div className="h-72">
      <Line aria-label="Emisiones anuales proyectadas por escenario" data={data} options={options} />
    </div>
  );
}
