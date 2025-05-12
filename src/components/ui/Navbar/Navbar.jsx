import { Link } from 'react-router-dom';
import './Navbar.css';
import { useAuthContext } from '../../../context/AuthContext';

export default function Navbar() {
  const { currentUser } = useAuthContext();
  const isCoordinador = currentUser?.rol === "coordinador";
  const isDocente = currentUser?.rol === "docente";

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Proyectos Escolares</Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/projects">Proyectos</Link></li>
        {isCoordinador && <li><Link to="/user-management">Gestión de Usuarios</Link></li>}
        {isDocente && <li><Link to="/projects/create">Crear Proyecto</Link></li>}
        <li><Link to="/dashboard">Dashboard</Link></li>
      </ul>
    </nav>
  );
}
