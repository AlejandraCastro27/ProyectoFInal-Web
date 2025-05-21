import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../config/firebase";
import "./ProjectList.css"; // Asegúrate que este archivo tenga los estilos adecuados

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "projects"));
        const projectsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
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

  const proyectosFiltrados = projects.filter((project) =>
    project.titulo.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) return <p className="loading">Cargando proyectos...</p>;

  return (
    <div className="project-list">
      <button onClick={() => navigate("/dashboard")} className="back-btn">
        ← Volver al Dashboard
      </button>

      <h1 className="list-title">Lista de Proyectos</h1>

      <input
        type="text"
        placeholder="Buscar por título"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="search-input"
      />

      {proyectosFiltrados.length === 0 ? (
        <p className="no-projects">No hay proyectos disponibles.</p>
      ) : (
        <ul className="project-cards">
          {proyectosFiltrados.map((project) => (
            <li key={project.id} className="project-card">
              <Link to={`/projects/${project.id}`}>
                <h3 className="project-title">{project.titulo}</h3>
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
