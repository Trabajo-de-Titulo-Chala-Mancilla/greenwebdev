import React from 'react';

/**
 * Muestra una tarjeta de resumen con un título, un valor grande y una descripción.
 * @param {object} props
 * @param {string} props.title - El título de la tarjeta (ej: "CO₂ por visita")
 * @param {string} props.value - El valor principal a mostrar (ej: "0.5 g")
 * @param {string} props.description - El texto de ayuda debajo del valor
 */
function SummaryCard({ title, value, description }) {
  return (
    <div className="card">
      {/* Usamos los props para llenar el contenido */}
      <h3>{title}</h3>
      <div className="big">{value || '— g'}</div> {/* Muestra '— g' si el valor es nulo */}
      <div className="muted">{description}</div>
    </div>
  );
}

export default SummaryCard;