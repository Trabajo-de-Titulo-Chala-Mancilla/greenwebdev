import React, { useState, useRef } from 'react';
import './App.css'; 

// Componentes (igual que antes)
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SummaryCard from './components/SummaryCard';
import ChartContainer from './components/ChartContainer';
import DetailsSidebar from './components/DetailsSidebar';

// ¡Importamos nuestro nuevo hook!
import { useCarbonAnalysis } from './hooks/useCarbonAnalysis';

function App() {
  // --- ESTADO DE UI ---
  const [url, setUrl] = useState('https://www.wikipedia.org');
  // *** CAMBIO 1: Añadir estado para visitas ***
  const [visits, setVisits] = useState(10000);

  // --- REFERENCIAS (REFS) ---
  const chartRefs = {
    monthly: useRef(null),
    scenarios: useRef(null),
    donut: useRef(null)
  };

  // --- HOOK PERSONALIZADO ---
  // *** CAMBIO 2: Pasar 'visits' al hook ***
  const { 
    analysisData, 
    summary, 
    isLoading, 
    isExporting, 
    analyzeUrl, 
    exportPdf 
  } = useCarbonAnalysis(url, visits, chartRefs); // 'visits' añadido aquí

  // --- RENDERIZADO (JSX) ---
  return (
    <div className="app">
      <Sidebar />
      <main className="content">
        <Header
          url={url}
          onUrlChange={setUrl}
          
          // *** CAMBIO 3: Pasar props de visitas al Header ***
          visits={visits}
          onVisitsChange={setVisits}

          onAnalyze={analyzeUrl}
          isLoading={isLoading}
          showExportButton={!!analysisData}
          onExport={exportPdf} 
          isExporting={isExporting}
        />

        <section className="cards">
          <SummaryCard
            title="CO₂ por visita"
            value={`${summary.co2PerVisit.toFixed(3)} g`}
            description="Emisiones promedio por carga de página"
          />
          <SummaryCard
            title="CO₂ últimos 12 meses"
            // (Este valor ahora se calculará automáticamente con las visitas)
            value={`${summary.co212m.toFixed(2)} g`} 
            description="Suma mensual de emisiones (últimos 12 meses)"
          />
        </section>

        <div className="grid">
          {analysisData && (
            <>
              <ChartContainer
                data={analysisData}
                refMap={chartRefs}
              />
              <DetailsSidebar
                url={url}
                // *** CAMBIO 4: Pasar 'visits' al sidebar de detalles ***
                visits={visits} 
                data={analysisData}
                onExport={exportPdf}
                isExporting={isExporting}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;