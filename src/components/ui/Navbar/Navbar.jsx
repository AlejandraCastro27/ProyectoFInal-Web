// Importa el componente Link para navegación interna
import { Link } from 'react-router-dom';

// Importa estilos específicos para la barra de navegación
import './Navbar.css';

// Hook personalizado para obtener el usuario autenticado y la función de logout
import { useAuthContext } from '../../../context/AuthContext';

// Hook de estado para manejar interacciones del menú (si se desea usar un dropdown más adelante)
import { useState } from 'react';

export default function Navbar() {
  const { currentUser, logout } = useAuthContext();

  // Determina el rol del usuario
  const isCoordinador = currentUser?.rol === "coordinador";
  const isDocente = currentUser?.rol === "docente";

  // Estado para un posible dropdown (preparado por si se quiere extender el menú)
  const [showDropdown, setShowDropdown] = useState(false);
  const toggleDropdown = () => setShowDropdown(prev => !prev);

  return (
    <nav className="navbar">
      {/* Marca o título del sistema */}
      <div className="navbar-brand">
        <div>Proyectos Escolares</div>
      </div>

      {/* Enlaces de navegación condicionales según el rol */}
      <ul className="navbar-links">
        {isCoordinador && (
          <>
            <li><Link to="/projects/create">Crear Proyecto</Link></li>
            <li><Link to="/user-management">Gestión de Usuarios</Link></li>
          </>
        )}

        {isDocente && (
          <>
            <li><Link to="/projects/create">Crear Proyecto</Link></li>
            <li><Link to="/reports">Reportes</Link></li>
          </>
        )}

        {/* Enlaces comunes para usuarios autenticados */}
        {currentUser && (
          <>
            <li><Link to="/projects">Proyectos</Link></li>
            <li><Link to="/reports">Reportes</Link></li>
            <li>
              <button onClick={logout} className="logout-btn">Cerrar Sesión</button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
