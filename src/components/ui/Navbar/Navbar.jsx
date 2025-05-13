import { Link } from 'react-router-dom';
import './Navbar.css';
import { useAuthContext } from '../../../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { currentUser, logout } = useAuthContext();
  const isCoordinador = currentUser?.rol === "coordinador";
  const isDocente = currentUser?.rol === "docente";

  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(prev => !prev);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Proyectos Escolares</Link>
      </div>

      <ul className="navbar-links">
        {/* Visible para Coordinador */}
        {isCoordinador && (
          <>
            <li className="dropdown">
              <button onClick={toggleDropdown} className="dropdown-toggle">Editar Proyectos ▾</button>
              {showDropdown && (
                <ul className="dropdown-menu">
                  <li><Link to="/projects/create">Crear Proyecto</Link></li>
                
                </ul>
              )}
            </li>
            <li><Link to="/projects">Proyectos</Link></li>
            <li><Link to="/user-management">Gestión de Usuarios</Link></li>
            <li><Link to="/reports">Reportes</Link></li>
          </>
        )}

        {/* Visible para Docente */}
        {isDocente && (
          <>
            <li><Link to="/projects/create">Crear Proyecto</Link></li>
            <li><Link to="/projects">Mis Proyectos</Link></li>
          </>
        )}

        {/* Común */}
        <li><Link to="/dashboard">Dashboard</Link></li>

        {currentUser && (
          <li>
            <button onClick={logout} className="logout-btn">Cerrar Sesión</button>
          </li>
        )}
      </ul>
    </nav>
  );
}
