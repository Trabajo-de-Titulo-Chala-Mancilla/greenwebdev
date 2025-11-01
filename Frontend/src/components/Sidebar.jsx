// src/components/Sidebar.jsx

import React from 'react';
// Importamos NavLink para manejar la clase 'active'
import { NavLink } from 'react-router-dom';

// Importamos los íconos que usaremos
import { FiLinkedin, FiMail, FiPhone } from 'react-icons/fi';

function Sidebar() {
  
  // Esta es la URL exacta que encontraste
  const logoUrl = "https://www.growbetter.agency/wp-content/uploads/2021/12/cropped-logo_GB-grande-blanco-e1740162564512.png";
  
  return (
    // Usamos <aside> que es semánticamente correcto para un sidebar
    <aside className="sidebar">
      
      {/* --- 1. GRUPO SUPERIOR (Logo, Proyecto, Navegación) --- */}
      <div>
        <div className="sidebar-header">
          
          {/* Usamos la URL directa en 'src' y el 'alt' que encontraste. */}
          <img 
            src={logoUrl} 
            alt="Logo de GrowBetter Agency" 
            className="sidebar-logo" 
          />
          
          {/* Nombre del Proyecto */}
          <h2 className="project-name">Digital Carbon</h2>
        </div>

        {/* Navegación */}
        <nav className="nav">
          <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>
            Dashboard
          </NavLink>
        </nav>
      </div>

      {/* --- 2. GRUPO INFERIOR (Redes y Contacto) --- */}
      <div className="sidebar-footer">
        <p className="muted">Contacto y Redes</p>
        
        <div className="social-icons">
          <a href="https://linkedin.com/tu-empresa" target="_blank" rel="noopener noreferrer" title="LinkedIn">
            <FiLinkedin size={18} />
          </a>
          <a href="mailto:hola@growbetter.com" title="Email">
            <FiMail size={18} />
          </a>
          <a href="tel:+56912345678" title="Teléfono">
            <FiPhone size={18} />
          </a>
        </div>
        
        <p className="small-text">
          © {new Date().getFullYear()} Grow Better Agency
        </p>
      </div>
      
    </aside>
  );
}

export default Sidebar;