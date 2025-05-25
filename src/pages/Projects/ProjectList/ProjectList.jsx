import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Para navegación entre rutas
import { collection, getDocs, doc, getDoc } from "firebase/firestore"; // Firebase Firestore para obtener datos
import { db } from "../../../config/firebase"; // Configuración de Firebase
import "./ProjectList.css";

const ProjectList = () => {
  // Estados para manejar proyectos, carga, filtros y datos únicos para filtros
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busquedaTitulo, setBusquedaTitulo] = useState("");
  const [docenteSeleccionado, setDocenteSeleccionado] = useState("Todos");
  const [institucionSeleccionada, setInstitucionSeleccionada] = useState("Todos");
  const [docentesUnicos, setDocentesUnicos] = useState([]);
  const [institucionesUnicas, setInstitucionesUnicas] = useState([]);
  const [docentesInfo, setDocentesInfo] = useState({}); // Estado que no se usa actualmente

  const navigate = useNavigate(); // Hook para navegación programática

  // Función que obtiene el nombre completo del docente responsable de un proyecto
  const getDocenteResponsable = async (projectData) => {
    try {
      // Si el proyecto tiene miembros y alguno es docente, busca su info en Firestore
      if (projectData.miembros?.length > 0) {
        const docentes = projectData.miembros.filter(m => m.rol === "docente");
        if (docentes.length > 0) {
          const docenteDoc = await getDoc(doc(db, "users", docentes[0].userId));
          if (docenteDoc.exists()) {
            return `${docenteDoc.data().nombre} ${docenteDoc.data().apellido || ''}`.trim();
          }
        }
      }
      
      // Si tiene un docenteId, también intenta obtener su info
      if (projectData.docenteId) {
        const docenteDoc = await getDoc(doc(db, "users", projectData.docenteId));
        if (docenteDoc.exists()) {
          return `${docenteDoc.data().nombre} ${docenteDoc.data().apellido || ''}`.trim();
        }
      }
      
      // Si no se encuentra docente, retorna "No asignado"
      return "No asignado";
    } catch (error) {
      // Captura y loguea errores de consulta
      console.error("Error obteniendo docente:", error);
      return "Error cargando docente";
    }
  };

  // useEffect para cargar proyectos al montar el componente
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Obtener todos los documentos de la colección "projects"
        const querySnapshot = await getDocs(collection(db, "projects"));
        const projectsList = [];
        const docentesSet = new Set(); // Para docentes únicos
        const institucionesSet = new Set(); // Para instituciones únicas

        // Procesar cada proyecto
        for (const docSnapshot of querySnapshot.docs) {
          const projectData = docSnapshot.data();
          
          // Obtener docente responsable para el proyecto
          const docenteResponsable = await getDocenteResponsable(projectData);
          
          // Construir objeto de proyecto con info relevante y docente
          const project = {
            id: docSnapshot.id,
            ...projectData,
            docenteResponsable,
            estado: projectData.estado || "No especificado"
          };

          projectsList.push(project);
          
          // Agregar docentes e instituciones únicos a sus sets
          if (docenteResponsable !== "No asignado") {
            docentesSet.add(docenteResponsable);
          }
          if (projectData.institucion) {
            institucionesSet.add(projectData.institucion);
          }
        }

        // Guardar datos en estados para renderizado y filtros
        setProjects(projectsList);
        setDocentesUnicos(["Todos", ...Array.from(docentesSet).sort()]);
        setInstitucionesUnicas(["Todos", ...Array.from(institucionesSet).sort()]);
      } catch (error) {
        console.error("Error al obtener proyectos:", error);
      } finally {
        // Finalizar carga
        setLoading(false);
      }
    };

    fetchProjects();
  }, []); // Solo se ejecuta una vez al montar

  // Filtrado de proyectos basado en búsqueda y selección de filtros
  const proyectosFiltrados = projects.filter((project) => {
    const tituloMatch = project.titulo?.toLowerCase().includes(busquedaTitulo.toLowerCase());
    const docenteMatch = docenteSeleccionado === "Todos" || 
                       project.docenteResponsable === docenteSeleccionado;
    const institucionMatch = institucionSeleccionada === "Todos" || 
                           project.institucion === institucionSeleccionada;
    return tituloMatch && docenteMatch && institucionMatch;
  });

  // Mostrar mensaje de carga mientras se obtienen datos
  if (loading) return <p className="loading">Cargando proyectos...</p>;

  return (
    <div className="project-list">
      {/* Botón para volver al dashboard */}
      <button onClick={() => navigate("/dashboard")} className="back-btn">
        ← Volver al Dashboard
      </button>

      <h1 className="list-title">Lista de Proyectos</h1>

      {/* Filtros de búsqueda */}
      <div className="search-filters">
        {/* Input para buscar por título */}
        <input
          type="text"
          placeholder="Buscar por título"
          value={busquedaTitulo}
          onChange={(e) => setBusquedaTitulo(e.target.value)}
          className="search-input"
        />

        {/* Selector para filtrar por docente */}
        <select
          value={docenteSeleccionado}
          onChange={(e) => setDocenteSeleccionado(e.target.value)}
          className="search-select"
        >
          {docentesUnicos.map((docente, index) => (
            <option key={index} value={docente}>
              {docente === "Todos" ? "Todos los docentes" : docente}
            </option>
          ))}
        </select>

        {/* Selector para filtrar por institución */}
        <select
          value={institucionSeleccionada}
          onChange={(e) => setInstitucionSeleccionada(e.target.value)}
          className="search-select"
        >
          {institucionesUnicas.map((institucion, index) => (
            <option key={index} value={institucion}>
              {institucion === "Todos" ? "Todas las instituciones" : institucion}
            </option>
          ))}
        </select>
      </div>

      {/* Mostrar mensaje si no hay proyectos filtrados */}
      {proyectosFiltrados.length === 0 ? (
        <p className="no-projects">No hay proyectos disponibles.</p>
      ) : (
        // Lista de tarjetas de proyectos con enlace a detalle
        <ul className="project-cards">
          {proyectosFiltrados.map((project) => (
            <li key={project.id} className="project-card">
              <Link to={`/projects/${project.id}`}>
                <h3 className="project-title">{project.titulo}</h3>
                <p className="project-meta">
                  <strong>Docente responsable:</strong> {project.docenteResponsable}
                </p>
                <p className="project-meta">
                  <strong>Área:</strong> {project.area || "No especificada"}
                </p>
                <p className="project-meta">
                  <strong>Institución:</strong> {project.institucion || "No especificada"}
                </p>
                <p className="project-meta">
                  <strong>Estado:</strong> 
                  {/* Badge con estilo según estado */}
                  <span className={`status-badge ${project.estado.toLowerCase().replace(/\s+/g, '-')}`}>
                    {project.estado}
                  </span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProjectList;
