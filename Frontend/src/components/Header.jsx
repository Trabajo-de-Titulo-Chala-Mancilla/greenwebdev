import React from 'react';

function Header({ url, onUrlChange, onAnalyze, isLoading, showExportButton, onExport, isExporting }) {
  return (
    <header>
      <div className="domainBox">
        <div style={{ fontWeight: 800, fontSize: '18px' }}>Vista provisional — Analizar sitio</div>
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
        <button id="btnAnalyze" onClick={onAnalyze} disabled={isLoading}>
          {isLoading ? 'Analizando...' : 'Analizar'}
        </button>

        {/* Renderizado Condicional: solo se muestra si showExportButton es true */}
        {showExportButton && (
          <button id="btnExport" onClick={onExport} disabled={isExporting}>
            {isExporting ? 'Generando...' : '📄 Exportar PDF'}
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;