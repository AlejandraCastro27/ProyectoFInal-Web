import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // AÑADIR useNavigate
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../config/firebase";
import "./ProjectList.css";

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate(); // NUEVA línea

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "projects"));
        const projectsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProjects(projectsList);
      } catch (error) {
        console.error("Error al obtener proyectos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const proyectosFiltrados = projects.filter(project =>
    project.titulo.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) return <p>Cargando proyectos...</p>;

  return (
    <div className="project-list">
      <button onClick={() => navigate("/dashboard")} className="back-btn">
        ← Volver al Dashboard
      </button>

      <h1>Lista de Proyectos</h1>
      <input
        type="text"
        placeholder="Buscar por título"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      {proyectosFiltrados.length === 0 ? (
        <p>No hay proyectos disponibles.</p>
      ) : (
        <ul>
          {proyectosFiltrados.map((project) => (
            <li key={project.id}>
              <Link to={`/projects/${project.id}`}>
                <h3>{project.titulo}</h3>
                <p><strong>Área:</strong> {project.area}</p>
                <p><strong>Institución:</strong> {project.institucion}</p>
                <p><strong>Estado:</strong> {project.estado}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProjectList;
