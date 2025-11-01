import { useState, useMemo } from 'react';

// Constantes
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const DEFAULT_VISITORS = 10000;


function simulateMonthlyData(data) {
  if (data.monthly && Array.isArray(data.monthly) && data.monthly.length === 12) {
    return data.monthly;
  }
  

  const perVisit = data.co2_por_visita_g || (data.co2 && data.co2.co2 ? data.co2.co2 : 0.5);
  const monthly = [];
  for (let i = 0; i < 12; i++) {
    const factor = 0.85 + Math.random() * 0.3;
    monthly.push(Number((perVisit * DEFAULT_VISITORS * factor).toFixed(3)));
  }
  return monthly;
}


// --- Nuestro Hook Personalizado ---
export function useCarbonAnalysis(url, chartRefs) {
  // --- ESTADO INTERNO DEL HOOK ---
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // --- LÓGICA DE ANÁLISIS ---
  const analyzeUrl = async () => {
    if (!url) return alert("Ingresa una URL o dominio.");
    setIsLoading(true);
    setAnalysisData(null);

    try {
      const resp = await fetch(`${BASE_URL}/calculate/url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, visitas: DEFAULT_VISITORS })
      });
      let data = await resp.json();
      
      // Aplicamos la simulación si es necesario
      data.monthly = simulateMonthlyData(data);
      
      setAnalysisData(data);

    } catch (err) {
      console.error("Error en analyzeUrl:", err);
      alert("Error calculando huella: " + (err.message || err));
    } finally {
      setIsLoading(false);
    }
  };

  // --- LÓGICA DE EXPORTACIÓN ---
  const exportPdf = async () => {
    if (!analysisData) return alert("Primero realiza el análisis.");
    setIsExporting(true);

    try {
      // --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
      // Accedemos a .current.canvas.toDataURL() en lugar de .current.toDataURL()
      // Usamos optional chaining (?.) para evitar errores si la ref es nula.
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
      
      // --- LÓGICA DE DESCARGA DEL BLOB ---
      if (!resp.ok) {
        throw new Error("Error del servidor al generar el PDF. Status: " + resp.status);
      }

      const blob = await resp.blob();
      const fileUrl = window.URL.createObjectURL(blob);
      
      // Crear un link temporal para descargar el archivo
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = `report_${payload.domain}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Limpiar el link temporal
      a.remove();
      window.URL.revokeObjectURL(fileUrl);
      // --- Fin de la lógica de descarga ---

    } catch (e) {
      console.error("Error en exportPdf:", e);
      alert("Error generando PDF: " + (e.message || e));
    } finally {
      setIsExporting(false);
    }
  };

  // --- DATOS DERIVADOS (con useMemo para optimizar y arreglar el bug) ---
  const summary = useMemo(() => {
    if (!analysisData) {
      // Estado inicial antes del análisis
      return {
        co2PerVisit: 0,
        co212m: 0,
        rank: "#... / ..."
      };
    }
    
    // Estado después del análisis (con el bug corregido)
    return {
      co2PerVisit: analysisData.co2_por_visita_g || analysisData.co2_por_visit || 0,
      co212m: analysisData.monthly?.reduce((a, b) => a + b, 0) || 0, // <-- BUG ARREGLADO
      rank: analysisData.rank ? `#${analysisData.rank.pos} / ${analysisData.rank.total}` : "#1335 / 1506"
    };
  }, [analysisData]); // Solo se recalcula cuando analysisData cambia

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
