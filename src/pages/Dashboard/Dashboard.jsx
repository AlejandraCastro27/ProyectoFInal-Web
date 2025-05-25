// Importa el contexto de autenticación para acceder al usuario actual
import { useAuthContext } from '../../context/AuthContext';
import Layout from '../../components/ui/Layout';
import { CircularProgress, Box, Typography, Paper } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';

export default function Dashboard() {
  // Extrae el usuario actual del contexto
  const { currentUser } = useAuthContext();

  // Si no hay usuario cargado, muestra un mensaje de carga
  if (!currentUser) {
    return (
      <Layout>
        <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress color="primary" size={60} thickness={5} />
            <Typography sx={{ mt: 2, fontFamily: 'Baloo 2', fontWeight: 600, color: 'primary.main' }}>
              Cargando usuario...
            </Typography>
          </Box>
        </Box>
      </Layout>
    );
  }

  // Verifica el rol del usuario
  const isCoordinador = currentUser.rol === "coordinador";
  const isDocente = currentUser.rol === "docente";

  return (
    <Layout>
      <Box sx={{ width: '100%', p: { xs: 2, md: 4 }, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 4 }}>
        {/* Ilustración escolar SVG */}
        <Box sx={{ flex: '0 0 auto', width: { xs: '100%', md: 340 }, maxWidth: 340, mb: { xs: 3, md: 0 } }}>
          <img
            src="https://static9.depositphotos.com/1441191/1196/v/450/depositphotos_11962793-stock-illustration-kids-studying-on-tree.jpg"
            alt="Ilustración escolar infantil"
            style={{ width: '100%', borderRadius: 24, boxShadow: '0 4px 24px 0 #d0f5c6' }}
          />
        </Box>
        {/* Saludo y mensaje */}
        <Paper elevation={3} sx={{ flex: 1, p: { xs: 2, md: 4 }, borderRadius: 4, background: 'linear-gradient(90deg, #E7F9E9 0%, #F7F7F7 100%)', boxShadow: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <SchoolIcon sx={{ fontSize: 48, color: '#58CC02' }} />
            <Typography variant="h3" sx={{ fontWeight: 700, fontFamily: 'Baloo 2', color: '#222' }}>
              Bienvenido, {currentUser.nombre} {currentUser.apellido}
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ fontFamily: 'Comic Neue', color: '#444', mb: 1 }}>
            {isCoordinador && (
              <>Tienes acceso completo a la gestión de usuarios y proyectos.</>
            )}
            {isDocente && (
              <>Acceso a la creación de proyectos escolares y seguimiento.</>
            )}
          </Typography>
          <Typography variant="body1" sx={{ color: '#58CC02', fontWeight: 600, fontFamily: 'Comic Neue' }}>
            ¡Explora, crea y aprende con tu equipo!
          </Typography>
        </Paper>
      </Box>
    </Layout>
  );
}
