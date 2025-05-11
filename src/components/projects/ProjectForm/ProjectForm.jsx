// src/components/projects/ProjectForm/ProjectForm.jsx
import React, { useState } from "react";
import { useProjectContext } from "../../../context/ProjectContext";
import "./ProjectForm.css";

const ProjectForm = () => {
  const { addProject } = useProjectContext();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) return;

    await addProject({ title, description, createdAt: Date.now() });
    setTitle("");
    setDescription("");
  };

  return (
    <form onSubmit={handleSubmit} className="project-form">
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Nombre del proyecto"
        required
      />
      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Descripción"
        required
      />
      <button type="submit">Crear Proyecto</button>
    </form>
  );
};

export default ProjectForm;
