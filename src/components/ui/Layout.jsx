import React from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  IconButton,
  Divider,
  Tooltip,
  ListItemButton,
} from '@mui/material';
import {
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  Add as AddIcon,
  Assessment as AssessmentIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';

const drawerWidth = 250;

const menuItems = [
  {
    text: 'Gestión de Usuarios',
    icon: <GroupIcon />,
    path: '/user-management',
    roles: ['coordinador']
  },
  {
    text: 'Proyectos',
    icon: <AssignmentIcon />,
    path: '/projects',
    roles: ['coordinador', 'docente', 'estudiante']
  },
  {
    text: 'Crear Proyecto',
    icon: <AddIcon />,
    path: '/projects/create',
    roles: ['coordinador']
  },
  {
    text: 'Reportes',
    icon: <AssessmentIcon />,
    path: '/reports',
    roles: ['coordinador']
  },
];

export default function Layout({ children }) {
  const { currentUser, logout } = useAuthContext();
  const navigate = useNavigate();

  // Filtrar items del menú según el rol del usuario
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(currentUser?.rol)
  );

  return (
    <>
      {/* Sidebar fijo */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100vh',
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #58CC02 0%, #7FE030 100%)',
            color: 'white',
            border: 'none',
          },
        }}
      >
        <Toolbar sx={{ minHeight: 80 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'Baloo 2', letterSpacing: 1 }}>
            Gestión de Proyectos
          </Typography>
        </Toolbar>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
        <List sx={{ mt: 2 }}>
          {filteredMenuItems.map((item) => (
            <ListItemButton
              key={item.text}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                mx: 1,
                my: 0.5,
                py: 1.5,
                px: 2,
                color: 'white',
                fontWeight: 600,
                fontFamily: 'Baloo 2',
                transition: 'background 0.2s',
                '&:hover': {
                  background: '#7FE030',
                  color: '#fff',
                },
                '&.Mui-selected, &.Mui-selected:hover': {
                  background: '#46A302',
                  color: '#fff',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{ fontWeight: 700, fontFamily: 'Baloo 2', fontSize: '1.08rem' }}
              />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* Área de contenido principal */}
      <Box
        sx={{
          minHeight: '100vh',
          background: '#F7F7F7',
          ml: { xs: 0, md: `${drawerWidth}px` },
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          transition: 'margin 0.3s, width 0.3s',
        }}
      >
        {/* Header dentro del área de contenido */}
        <AppBar
          position="static"
          sx={{
            background: '#fff',
            color: '#58CC02',
            boxShadow: '0 2px 8px rgba(88,204,2,0.08)',
            zIndex: 1201,
          }}
          elevation={1}
        >
          <Toolbar sx={{ justifyContent: 'space-between', minHeight: 80 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'Baloo 2', color: '#58CC02' }}>
                Hola, {currentUser?.nombre || 'Usuario'}! <span role="img" aria-label="saludo">👋</span>
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Bienvenido tu dashboard, eres un{' '}
                <span style={{ color: '#58CC02', fontWeight: 700 }}>
                  {currentUser?.rol ? currentUser.rol.charAt(0).toUpperCase() + currentUser.rol.slice(1) : ''}
                </span>
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#58CC02', color: 'white', fontWeight: 700 }}>
                {currentUser?.nombre?.[0]?.toUpperCase() || 'U'}
                {currentUser?.apellido?.[0]?.toUpperCase() || ''}
              </Avatar>
              <Tooltip title="Cerrar sesión">
                <IconButton onClick={logout} sx={{ color: '#58CC02' }}>
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </AppBar>
        {/* Contenido principal */}
        <Box sx={{ width: '100%' }}>
          {children || <Outlet />}
        </Box>
      </Box>
    </>
  );
} 