*Proyecto Final - Gestión de Proyectos Escolares*

Descripción
Aplicación web para el registro y seguimiento de proyectos escolares de investigación, con funcionalidades para estudiantes, docentes y coordinadores. Desarrollado con el stack MERN (MongoDB, Express, React, Node.js) y Firebase.

Tecnologías
Frontend: React.js, Material-UI (MUI)

Backend: Node.js, Express.js

Base de datos: Firebase Firestore

Autenticación: Firebase Auth

Otras librerías: Chart.js, jsPDF, react-router-dom

Instalación
Clonar el repositorio:

bash
git clone https://github.com/AlejandraCastro27/ProyectoFInal-Web.git
cd ProyectoFInal-Web
Instalar dependencias:

bash
npm install
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material react-router-dom firebase
npm install react-chartjs-2 chart.js
npm install jspdf jspdf-autotable
Configurar variables de entorno:
Crear un archivo .env.local con las credenciales de Firebase.

Iniciar la aplicación:

bash
npm run dev

Estructura del Proyecto
src/
├── components/    # Componentes reutilizables
├── config/        # Configuración de Firebase
├── context/       # Contextos de React
├── hooks/         # Hooks personalizados
├── pages/         # Páginas principales
├── routes/        # Configuración de rutas
├── services/      # Lógica de servicios
└── utils/         # Utilidades y constantes
Funcionalidades Principales
Gestión de usuarios (estudiantes, docentes, coordinadores)

Creación y seguimiento de proyectos

Registro de hitos y avances

Visualización de proyectos con filtros

Generación de reportes en PDF

Cambio de estado de proyectos

Base de Datos
La aplicación utiliza Firebase Firestore con las siguientes colecciones principales:

users: Información de usuarios

projects: Detalles de proyectos

team_members: Integrantes de equipos

milestones: Hitos y avances

project_history: Historial de cambios

Despliegue
La aplicación está disponible en: 


Contacto
Para dudas o colaboración: Maleja2023 - AlejandraCastro27
