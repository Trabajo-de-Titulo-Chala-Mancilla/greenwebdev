import React from 'react';

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">Digital Carbon — Provisional</div>
      <div className="muted">Panel de control</div>
      <nav className="nav">
        {/* Marcamos 'Dashboard' como activo, ya que es la única vista */}
        <a className="active" href="#">Dashboard</a>
        <a href="#">Reportes</a>
        <a href="#">Ajustes</a>
      </nav>

      {/* Usamos el objeto de estilo para 'margin-top: auto' */}
      <div style={{ marginTop: 'auto' }}>
        <div className="muted">Contacto</div>
        <div style={{ fontSize: '13px', marginTop: '6px' }}>green-web@tu-org.cl</div>
      </div>
    </aside>
  );
}

export default Sidebar;