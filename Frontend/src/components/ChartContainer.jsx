import React from 'react';
// Importamos los componentes de gráfico específicos
import { Bar, Line, Doughnut } from 'react-chartjs-2';
// Hay que registrar los elementos de Chart.js
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

// --- Funciones Helper (puedes moverlas a un archivo utils.js) ---
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

function ChartContainer({ data, refMap }) {
  const labels = monthsLabels();

  // Preparamos los datos para cada gráfico
  const monthlyData = {
    labels,
    datasets: [{
      label: "g CO₂",
      data: data.monthly.map(v => Number(v.toFixed(3))),
      backgroundColor: "#0ea5a4"
    }]
  };
  
  const scenariosData = {
    labels,
    datasets: [
      { label: "Base (actual)", data: data.monthly, borderColor: "#0ea5a4", tension: 0.3, fill: false },
      { label: "+10% tráfico", data: data.monthly.map(v => Number((v * 1.1).toFixed(3))), borderColor: "#f59e0b", tension: 0.3, fill: false },
      { label: "-15% peso", data: data.monthly.map(v => Number((v * 0.85).toFixed(3))), borderColor: "#ef4444", tension: 0.3, fill: false }
    ]
  };
  
  const totalUsage = data.monthly.reduce((a, b) => a + b, 0);
  const production = totalUsage * 0.35; // Heurística
  const donutData = {
    labels: ["Uso", "Producción"],
    datasets: [{
      data: [totalUsage, production],
      backgroundColor: ["#0ea5a4", "#60a5fa"]
    }]
  };
  
  // Datos de ejemplo para la tabla (o usa los reales si vienen)
  const pages = data.pages && data.pages.length 
    ? data.pages.slice(0, 8) 
    : Array(6).fill(0).map((_, i) => ({
        path: `/page-${i+1}`,
        g: (totalUsage / 1200 * (i+1)),
        visits: Math.round(DEFAULT_VISITORS / 6)
      }));

  return (
    <div className="charts">
      <div className="chartCard">
        <h3>Emisiones mensuales (últimos 12 meses)</h3>
        {/* Pasamos la ref y los datos. ¡Y listo! */}
        <Bar ref={refMap.monthly} data={monthlyData} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
      </div>

      <div className="chartCard" style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <h3>Escenarios futuros (ejemplo)</h3>
          <Line ref={refMap.scenarios} data={scenariosData} options={{ plugins: { legend: { position: "bottom" } }, scales: { y: { beginAtZero: true } } }} />
        </div>
        <div style={{ width: '200px' }}>
          <h3>Distribución</h3>
          <Doughnut ref={refMap.donut} data={donutData} options={{ plugins: { legend: { position: "bottom" } } }} style={{ height: '200px' }} />
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>Distribución estimada por tipo: Uso vs Producción</div>
        </div>
      </div>

      <div className="chartCard">
        <h3>Tabla de páginas (ejemplo)</h3>
        <table>
          <thead>
            <tr><th>Página</th><th>g CO₂ / visita</th><th>Visitas/mes</th></tr>
          </thead>
          <tbody>
            {/* Renderizado de listas en React: usamos .map() 
              ¡Mucho más limpio que innerHTML!
            */}
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

// Necesario para pasar la ref correctamente
export default ChartContainer;