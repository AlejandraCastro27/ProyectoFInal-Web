import React, { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { useAuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
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
    hitos: [{ nombre: "", fecha: "" }],
    observaciones: ""
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
      objetivosEspecificos: [...prev.objetivosEspecificos, ""]
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
      hitos: [...prev.hitos, { nombre: "", fecha: "" }]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
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
          hitos: form.hitos.map((h) => ({
            nombre: h.nombre,
            fecha: Timestamp.fromDate(new Date(h.fecha)),
          })),
        },
        presupuesto: Number(form.presupuesto),
        institucion: form.institucion,
        docenteId: currentUser.uid,
        estado: "formulacion",
        fechaCreacion: Timestamp.now(),
        observaciones: form.observaciones,
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
        hitos: [{ nombre: "", fecha: "" }],
        observaciones: ""
      });
    } catch (error) {
      console.error("Error al crear proyecto:", error);
      alert("Error al crear el proyecto");
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
          </div>
        ))}
        <button type="button" onClick={addHito}>
          + Añadir hito
        </button>

        <label>Observaciones</label>
        <textarea name="observaciones" value={form.observaciones} onChange={handleChange} />

        <button type="submit">Guardar Proyecto</button>
      </form>
    </div>
  );
};

export default CreateProject;
