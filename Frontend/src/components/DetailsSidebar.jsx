import React from 'react';

function DetailsSidebar({ url, data, onExport, isExporting }) {
  
  // --- Cálculos Derivados ---
  // Hacemos estos cálculos aquí para mantener el componente limpio
  
  const domain = url ? (new URL(url)).hostname : '—';
  const analysisDate = new Date().toLocaleDateString();

  // Cálculo del texto de comparación (idéntico a tu JS original)
const calculateComparison = () => {
    if (!data || !data.monthly) return '—';
    
    // (Tuve que quitar el .toFixed(2) para que el cálculo funcione)
    const gramsYear = (data.monthly.reduce((a, b) => a + b, 0) / 1000); // kg
    
    const totalKgFormato = gramsYear.toFixed(2);
    
    // --- LA CORRECCIÓN ESTÁ AQUÍ ---
    // Cambiamos (gramsYear * 0.12) por (gramsYear * 120)
    const smartphones = Math.round(gramsYear * 120); 

    // Texto de comparación
    return `${totalKgFormato} kg CO₂e (últimos 12 meses). Equivalente aproximado a ${smartphones} smartphones cargados.`;
  };

  const comparisonText = calculateComparison();

  return (
    <aside style={{ paddingLeft: '12px' }}>
      <div className="card">
        <h3>Detalles del análisis</h3>
        {/* Mostramos los datos desde los props y variables */}
        <p><strong>Dominio:</strong> <span id="detailDomain">{domain}</span></p>
        <p><strong>Fecha:</strong> <span id="detailDate">{analysisDate}</span></p>
        <p><strong>Visitas (ej):</strong> 10.000 / mes </p>
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