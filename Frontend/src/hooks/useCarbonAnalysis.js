import { useState, useMemo } from 'react';

// Constantes
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
// *** CAMBIO 1: Ya no necesitamos el valor por defecto aquí ***
// const DEFAULT_VISITORS = 10000;


function simulateMonthlyData(data, visits) { // <-- 'visits' añadido aquí
  if (data.monthly && Array.isArray(data.monthly) && data.monthly.length === 12) {
    return data.monthly;
  }
  
  const perVisit = data.co2_por_visita_g || (data.co2 && data.co2.co2 ? data.co2.co2 : 0.5);
  const monthly = [];
  for (let i = 0; i < 12; i++) {
    const factor = 0.85 + Math.random() * 0.3;
    // *** CAMBIO 2: Usar 'visits' en lugar de DEFAULT_VISITORS ***
    monthly.push(Number((perVisit * visits * factor).toFixed(3)));
  }
  return monthly;
}


// --- Nuestro Hook Personalizado ---
// *** CAMBIO 3: Añadir 'visits' a los argumentos del hook ***
export function useCarbonAnalysis(url, visits, chartRefs) {
  // --- ESTADO INTERNO DEL HOOK ---
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // --- LÓGICA DE ANÁLISIS ---
  const analyzeUrl = async () => {
    // *** CAMBIO 4: Validar 'visits' también ***
    if (!url) return alert("Ingresa una URL o dominio.");
    if (!visits || visits <= 0) return alert("Ingresa un número de visitas válido.");

    setIsLoading(true);
    setAnalysisData(null);

    try {
      const resp = await fetch(`${BASE_URL}/calculate/url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // *** CAMBIO 5: Enviar 'visits' del estado al backend ***
        body: JSON.stringify({ url, visitas: visits })
      });
      let data = await resp.json();
      
      // Aplicamos la simulación si es necesario
      // *** CAMBIO 6: Pasar 'visits' a la simulación ***
      data.monthly = simulateMonthlyData(data, visits);
      
      setAnalysisData(data);

    } catch (err) {
      console.error("Error en analyzeUrl:", err);
      alert("Error calculando huella: " + (err.message || err));
    } finally {
      setIsLoading(false);
    }
  };

  // --- LÓGICA DE EXPORTACIÓN ---
  // (Sin cambios, ya que lee desde 'analysisData' que ya está correcto)
  const exportPdf = async () => {
    if (!analysisData) return alert("Primero realiza el análisis.");
    setIsExporting(true);

    try {
      const monthlyDataURL = chartRefs.monthly.current?.canvas.toDataURL("image/png");
      const scenariosDataURL = chartRefs.scenarios.current?.canvas.toDataURL("image/png");
      const donutDataURL = chartRefs.donut.current?.canvas.toDataURL("image/png");
      
      const payload = {
        domain: (new URL(url)).hostname,
        summary: {
          per_visit_g: analysisData.co2_por_visita_g || 0,
          total_12m_g: analysisData.monthly.reduce((a, b) => a + b, 0),
          rank: analysisData.rank || { pos: 1335, total: 1506 }
        },
        monthly: analysisData.monthly,
        pages: analysisData.pages || [],
        charts: {
          monthlyChart: monthlyDataURL,
          scenariosChart: scenariosDataURL,
          donutChart: donutDataURL
        }
      };
      
      const resp = await fetch(`${BASE_URL}/report/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!resp.ok) {
        throw new Error("Error del servidor al generar el PDF. Status: " + resp.status);
      }

      const blob = await resp.blob();
      const fileUrl = window.URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = `report_${payload.domain}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      a.remove();
      window.URL.revokeObjectURL(fileUrl);

    } catch (e) {
      console.error("Error en exportPdf:", e);
      alert("Error generando PDF: " + (e.message || e));
    } finally {
      setIsExporting(false);
    }
  };

  // --- DATOS DERIVADOS (con useMemo para optimizar y arreglar el bug) ---
  // (Sin cambios, ya que lee desde 'analysisData' que ya está correcto)
  const summary = useMemo(() => {
    if (!analysisData) {
      return {
        co2PerVisit: 0,
        co212m: 0,
        rank: "#... / ..."
      };
    }
    
    return {
      co2PerVisit: analysisData.co2_por_visita_g || analysisData.co2_por_visit || 0,
      co212m: analysisData.monthly?.reduce((a, b) => a + b, 0) || 0,
      rank: analysisData.rank ? `#${analysisData.rank.pos} / ${analysisData.rank.total}` : "#1335 / 1506"
    };
  }, [analysisData]);

  // --- Lo que el hook "devuelve" al componente App ---
  return {
    analysisData,
    summary,
    isLoading,
    isExporting,
    analyzeUrl,
    exportPdf
  };
}
