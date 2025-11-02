import React from 'react';

// 1. Añadimos 'visits' a la lista de props
function DetailsSidebar({ url, data, visits, onExport, isExporting }) {
  
  // --- Cálculos Derivados ---
  const domain = url ? (new URL(url)).hostname : '—';
  const analysisDate = new Date().toLocaleDateString();

  const calculateComparison = () => {
    if (!data || !data.monthly) return '—';
    
    const gramsYear = (data.monthly.reduce((a, b) => a + b, 0) / 1000); // kg
    const totalKgFormato = gramsYear.toFixed(2);
    const smartphones = Math.round(gramsYear * 120); 

    // (Tu corrección de 120 ya está aplicada aquí)
    return `${totalKgFormato} kg CO₂e (últimos 12 meses). Equivalente aproximado a ${smartphones} smartphones cargados.`;
  };

  const comparisonText = calculateComparison();

  return (
    <aside style={{ paddingLeft: '12px' }}>
      <div className="card">
        <h3>Detalles del análisis</h3>
        <p><strong>Dominio:</strong> <span id="detailDomain">{domain}</span></p>
        <p><strong>Fecha:</strong> <span id="detailDate">{analysisDate}</span></p>
        
        {/* 2. CAMBIO AQUÍ: Usamos el prop 'visits' */}
        <p><strong>Visitas :</strong> {visits.toLocaleString('es-CL')} / mes </p>
        
        <hr />
        <h4>Comparaciones</h4>
        <p id="comparisonText">{comparisonText}</p>
      </div>

      <div className="card" style={{ marginTop: '12px' }}>
        <h3>Exportar reporte</h3>
        <p className="muted">El PDF incluirá: resumen, gráficos mensuales y comparaciones (formato similar al ejemplo).</p>
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button 
            id="btnExportNow" 
            style={{ flex: 1, display: 'inline-block' }}
            onClick={onExport}
            disabled={isExporting}
          >
            {isExporting ? 'Generando...' : 'Generar y descargar PDF'}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default DetailsSidebar;
