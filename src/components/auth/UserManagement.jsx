import { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useAuthContext } from '../../context/AuthContext';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Button,
  Alert,
  Snackbar,
  Tooltip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';

const UserManagement = () => {
  const { currentUser } = useAuthContext();
  const [users, setUsers] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      setUsers(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    };
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (currentUser.rol === 'coordinador') {
      try {
        await deleteDoc(doc(db, 'users', userId));
        setUsers(users.filter(user => user.id !== userId));
        setSnackbar({
          open: true,
          message: '¡Usuario eliminado exitosamente!',
          severity: 'success'
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Error al eliminar usuario',
          severity: 'error'
        });
      }
    } else {
      setSnackbar({
        open: true,
        message: 'Solo los coordinadores pueden eliminar usuarios',
        severity: 'warning'
      });
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'coordinador':
        return <AdminIcon sx={{ color: 'primary.main' }} />;
      case 'profesor':
        return <SchoolIcon sx={{ color: 'secondary.main' }} />;
      default:
        return <PeopleIcon sx={{ color: 'text.secondary' }} />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 4,
          background: 'linear-gradient(145deg, #ffffff 0%, #f0f0f0 100%)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <PeopleIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            Gestión de Usuarios
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Nombre
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Email
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Rol
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="subtitle1" fontWeight="bold">
                    Acciones
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(user => (
                <TableRow
                  key={user.id}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <TableCell>{user.nombre}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getRoleIcon(user.rol)}
                      <Typography>{user.rol}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Eliminar usuario">
                      <IconButton
                        onClick={() => handleDeleteUser(user.id)}
                        color="error"
                        sx={{
                          '&:hover': {
                            backgroundColor: 'error.light',
                            color: 'white',
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement;
