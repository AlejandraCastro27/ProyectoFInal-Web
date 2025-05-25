📚 Proyecto Final - Gestión de Proyectos Escolares
MERN Stack
Firebase
Responsive

Plataforma web para el registro, seguimiento y evaluación de proyectos escolares de investigación, diseñada para estudiantes, docentes y coordinadores.

🚀 Características principales
Roles de usuario: Accesos diferenciados para estudiantes, docentes y coordinadores

Gestión completa: Desde formulación hasta evaluación final de proyectos

Seguimiento en tiempo real: Registro de hitos con evidencias multimedia

Reportes automatizados: Generación de documentos PDF con un clic

Notificaciones: Alertas sobre cambios importantes en los proyectos

🛠 Tecnologías utilizadas
Frontend
Tecnología	Uso
React.js	Librería principal
Material-UI (MUI)	Componentes UI
Chart.js	Visualización de datos
react-router-dom	Navegación
Backend
Tecnología	Uso
Node.js	Entorno de ejecución
Express.js	Framework backend
Firebase Auth	Autenticación
Firestore	Base de datos NoSQL
Utilidades
jsPDF: Generación de reportes en PDF

react-chartjs-2: Gráficos y estadísticas

Firebase Storage: Almacenamiento de archivos

⚙️ Instalación y configuración
Clonar repositorio

bash
git clone https://github.com/AlejandraCastro27/ProyectoFInal-Web.git
cd ProyectoFInal-Web
Instalar dependencias

bash
npm install
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material react-router-dom firebase
npm install react-chartjs-2 chart.js
npm install jspdf jspdf-autotable
Configurar variables de entorno
Crear archivo .env.local en la raíz del proyecto con:

env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_dominio.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
Iniciar aplicación

bash
npm run dev
📂 Estructura del proyecto
src/
├── components/    # Componentes reutilizables
│   ├── auth/      # Formularios de autenticación
│   ├── projects/  # Componentes de gestión de proyectos
│   └── ui/        # Componentes de interfaz
├── config/        # Configuración de Firebase
├── context/       # Contextos de React (Auth, Projects)
├── hooks/         # Hooks personalizados
├── pages/         # Vistas principales
│   ├── Admin/     # Panel de administración
│   ├── Auth/      # Páginas de autenticación
│   └── Projects/  # Gestión de proyectos
├── routes/        # Configuración de enrutamiento
├── services/      # Lógica de servicios
└── utils/         # Utilidades y constantes
🔍 Funcionalidades clave
Para todos los usuarios
Autenticación segura con Firebase

Visualización de proyectos asignados

Registro de avances con evidencias

Para estudiantes
Creación de nuevos proyectos

Registro de hitos y avances

Carga de documentos y fotos

Para docentes
Aprobación de proyectos

Asignación de calificaciones

Generación de reportes

Para coordinadores
Gestión completa de usuarios

Cambio de estados de proyectos

Visualización de métricas globales

Contacto
Para dudas o colaboración: Maleja2023 - AlejandraCastro27
