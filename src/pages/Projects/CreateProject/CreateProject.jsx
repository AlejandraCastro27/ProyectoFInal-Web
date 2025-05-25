// Importación de librerías y módulos necesarios
import React, { useState, useEffect } from "react";
import { collection, addDoc, Timestamp, getDocs } from "firebase/firestore";
import { db, storage } from "../../../config/firebase";
import { useAuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./CreateProject.css";

// Componente principal CreateProject
const CreateProject = () => {
  // Obtenemos el usuario actual desde el contexto de autenticación
  const { currentUser } = useAuthContext();
  const navigate = useNavigate();

  // Estado para almacenar la lista de usuarios obtenida de Firestore
  const [usuarios, setUsuarios] = useState([]);

  // Estado del formulario con todos los campos necesarios para un proyecto
  const [form, setForm] = useState({
    titulo: "",
    area: "",
    objetivoGeneral: "",
    objetivosEspecificos: [""],
    institucion: "",
    presupuesto: "",
    inicio: "",
    fin: "",
    hitos: [{ nombre: "", fecha: "", imagen: null, documento: null }],
    observaciones: "",
    miembros: [{ userId: "", rol: "docente" }],
  });

  // useEffect para cargar la lista de usuarios al cargar el componente
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        // Se obtienen todos los documentos de la colección "users"
        const querySnapshot = await getDocs(collection(db, "users"));
        // Se mapean los datos a un nuevo formato con id, nombre y rol
        const listaUsuarios = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            nombre: data.nombre || data.email || "Usuario sin nombre",
            rol: data.rol ? data.rol : "estudiante", 
          };
        });
        setUsuarios(listaUsuarios);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    };
    fetchUsuarios();
  }, []);

  // Función para manejar cambios simples en los inputs del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Maneja el cambio de un objetivo específico en la lista
  const handleObjetivoChange = (index, value) => {
    const nuevos = [...form.objetivosEspecificos];
    nuevos[index] = value;
    setForm({ ...form, objetivosEspecificos: nuevos });
  };

  // Agrega un nuevo campo de objetivo específico
  const addObjetivoEspecifico = () => {
    setForm((prev) => ({
      ...prev,
      objetivosEspecificos: [...prev.objetivosEspecificos, ""],
    }));
  };

  // Maneja el cambio de cualquier campo dentro de un hito
  const handleHitoChange = (index, key, value) => {
    const nuevos = [...form.hitos];
    nuevos[index][key] = value;
    setForm({ ...form, hitos: nuevos });
  };

  // Agrega un nuevo hito al formulario
  const addHito = () => {
    setForm((prev) => ({
      ...prev,
      hitos: [...prev.hitos, { nombre: "", fecha: "", imagen: null, documento: null }],
    }));
  };

  // Maneja la carga de archivos (imagen o documento) para un hito
  const handleFileChange = (index, fileType, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const nuevos = [...form.hitos];
    nuevos[index][fileType] = file;
    setForm({ ...form, hitos: nuevos });
  };

  // Maneja el cambio de datos para un miembro del proyecto
  const handleMiembroChange = (index, key, value) => {
    const nuevosMiembros = [...form.miembros];
    nuevosMiembros[index][key] = value;
    setForm({ ...form, miembros: nuevosMiembros });
  };

  // Agrega un nuevo miembro al proyecto
  const addMiembro = () => {
    setForm((prev) => ({
      ...prev,
      miembros: [...prev.miembros, { userId: "", rol: "docente" }],
    }));
  };

  // Maneja el envío del formulario para crear el proyecto
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Procesamiento de cada hito para subir archivos (imagen y documento)
      const hitosWithFiles = await Promise.all(
        form.hitos.map(async (hito, index) => {
          let imagenUrl = null;
          let documentoUrl = null;

          // Subir imagen si existe y validar tipo de archivo
          if (hito.imagen) {
            const ext = hito.imagen.name.split(".").pop().toLowerCase();
            const allowedImg = ["jpg", "jpeg", "png", "webp", "svg"];
            if (!allowedImg.includes(ext)) {
              throw new Error(`Formato de imagen no permitido en el hito ${index + 1}.`);
            }
            const imagenRef = ref(storage, `hitos/${Date.now()}_${hito.imagen.name}`);
            await uploadBytes(imagenRef, hito.imagen);
            imagenUrl = await getDownloadURL(imagenRef);
          }

          // Subir documento si existe y validar tipo de archivo
          if (hito.documento) {
            const ext = hito.documento.name.split(".").pop().toLowerCase();
            const allowedDoc = ["pdf", "docx", "doc", "pptx", "ppt"];
            if (!allowedDoc.includes(ext)) {
              throw new Error(`Formato de documento no permitido en el hito ${index + 1}.`);
            }
            const documentoRef = ref(storage, `hitos/${Date.now()}_${hito.documento.name}`);
            await uploadBytes(documentoRef, hito.documento);
            documentoUrl = await getDownloadURL(documentoRef);
          }

          // Retornar el hito con las URLs de los archivos
          return {
            ...hito,
            imagen: imagenUrl,
            documento: documentoUrl,
          };
        })
      );

      // Crear el objeto final del proyecto a guardar en Firestore
      const proyecto = {
        titulo: form.titulo,
        area: form.area,
        objetivos: {
          general: form.objetivoGeneral,
          especificos: form.objetivosEspecificos,
        },
        cronograma: {
          inicio: Timestamp.fromDate(new Date(form.inicio)),
          fin: Timestamp.fromDate(new Date(form.fin)),
          hitos: hitosWithFiles.map((h) => ({
            nombre: h.nombre,
            fecha: Timestamp.fromDate(new Date(h.fecha)),
            imagen: h.imagen,
            documento: h.documento,
          })),
        },
        presupuesto: Number(form.presupuesto),
        institucion: form.institucion,
        docenteId: currentUser.uid,
        estado: "formulacion",
        fechaCreacion: Timestamp.now(),
        observaciones: form.observaciones,
        miembros: form.miembros,
      };

      // Guardar el proyecto en la colección "projects"
      await addDoc(collection(db, "projects"), proyecto);

      alert("Proyecto creado exitosamente.");
      
      // Reiniciar formulario a valores iniciales
      setForm({
        titulo: "",
        area: "",
        objetivoGeneral: "",
        objetivosEspecificos: [""],
        institucion: "",
        presupuesto: "",
        inicio: "",
        fin: "",
        hitos: [{ nombre: "", fecha: "", imagen: null, documento: null }],
        observaciones: "",
        miembros: [{ userId: "", rol: "docente" }],
      });

    } catch (error) {
      console.error("Error al crear proyecto:", error);
      alert(`Error al crear el proyecto: ${error.message}`);
    }
  };

  // Renderizado del formulario en JSX
  return (
    <div className="create-project">
      {/* Botón para volver al dashboard */}
      <button onClick={() => navigate("/dashboard")} className="back-btn">
        ← Volver al Dashboard
      </button>

      <h1>Crear Proyecto</h1>

      <form onSubmit={handleSubmit}>
        {/* Campos del formulario */}
        {/* Título */}
        <label>Título</label>
        <input name="titulo" value={form.titulo} onChange={handleChange} required />

        {/* Área */}
        <label>Área</label>
        <input name="area" value={form.area} onChange={handleChange} required />

        {/* Objetivo general */}
        <label>Objetivo General</label>
        <textarea
          name="objetivoGeneral"
          value={form.objetivoGeneral}
          onChange={handleChange}
          required
        />

        {/* Objetivos específicos dinámicos */}
        <label>Objetivos Específicos</label>
        {form.objetivosEspecificos.map((obj, index) => (
          <input
            key={index}
            value={obj}
            onChange={(e) => handleObjetivoChange(index, e.target.value)}
            placeholder={`Objetivo ${index + 1}`}
          />
        ))}
        <button type="button" onClick={addObjetivoEspecifico}>
          + Añadir objetivo específico
        </button>

        {/* Institución */}
        <label>Institución</label>
        <input name="institucion" value={form.institucion} onChange={handleChange} required />

        {/* Presupuesto */}
        <label>Presupuesto (COP)</label>
        <input
          type="number"
          name="presupuesto"
          value={form.presupuesto}
          onChange={handleChange}
          required
        />

        {/* Fechas */}
        <label>Fecha de Inicio</label>
        <input type="date" name="inicio" value={form.inicio} onChange={handleChange} required />

        <label>Fecha de Finalización</label>
        <input type="date" name="fin" value={form.fin} onChange={handleChange} required />

        {/* Sección de hitos */}
        <label>Hitos</label>
        {form.hitos.map((hito, index) => (
          <div key={index}>
            <input
              placeholder="Nombre del hito"
              value={hito.nombre}
              onChange={(e) => handleHitoChange(index, "nombre", e.target.value)}
            />
            <input
              type="date"
              value={hito.fecha}
              onChange={(e) => handleHitoChange(index, "fecha", e.target.value)}
            />
            <label>Imagen</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(index, "imagen", e)}
            />
            <label>Documento</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx"
              onChange={(e) => handleFileChange(index, "documento", e)}
            />
          </div>
        ))}
        <button type="button" onClick={addHito}>
          + Añadir Hito
        </button>

        {/* Observaciones */}
        <label>Observaciones</label>
        <textarea
          name="observaciones"
          value={form.observaciones}
          onChange={handleChange}
        />

        {/* Miembros del proyecto */}
        <label>Miembros</label>
        {form.miembros.map((miembro, index) => {
          // Filtrar usuarios por el rol seleccionado en ese miembro
          const usuariosFiltrados = usuarios.filter((u) => u.rol === miembro.rol);

          return (
            <div key={index} style={{ marginBottom: "10px" }}>
              <select
                value={miembro.userId}
                onChange={(e) => handleMiembroChange(index, "userId", e.target.value)}
                required
              >
                <option value="">Seleccione un usuario</option>
                {usuariosFiltrados.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre} ({u.rol})
                  </option>
                ))}
              </select>

              <select
                value={miembro.rol}
                onChange={(e) => handleMiembroChange(index, "rol", e.target.value)}
                style={{ marginLeft: "10px" }}
              >
                <option value="docente">Docente</option>
                <option value="estudiante">Estudiante</option>
              </select>
            </div>
          );
        })}
        <button type="button" onClick={addMiembro}>
          + Añadir Miembro
        </button>

        {/* Botón para enviar el formulario */}
        <button type="submit">Crear Proyecto</button>
      </form>
    </div>
  );
};

export default CreateProject;
