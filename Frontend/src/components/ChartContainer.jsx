// src/components/ChartContainer.jsx

import React from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend
);

// --- Funciones Helper (sin cambios) ---
function monthsLabels() {
  const names = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const d = new Date();
  const arr = [];
  for (let i = 11; i >= 0; i--) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
    arr.push(names[m.getMonth()]);
  }
  return arr;
}
function formatNumber(n) { return Number(n).toLocaleString(); }
// -------------------------------------------------------------

// --- Leemos los colores de nuestro CSS "Grow Better" ---
const rootStyles = getComputedStyle(document.documentElement);
const colorAccent = rootStyles.getPropertyValue('--gb-accent').trim();
const colorTextPrimary = rootStyles.getPropertyValue('--gb-text-primary').trim();
const colorTextSecondary = rootStyles.getPropertyValue('--gb-text-secondary').trim();
const colorBorder = rootStyles.getPropertyValue('--gb-border').trim();
const fontFamily = rootStyles.getPropertyValue('--font-primary').trim() || "'Montserrat', sans-serif";

// --- Opciones Base para TODOS los gráficos (Modo Oscuro) ---
const baseOptions = {
  maintainAspectRatio: false, // Dejamos que el CSS (.chartCard) maneje el tamaño
  plugins: {
    legend: {
      labels: {
        color: colorTextSecondary, // Color de texto de leyenda
        font: { family: fontFamily }
      }
    },
    tooltip: {
      backgroundColor: '#000',
      titleColor: colorTextSecondary,
      bodyColor: colorAccent,
      borderColor: colorBorder,
      borderWidth: 1,
      titleFont: { family: fontFamily },
      bodyFont: { family: fontFamily }
    }
  },
  scales: {
    x: {
      ticks: { 
        color: colorTextSecondary, // Color de texto eje X
        font: { family: fontFamily } 
      },
      grid: { color: colorBorder } // Color de líneas grid X
    },
    y: {
      ticks: { 
        color: colorTextSecondary, // Color de texto eje Y
        font: { family: fontFamily } 
      },
      grid: { color: colorBorder }, // Color de líneas grid Y
      beginAtZero: true
    }
  }
};

// --- Opciones Específicas para cada gráfico ---
// Usamos '...baseOptions' para heredar el estilo
const barOptions = {
  ...baseOptions,
  plugins: {
    ...baseOptions.plugins,
    legend: { display: false } // Ocultamos leyenda solo para este
  },
};

const lineOptions = {
  ...baseOptions,
  plugins: {
    ...baseOptions.plugins,
    legend: { 
      ...baseOptions.plugins.legend,
      position: 'bottom' // Posición específica
    }
  },
};

const donutOptions = {
  maintainAspectRatio: false,
  plugins: {
    ...baseOptions.plugins,
    legend: {
      ...baseOptions.plugins.legend,
      position: 'bottom'
    },
    tooltip: baseOptions.plugins.tooltip // Hereda tooltip
  }
};

// --- Componente Principal ---
function ChartContainer({ data, refMap }) {
  const labels = monthsLabels();

  // Preparamos los datos para cada gráfico
  const monthlyData = {
    labels,
    datasets: [{
      label: "g CO₂",
      data: data.monthly.map(v => Number(v.toFixed(3))),
      backgroundColor: colorAccent // <-- CAMBIADO: Usamos variable
    }]
  };
  
  const scenariosData = {
    labels,
    datasets: [
      // <-- CAMBIADO: Paleta de colores coherente
      { label: "Base (actual)", data: data.monthly, borderColor: colorAccent, tension: 0.3, fill: false },
      { label: "+10% tráfico", data: data.monthly.map(v => Number((v * 1.1).toFixed(3))), borderColor: colorTextPrimary, tension: 0.3, fill: false },
      { label: "-15% peso", data: data.monthly.map(v => Number((v * 0.85).toFixed(3))), borderColor: colorTextSecondary, tension: 0.3, fill: false }
    ]
  };
  
  const totalUsage = data.monthly.reduce((a, b) => a + b, 0);
  const production = totalUsage * 0.35; // Heurística
  const donutData = {
    labels: ["Uso", "Producción"],
    datasets: [{
      data: [totalUsage, production],
      // <-- CAMBIADO: Paleta de colores coherente
      backgroundColor: [colorAccent, colorTextSecondary],
      borderColor: colorBorder // <-- AÑADIDO: Borde sutil
    }]
  };
  
  // (Lógica de la tabla sin cambios)
  const pages = data.pages && data.pages.length 
    ? data.pages.slice(0, 8) 
    : Array(6).fill(0).map((_, i) => ({
        path: `/page-${i+1}`,
        g: (totalUsage / 1200 * (i+1)),
        visits: Math.round((data.summary?.visits || 10000) / 6) // Asumiendo que DEFAULT_VISITORS no existe
      }));

  return (
    <div className="charts">
      <div className="chartCard">
        {/* El <h3> ya está estilizado por el CSS global */}
        <h3>Emisiones mensuales (últimos 12 meses)</h3>
        {/* Usamos las nuevas opciones */}
        <Bar ref={refMap.monthly} data={monthlyData} options={barOptions} />
      </div>

      <div className="chartCard" style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
        <div style={{ flex: 1, minHeight: '300px' }}> {/* Damos altura mínima */}
          <h3>Escenarios futuros </h3>
          <Line ref={refMap.scenarios} data={scenariosData} options={lineOptions} />
        </div>
        <div style={{ width: '240px' }}> {/* Más espacio para la dona */}
          <h3>Distribución</h3>
          {/* Envolvemos la dona en un div con altura */}
          <div style={{ height: '200px', position: 'relative' }}>
            <Doughnut ref={refMap.donut} data={donutData} options={donutOptions} />
          </div>
          <div style={{ fontSize: '13px', color: colorTextSecondary, marginTop: '8px' }}> {/* <-- CAMBIADO */}
            Distribución estimada por tipo: Uso vs Producción
          </div>
        </div>
      </div>

      <div className="chartCard">
        <h3>Tabla de páginas </h3>
        {/* La tabla ya está estilizada por el CSS global */}
        <table>
          <thead>
            <tr><th>Página</th><th>g CO₂ / visita</th><th>Visitas/mes</th></tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.path}>
                <td>{p.path}</td>
                <td>{(p.g || p.co2 || 0).toFixed(3)}</td>
                <td>{formatNumber(p.visits || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ChartContainer;