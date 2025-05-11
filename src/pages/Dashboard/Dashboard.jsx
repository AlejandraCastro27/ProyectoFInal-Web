import { useAuthContext } from '../../context/AuthContext'
import Navbar from '../../components/ui/Navbar/Navbar'
import './Dashboard.css'

export default function Dashboard() {
  const { currentUser, logout } = useAuthContext()

  return (
    <div className="dashboard">
      <Navbar />
      <main className="dashboard-content">
        <h1>Bienvenido, {currentUser?.email}</h1>
        <button onClick={logout} className="logout-btn">
          Cerrar Sesión
        </button>
      </main>
    </div>
  )
}