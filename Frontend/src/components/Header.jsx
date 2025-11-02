import React from 'react';

// 1. Añadimos 'visits' y 'onVisitsChange' a los props
function Header({ 
  url, onUrlChange, 
  visits, onVisitsChange, // <-- ¡NUEVO!
  onAnalyze, isLoading, 
  showExportButton, onExport, isExporting 
}) {
  return (
    <header>
      <div className="domainBox">
        <div style={{ fontWeight: 800, fontSize: '18px' }}>Green Web Development: Cálculadora Digital
de Carbono</div>
      </div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <input
          id="urlInput"
          type="text"
          placeholder="https://www.example.com"
          value={url} // Controlado por el estado de App.jsx
          onChange={(e) => onUrlChange(e.target.value)} // Informa a App.jsx del cambio
          disabled={isLoading} // Deshabilitado mientras carga
        />
        
        {/* 2. AÑADIDO: Input para las visitas */}
        <input
          id="visitsInput"
          type="number"
          placeholder="Visitas mensuales"
          value={visits} // Controlado por el estado de App.jsx
          onChange={(e) => onVisitsChange(Number(e.target.value))} // Informa a App.jsx
          disabled={isLoading}
          style={{ width: '140px' }} // Estilo para que no sea tan grande
        />
        
        <button id="btnAnalyze" onClick={onAnalyze} disabled={isLoading}>
          {isLoading ? 'Analizando...' : 'Analizar'}
        </button>
        
        {/* He dejado los props 'showExportButton', 'onExport', 'isExporting'
          por si el botón de exportar también va aquí, como en tu código original.
        */}
      </div>
    </header>
  );
}

export default Header;

