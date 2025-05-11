// src/components/projects/ProjectList/ProjectList.jsx
import React from "react";
import { useProjectContext } from "../../../context/ProjectContext";
import "./ProjectList.css";

const ProjectList = () => {
  const { projects } = useProjectContext();

  return (
    <div className="project-list">
      {projects.map(project => (
        <div key={project.id} className="project-card">
          <h3>{project.title}</h3>
          <p>{project.description}</p>
        </div>
      ))}
    </div>
  );
};

export default ProjectList;
