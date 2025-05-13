import React from "react";
import { useNavigate } from "react-router-dom"; // AÑADIR esto
import "./NotFound.css";

const NotFound = () => {
  const navigate = useNavigate(); // AÑADIR esto

  return (
    <div className="not-found">
      <button onClick={() => navigate("/dashboard")} className="back-btn">
        ← Volver al Dashboard
      </button>
      <h1>Página no encontrada</h1>
      <p>Lo sentimos, la página que buscas no existe.</p>
    </div>
  );
};

export default NotFound;
