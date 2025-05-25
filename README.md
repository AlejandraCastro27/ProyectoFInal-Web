Proyecto Final - Programación Web
Descripción:
Aplicación web para el registro y seguimiento de proyectos escolares de investigación tipo Ondas Colciencias, con gestión de usuarios, proyectos, hitos y reportes.

Tecnologías
React.js + Material UI

Firebase (Firestore y Storage)

React Router

Chart.js

jsPDF

Funcionalidades principales
Registro e inicio de sesión para estudiantes, docentes y coordinadores.

Gestión completa de proyectos con objetivos, cronograma, presupuesto e integrantes.

Registro y seguimiento de hitos con documentos y fotos.

Control de estados y reportes en PDF.

Búsqueda y filtrado de proyectos.

Instalación
bash
Copiar
Editar
git clone https://github.com/AlejandraCastro27/ProyectoFInal-Web.git
cd ProyectoFInal-Web
npm install
npm run dev
Configurar credenciales Firebase en config/firebase.js

Estructura básica
/src/components - Componentes React

/src/pages - Vistas y páginas

/src/context - Contextos para estado global

/src/services - Comunicación con Firebase

/src/config/firebase.js - Configuración Firebase

Base de datos (Firestore)
users (usuarios con rol y datos)

projects (datos del proyecto)

milestones (hitos con documentos y fotos)

project_history (historial de estados)

Contacto
Para dudas o colaboración: Maleja2023 - AlejandraCastro27
