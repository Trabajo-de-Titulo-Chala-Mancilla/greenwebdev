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
  // --- ESTADO DE UI (Lo único que le importa a App) ---
  const [url, setUrl] = useState('https://www.wikipedia.org');

  // --- REFERENCIAS (REFS) ---
  // Las seguimos necesitando para pasarlas al hook
  const chartRefs = {
    monthly: useRef(null),
    scenarios: useRef(null),
    donut: useRef(null)
  };

  // --- HOOK PERSONALIZADO ---
  // Le pasamos el estado y las refs, y nos devuelve TODOS los datos listos
  const { 
    analysisData, 
    summary, 
    isLoading, 
    isExporting, 
    analyzeUrl, 
    exportPdf 
  } = useCarbonAnalysis(url, chartRefs);

  // --- RENDERIZADO (JSX) ---
  // El JSX es casi idéntico, pero ahora es mucho más "limpio"
  // porque solo recibe props del hook.
  return (
    <div className="app">
      <Sidebar />
      <main className="content">
        <Header
          url={url}
          onUrlChange={setUrl}
          onAnalyze={analyzeUrl} // <-- Llama directamente a la función del hook
          isLoading={isLoading}
          showExportButton={!!analysisData}
          onExport={exportPdf} // <-- Llama directamente a la función del hook
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
            value={`${summary.co212m.toFixed(2)} g`}
            description="Suma mensual de emisiones (últimos 12 meses)"
          />
        </section>

        <div className="grid">
          {analysisData && (
            <>
              <ChartContainer
                data={analysisData}
                // Pasamos las refs a los componentes de gráficos
                refMap={chartRefs}
              />
              <DetailsSidebar
                url={url}
                data={analysisData}
                onExport={exportPdf}
                isExporting={isExporting}
              />
            </>
          )}
        </div>
        
        <div className="footer">
          <p>Esta es una vista provisional. ...</p>
        </div>
      </main>
    </div>
  );
}

export default App;