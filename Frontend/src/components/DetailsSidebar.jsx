import React from 'react';

function DetailsSidebar({ url, data, onExport, isExporting }) {
  
  // --- Cálculos Derivados ---
  // Hacemos estos cálculos aquí para mantener el componente limpio
  
  const domain = url ? (new URL(url)).hostname : '—';
  const analysisDate = new Date().toLocaleDateString();

  // Cálculo del texto de comparación (idéntico a tu JS original)
  const calculateComparison = () => {
    if (!data || !data.monthly) return '—';
    
    const base = data.monthly;
    const gramsYear = (base.reduce((a, b) => a + b, 0) / 1000).toFixed(2); // kg
    
    // Texto de comparación
    return `${gramsYear} kg CO₂e (últimos 12 meses). Equiv. aprox a ${Math.round(gramsYear * 0.12)} smartphones cargados (ejemplo).`;
  };

  const comparisonText = calculateComparison();

  return (
    <aside style={{ paddingLeft: '12px' }}>
      <div className="card">
        <h3>Detalles del análisis</h3>
        {/* Mostramos los datos desde los props y variables */}
        <p><strong>Dominio:</strong> <span id="detailDomain">{domain}</span></p>
        <p><strong>Fecha:</strong> <span id="detailDate">{analysisDate}</span></p>
        <p><strong>Visitas (ej):</strong> 10.000 / mes (configurable en backend)</p>
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
            style={{ flex: 1, display: 'inline-block' }} // El display es 'inline-block' porque ya estamos seguros de que `data` existe si este componente se renderiza
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