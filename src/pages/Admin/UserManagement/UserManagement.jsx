import React, { useState, useEffect } from "react";
import {
  getDocs,
  collection,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../config/firebase";
import { useNavigate } from "react-router-dom";
import Layout from '../../../components/ui/Layout';
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
  TextField,
  Button,
  IconButton,
  Select,
  MenuItem,
  InputAdornment,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const UserManagement = ({ currentUser }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({});
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const obtenerUsuarios = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsuarios(data);
      } catch (err) {
        console.error("Error al obtener usuarios:", err);
      }
    };
    obtenerUsuarios();
  }, []);

  const handleEditar = (user) => {
    setEditando(user.id);
    setForm({ ...user });
  };

  const handleCancelar = () => {
    setEditando(null);
    setForm({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "grado" || name === "telefono" ? Number(value) : value,
    }));
  };

  const handleGuardar = async () => {
    try {
      const ref = doc(db, "users", editando);
      await updateDoc(ref, form);
      setEditando(null);
      const querySnapshot = await getDocs(collection(db, "users"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsuarios(data);
    } catch (err) {
      console.error("Error al actualizar usuario:", err);
      alert("Error al actualizar");
    }
  };

  const handleEliminar = async (userId) => {
    if (userId === currentUser?.uid) {
      alert("No puedes eliminar tu propio usuario.");
      return;
    }
    const confirmar = window.confirm("¿Estás seguro de eliminar este usuario?");
    if (!confirmar) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      setUsuarios((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      alert("No se pudo eliminar");
    }
  };

  const usuariosFiltrados = usuarios.filter((u) =>
    u.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <Layout>
      <Box sx={{ width: '100%', m: 0, p: 0 }}>
        <Paper elevation={3} sx={{ width: '100%', p: { xs: 2, md: 3 }, borderRadius: 4, boxShadow: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
            <Typography variant="h4" sx={{ flexGrow: 1, fontWeight: 700, fontFamily: 'Baloo 2' }}>
              Gestión de Usuarios
            </Typography>
            <Button variant="outlined" color="primary" onClick={() => navigate("/dashboard")}
              sx={{ borderRadius: 2, fontWeight: 600 }}>
              ← Volver al Dashboard
            </Button>
          </Box>

          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3, borderRadius: 2, background: '#F7F7F7' }}
          />

          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader size={isMobile ? 'small' : 'medium'}>
              <TableHead>
                <TableRow>
                  <TableCell><b>Nombre</b></TableCell>
                  <TableCell><b>Apellido</b></TableCell>
                  <TableCell><b>Email</b></TableCell>
                  <TableCell><b>Rol</b></TableCell>
                  <TableCell><b>Institución</b></TableCell>
                  <TableCell><b>Grado</b></TableCell>
                  <TableCell><b>Teléfono</b></TableCell>
                  <TableCell align="center"><b>Acciones</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usuariosFiltrados.map((user) => (
                  <TableRow key={user.id} hover>
                    {editando === user.id ? (
                      <>
                        <TableCell>
                          <TextField name="nombre" value={form.nombre || ""} onChange={handleChange} size="small" fullWidth />
                        </TableCell>
                        <TableCell>
                          <TextField name="apellido" value={form.apellido || ""} onChange={handleChange} size="small" fullWidth />
                        </TableCell>
                        <TableCell>
                          <TextField name="email" value={form.email || ""} onChange={handleChange} size="small" fullWidth disabled />
                        </TableCell>
                        <TableCell>
                          <Select name="rol" value={form.rol || ""} onChange={handleChange} size="small" fullWidth>
                            <MenuItem value="estudiante">Estudiante</MenuItem>
                            <MenuItem value="docente">Docente</MenuItem>
                            <MenuItem value="coordinador">Coordinador</MenuItem>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <TextField name="institucion" value={form.institucion || ""} onChange={handleChange} size="small" fullWidth />
                        </TableCell>
                        <TableCell>
                          <TextField name="grado" type="number" value={form.grado || ""} onChange={handleChange} size="small" fullWidth />
                        </TableCell>
                        <TableCell>
                          <TextField name="telefono" value={form.telefono || ""} onChange={handleChange} size="small" fullWidth />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Guardar">
                            <IconButton color="success" onClick={handleGuardar}>
                              <SaveIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cancelar">
                            <IconButton color="error" onClick={handleCancelar}>
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{user.nombre}</TableCell>
                        <TableCell>{user.apellido}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.rol}</TableCell>
                        <TableCell>{user.institucion}</TableCell>
                        <TableCell>{user.grado}</TableCell>
                        <TableCell>{user.telefono}</TableCell>
                        <TableCell align="center">
                          <Tooltip title="Editar">
                            <IconButton color="primary" onClick={() => handleEditar(user)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          {user.id !== currentUser?.uid && (
                            <Tooltip title="Eliminar">
                              <IconButton color="error" onClick={() => handleEliminar(user.id)}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Layout>
  );
};

export default UserManagement;
