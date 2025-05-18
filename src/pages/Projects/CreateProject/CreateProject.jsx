import React, { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db, storage } from "../../../config/firebase";
import { useAuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./CreateProject.css";

const CreateProject = () => {
  const { currentUser } = useAuthContext();
  const navigate = useNavigate();

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
    miembros: [{ userId: "", role: "docente" }],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleObjetivoChange = (index, value) => {
    const nuevos = [...form.objetivosEspecificos];
    nuevos[index] = value;
    setForm({ ...form, objetivosEspecificos: nuevos });
  };

  const addObjetivoEspecifico = () => {
    setForm((prev) => ({
      ...prev,
      objetivosEspecificos: [...prev.objetivosEspecificos, ""],
    }));
  };

  const handleHitoChange = (index, key, value) => {
    const nuevos = [...form.hitos];
    nuevos[index][key] = value;
    setForm({ ...form, hitos: nuevos });
  };

  const addHito = () => {
    setForm((prev) => ({
      ...prev,
      hitos: [...prev.hitos, { nombre: "", fecha: "", imagen: null, documento: null }],
    }));
  };

  const handleFileChange = (index, fileType, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const nuevos = [...form.hitos];
    nuevos[index][fileType] = file;
    setForm({ ...form, hitos: nuevos });
  };

  const handleMiembroChange = (index, key, value) => {
    const nuevosMiembros = [...form.miembros];
    nuevosMiembros[index][key] = value;
    setForm({ ...form, miembros: nuevosMiembros });
  };

  const addMiembro = () => {
    setForm((prev) => ({
      ...prev,
      miembros: [...prev.miembros, { userId: "", role: "docente" }],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const hitosWithFiles = await Promise.all(
        form.hitos.map(async (hito, index) => {
          let imagenUrl = null;
          let documentoUrl = null;

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

          return {
            ...hito,
            imagen: imagenUrl,
            documento: documentoUrl,
          };
        })
      );

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

      await addDoc(collection(db, "projects"), proyecto);

      alert("Proyecto creado exitosamente.");
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
        miembros: [{ userId: "", role: "docente" }],
      });
    } catch (error) {
      console.error("Error al crear proyecto:", error);
      alert(`Error al crear el proyecto: ${error.message}`);
    }
  };

  return (
    <div className="create-project">
      <button onClick={() => navigate("/dashboard")} className="back-btn">
        ← Volver al Dashboard
      </button>

      <h1>Crear Proyecto</h1>
      <form onSubmit={handleSubmit}>
        <label>Título</label>
        <input name="titulo" value={form.titulo} onChange={handleChange} required />

        <label>Área</label>
        <input name="area" value={form.area} onChange={handleChange} required />

        <label>Objetivo General</label>
        <textarea name="objetivoGeneral" value={form.objetivoGeneral} onChange={handleChange} required />

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

        <label>Institución</label>
        <input name="institucion" value={form.institucion} onChange={handleChange} required />

        <label>Presupuesto (COP)</label>
        <input type="number" name="presupuesto" value={form.presupuesto} onChange={handleChange} required />

        <label>Fecha de Inicio</label>
        <input type="date" name="inicio" value={form.inicio} onChange={handleChange} required />

        <label>Fecha de Finalización</label>
        <input type="date" name="fin" value={form.fin} onChange={handleChange} required />

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
            <input type="file" accept="image/*" onChange={(e) => handleFileChange(index, "imagen", e)} />
            <label>Documento</label>
            <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={(e) => handleFileChange(index, "documento", e)} />
          </div>
        ))}
        <button type="button" onClick={addHito}>
          + Añadir hito
        </button>

        <label>Miembros</label>
        {form.miembros.map((miembro, index) => (
          <div key={index}>
            <input
              type="text"
              placeholder="ID del miembro"
              value={miembro.userId}
              onChange={(e) => handleMiembroChange(index, "userId", e.target.value)}
            />
            <select
              value={miembro.role}
              onChange={(e) => handleMiembroChange(index, "role", e.target.value)}
            >
              <option value="docente">Docente</option>
              <option value="estudiante">Estudiante</option>
            </select>
          </div>
        ))}
        <button type="button" onClick={addMiembro}>
          + Añadir miembro
        </button>

        <label>Observaciones</label>
        <textarea name="observaciones" value={form.observaciones} onChange={handleChange} />

        <button type="submit">Guardar Proyecto</button>
      </form>
    </div>
  );
};

export default CreateProject;
