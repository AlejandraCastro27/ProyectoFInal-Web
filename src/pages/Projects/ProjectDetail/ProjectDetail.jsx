import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../config/firebase";
import "./ProjectDetail.css"; // Asegúrate de que esta ruta sea correcta

const ProjectDetail = ({ rol = "docente" }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proyecto, setProyecto] = useState(null);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState(null);

  const puedeEditar = rol === "docente" || rol === "coordinador";

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const docRef = doc(db, "projects", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProyecto({ id: docSnap.id, ...data });
          setForm(data);
        } else {
          console.error("Proyecto no encontrado");
        }
      } catch (err) {
        console.error("Error cargando proyecto:", err);
      }
    };

    fetchProject();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuardar = async () => {
    const docRef = doc(db, "projects", id);
    await updateDoc(docRef, form);
    alert("Proyecto actualizado");
    setProyecto({ ...proyecto, ...form });
    setEditando(false);
  };

  const handleEliminar = async () => {
    if (window.confirm("¿Seguro que deseas eliminar este proyecto?")) {
      await deleteDoc(doc(db, "projects", id));
      alert("Proyecto eliminado");
      navigate("/projects");
    }
  };

  const formatDate = (timestamp) => {
    try {
      return timestamp?.toDate().toLocaleDateString();
    } catch {
      return "Fecha inválida";
    }
  };

  if (!proyecto) return <p>Cargando...</p>;

  return (
    <div className="project-detail">
      <button className="back-button" onClick={() => navigate("/projects")}>← Volver</button>

      {editando ? (
        <div>
          <h3>Editando Proyecto</h3>
          <input name="titulo" value={form.titulo || ""} onChange={handleChange} />
          <input name="area" value={form.area || ""} onChange={handleChange} />
          <textarea name="objetivoGeneral" value={form.objetivoGeneral || ""} onChange={handleChange} />
          <textarea name="observaciones" value={form.observaciones || ""} onChange={handleChange} />
          <button onClick={handleGuardar}>Guardar</button>
          <button onClick={() => setEditando(false)}>Cancelar</button>
        </div>
      ) : (
        <div>
          <h2>{proyecto.titulo}</h2>
          <p><strong>Área:</strong> {proyecto.area}</p>
          <p><strong>Institución:</strong> {proyecto.institucion}</p>
          <p><strong>Docente ID:</strong> {proyecto.docenteId}</p>
          <p><strong>Estado:</strong> {proyecto.estado}</p>
          <p><strong>Fecha de Creación:</strong> {formatDate(proyecto.fechaCreacion)}</p>
          <p><strong>Presupuesto:</strong> ${proyecto.presupuesto?.toLocaleString("es-CO")}</p>

          <div>
            <strong>Objetivos:</strong>
            <p><em>General:</em> {proyecto.objetivos?.general}</p>
            <ul>
              {proyecto.objetivos?.especificos?.map((esp, idx) => (
                <li key={idx}>{esp}</li>
              ))}
            </ul>
          </div>

          <div>
            <strong>Cronograma:</strong>
            <p><em>Inicio:</em> {formatDate(proyecto.cronograma?.inicio)}</p>
            <p><em>Fin:</em> {formatDate(proyecto.cronograma?.fin)}</p>
            <ul>
              {proyecto.cronograma?.hitos?.map((hito, idx) => (
                <li key={idx}>
                  {hito.nombre} - {formatDate(hito.fecha)}
                </li>
              ))}
            </ul>
          </div>

          <p><strong>Observaciones:</strong> {proyecto.observaciones}</p>

          <div>
            <strong>Miembros:</strong>
            <ul>
              {proyecto.miembros?.map((miembro, idx) => (
                <li key={idx}>
                  {miembro.userId} - {miembro.role}
                </li>
              ))}
            </ul>
          </div>

          {puedeEditar && (
            <>
              <button onClick={() => setEditando(true)}>Editar</button>
              <button onClick={handleEliminar}>Eliminar</button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
