// Importa el contexto de autenticación para acceder al usuario actual
import { useAuthContext } from '../../context/AuthContext';

// Componente de la barra de navegación
import Navbar from '../../components/ui/Navbar/Navbar';

// Estilos específicos del dashboard
import './Dashboard.css';

export default function Dashboard() {
  // Extrae el usuario actual del contexto
  const { currentUser } = useAuthContext();

  // Si no hay usuario cargado, muestra un mensaje de carga
  if (!currentUser) {
    return <div className="loading">Cargando...</div>;
  }

  // Verifica el rol del usuario
  const isCoordinador = currentUser.rol === "coordinador";
  const isDocente = currentUser.rol === "docente";

  return (
    <div className="dashboard">
      {/* Barra de navegación persistente */}
      <Navbar />

      {/* Contenido principal del dashboard */}
      <main className="dashboard-content">
        <h1>
          Bienvenido, {currentUser.nombre} {currentUser.apellido}
        </h1>

        {/* Mensaje personalizado según el rol del usuario */}
        {isCoordinador && (
          <p>Tienes acceso completo a la gestión de usuarios y proyectos.</p>
        )}
        {isDocente && (
          <p>Acceso a la creación de proyectos escolares y seguimiento.</p>
        )}
      </main>
    </div>
  );
}
