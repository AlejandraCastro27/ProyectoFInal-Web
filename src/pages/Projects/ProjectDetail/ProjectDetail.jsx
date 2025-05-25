import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../config/firebase";
import { useAuthContext } from "../../../context/AuthContext";
import Layout from '../../../components/ui/Layout';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Stack,
  useMediaQuery,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuthContext();
  const [proyecto, setProyecto] = useState(null);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Permisos por rol
  const permisos = {
    coordinador: {
      puedeEditar: true,
      campos: ['estado'],
      puedeEliminar: true,
      puedeAgregarHitos: false
    },
    docente: {
      puedeEditar: true,
      campos: ['titulo', 'area', 'objetivos', 'observaciones'],
      puedeEliminar: false,
      puedeAgregarHitos: true
    },
    estudiante: {
      puedeEditar: true,
      campos: ['titulo', 'area', 'objetivos', 'observaciones'],
      puedeEliminar: false,
      puedeAgregarHitos: true
    }
  };

  // Obtiene los permisos según el rol del usuario actual
  const permisosUsuario = currentUser?.rol ? permisos[currentUser.rol] : {
    puedeEditar: false,
    campos: [],
    puedeEliminar: false,
    puedeAgregarHitos: false
  };

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setCargando(true);
        const docRef = doc(db, "projects", id);
        const docSnap = await getDoc(docRef);
        console.log(docSnap.data());
        if (docSnap.exists()) {
          const data = docSnap.data();

          // Obtener nombres de los miembros del equipo
          const miembrosConNombres = await Promise.all(
            data.miembros?.map(async (miembro) => {
              try {
                const userDoc = await getDoc(doc(db, "users", miembro.userId));
                return {
                  ...miembro,
                  nombre: userDoc.exists() ? `${userDoc.data().nombre} ${userDoc.data().apellido || ''}`.trim() : "Usuario desconocido"
                };
              } catch (error) {
                console.error(`Error cargando usuario ${miembro.userId}:`, error);
                return {
                  ...miembro,
                  nombre: "Error cargando usuario"
                };
              }
            }) || []
          );

          // Separar docentes y estudiantes
          const docentes = miembrosConNombres.filter(m => m.rol === "docente");
          const estudiantes = miembrosConNombres.filter(m => m.rol === "estudiante");

          // El docente responsable es el primer docente de la lista o el docenteId
          let docenteResponsable = "No asignado";
          if (docentes.length > 0) {
            docenteResponsable = docentes[0].nombre;
          } else if (data.docenteId) {
            try {
              const docenteDoc = await getDoc(doc(db, "users", data.docenteId));
              docenteResponsable = docenteDoc.exists() ?
                `${docenteDoc.data().nombre} ${docenteDoc.data().apellido || ''}`.trim() :
                "Docente desconocido";
            } catch (error) {
              console.error("Error cargando docente:", error);
            }
          }

          // Cargar hitos del cronograma
          const hitosFormateados = data.cronograma?.hitos?.map((hito, index) => ({
            id: index,
            nombre: hito.nombre,
            fecha: hito.fecha,
            fechaFormateada: formatDate(hito.fecha),
            imagen: hito.imagen,
            documento: hito.documento
          })) || [];

          setProyecto({
            id: docSnap.id,
            ...data,
            miembros: miembrosConNombres,
            docentes: docentes,
            estudiantes: estudiantes,
            docenteResponsable: docenteResponsable,
            hitosFormateados: hitosFormateados
          });

          setForm({
            ...data,
            nuevosHitos: [] // Para manejar los hitos nuevos
          });
        } else {
          console.error("Proyecto no encontrado");
        }
      } catch (err) {
        console.error("Error cargando proyecto:", err);
      } finally {
        setCargando(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleObjetivoChange = (tipo, index = null, value) => {
    if (tipo === 'general') {
      setForm(prev => ({
        ...prev,
        objetivos: {
          ...prev.objetivos,
          general: value
        }
      }));
    } else if (tipo === 'especifico') {
      const nuevosEspecificos = [...(form.objetivos?.especificos || [])];
      nuevosEspecificos[index] = value;
      setForm(prev => ({
        ...prev,
        objetivos: {
          ...prev.objetivos,
          especificos: nuevosEspecificos
        }
      }));
    }
  };

  const addObjetivoEspecifico = () => {
    setForm(prev => ({
      ...prev,
      objetivos: {
        ...prev.objetivos,
        especificos: [...(prev.objetivos?.especificos || []), ""]
      }
    }));
  };

  const removeObjetivoEspecifico = (index) => {
    const nuevosEspecificos = form.objetivos?.especificos?.filter((_, i) => i !== index) || [];
    setForm(prev => ({
      ...prev,
      objetivos: {
        ...prev.objetivos,
        especificos: nuevosEspecificos
      }
    }));
  };

  const handleHitoChange = (index, key, value) => {
    const nuevosHitos = [...(form.nuevosHitos || [])];
    if (!nuevosHitos[index]) {
      nuevosHitos[index] = { nombre: "", fecha: "", imagen: null, documento: null };
    }
    nuevosHitos[index][key] = value;
    setForm({ ...form, nuevosHitos });
  };

  const addHito = () => {
    setForm(prev => ({
      ...prev,
      nuevosHitos: [...(prev.nuevosHitos || []), { nombre: "", fecha: "", imagen: null, documento: null }]
    }));
  };

  const removeHito = (index) => {
    const nuevosHitos = form.nuevosHitos?.filter((_, i) => i !== index) || [];
    setForm({ ...form, nuevosHitos });
  };

  const handleFileChange = (index, fileType, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const nuevosHitos = [...(form.nuevosHitos || [])];
    if (!nuevosHitos[index]) {
      nuevosHitos[index] = { nombre: "", fecha: "", imagen: null, documento: null };
    }
    nuevosHitos[index][fileType] = file;
    setForm({ ...form, nuevosHitos });
  };

  const handleGuardar = async () => {
    try {
      const actualizaciones = {};

      // Solo actualizar campos permitidos según el rol
      if (permisosUsuario.campos.includes('estado')) {
        actualizaciones.estado = form.estado;
      }
      if (permisosUsuario.campos.includes('titulo')) {
        actualizaciones.titulo = form.titulo;
      }
      if (permisosUsuario.campos.includes('area')) {
        actualizaciones.area = form.area;
      }
      if (permisosUsuario.campos.includes('objetivos')) {
        actualizaciones.objetivos = form.objetivos;
      }
      if (permisosUsuario.campos.includes('observaciones')) {
        actualizaciones.observaciones = form.observaciones;
      }

      // Procesar nuevos hitos si el usuario puede agregarlos
      if (permisosUsuario.puedeAgregarHitos && form.nuevosHitos?.length > 0) {
        const hitosExistentes = proyecto.cronograma?.hitos || [];

        // Subir archivos de los nuevos hitos
        const hitosConArchivos = await Promise.all(
          form.nuevosHitos.map(async (hito, index) => {
            if (!hito.nombre || !hito.fecha) return null; // Skip incomplete milestones

            let imagenUrl = null;
            let documentoUrl = null;

            if (hito.imagen) {
              const ext = hito.imagen.name.split(".").pop().toLowerCase();
              const allowedImg = ["jpg", "jpeg", "png", "webp", "svg"];
              if (!allowedImg.includes(ext)) {
                throw new Error(`Formato de imagen no permitido en el hito ${index + 1}.`);
              }
              const imagenRef = ref(storage, `hitos/${Date.now()}_${hito.imagen.name}`);
              await uploadBytes(imagenRef, hito.imagen);
              imagenUrl = await getDownloadURL(imagenRef);
            }

            if (hito.documento) {
              const ext = hito.documento.name.split(".").pop().toLowerCase();
              const allowedDoc = ["pdf", "docx", "doc", "pptx", "ppt"];
              if (!allowedDoc.includes(ext)) {
                throw new Error(`Formato de documento no permitido en el hito ${index + 1}.`);
              }
              const documentoRef = ref(storage, `hitos/${Date.now()}_${hito.documento.name}`);
              await uploadBytes(documentoRef, hito.documento);
              documentoUrl = await getDownloadURL(documentoRef);
            }

            return {
              nombre: hito.nombre,
              fecha: Timestamp.fromDate(new Date(hito.fecha)),
              imagen: imagenUrl,
              documento: documentoUrl,
            };
          })
        );

        // Filtrar hitos válidos
        const hitosValidos = hitosConArchivos.filter(hito => hito !== null);

        if (hitosValidos.length > 0) {
          actualizaciones.cronograma = {
            ...proyecto.cronograma,
            hitos: [...hitosExistentes, ...hitosValidos]
          };
        }
      }

      const docRef = doc(db, "projects", id);
      await updateDoc(docRef, actualizaciones);

      alert("Proyecto actualizado exitosamente");

      // Recargar los datos del proyecto
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProyecto(prev => ({ ...prev, ...data }));
        setForm(prev => ({ ...prev, ...data, nuevosHitos: [] }));
      }

      setEditando(false);
    } catch (error) {
      console.error("Error actualizando proyecto:", error);
      alert(`Error al actualizar el proyecto: ${error.message}`);
    }
  };

  const handleEliminar = async () => {
    if (window.confirm("¿Seguro que deseas eliminar este proyecto?")) {
      try {
        await deleteDoc(doc(db, "projects", id));
        alert("Proyecto eliminado");
        navigate("/projects");
      } catch (error) {
        console.error("Error eliminando proyecto:", error);
        alert("Error al eliminar el proyecto");
      }
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "No especificada";

    try {
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString("es-ES", {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString("es-ES", {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      if (typeof timestamp === 'string') {
        return new Date(timestamp).toLocaleDateString("es-ES", {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      return "Formato inválido";
    } catch {
      return "Fecha inválida";
    }
  };

  const estadosDisponibles = ["formulacion", "evaluacion", "activo", "inactivo", "finalizado"];

  if (cargando) return (
    <Layout>
      <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress color="primary" size={60} thickness={5} />
          <Typography sx={{ mt: 2, fontFamily: 'Baloo 2', fontWeight: 600, color: 'primary.main' }}>
            Cargando proyecto...
          </Typography>
        </Box>
      </Box>
    </Layout>
  );

  if (!proyecto) return <p className="error-message">Proyecto no encontrado</p>;

  return (
    <Layout>
      <Box sx={{ width: '100%', p: { xs: 1, md: 3 } }}>
        <Paper elevation={3} sx={{ width: '100%', p: { xs: 2, md: 3 }, borderRadius: 4, boxShadow: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
            <Typography variant="h4" sx={{ flexGrow: 1, fontWeight: 700, fontFamily: 'Baloo 2' }}>
              {editando ? (
                <TextField
                  fullWidth
                  name="titulo"
                  value={form.titulo}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              ) : (
                proyecto.titulo
              )}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate("/projects")}
                startIcon={<ArrowBackIcon />}
                sx={{ borderRadius: 2 }}
              >
                Volver
              </Button>
              {permisosUsuario.puedeEditar && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setEditando(!editando)}
                  startIcon={editando ? <CancelIcon /> : <EditIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  {editando ? "Cancelar" : "Editar"}
                </Button>
              )}
              {permisosUsuario.puedeEliminar && (
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => setConfirmarEliminar(true)}
                  startIcon={<DeleteIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  Eliminar
                </Button>
              )}
            </Box>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                  Información General
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Estado</Typography>
                    {editando && permisosUsuario.campos.includes('estado') ? (
                      <FormControl fullWidth>
                        <Select
                          value={form.estado}
                          onChange={handleChange}
                          name="estado"
                        >
                          {estadosDisponibles.map(estado => (
                            <MenuItem key={estado} value={estado}>
                              {estado.charAt(0).toUpperCase() + estado.slice(1)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <Chip
                        label={proyecto.estado}
                        color={
                          proyecto.estado === 'completado'
                            ? 'success'
                            : proyecto.estado === 'en proceso'
                            ? 'warning'
                            : 'error'
                        }
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Área</Typography>
                    {editando && permisosUsuario.campos.includes('area') ? (
                      <TextField
                        fullWidth
                        name="area"
                        value={form.area}
                        onChange={handleChange}
                        variant="outlined"
                        size="small"
                      />
                    ) : (
                      <Typography>{proyecto.area || "No especificada"}</Typography>
                    )}
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Docente Responsable</Typography>
                    <Typography>{proyecto.docenteResponsable}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Institución</Typography>
                    <Typography>{proyecto.institucion || "No especificada"}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Fecha de Inicio</Typography>
                    <Typography>{formatDate(proyecto.fechaCreacion) || "No especificada"}</Typography>
                  </Box>
                 
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                  Equipo de Trabajo
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Docentes</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {proyecto.docentes.map((docente, index) => (
                        <Chip
                          key={index}
                          label={docente.nombre}
                          color="primary"
                          variant="outlined"
                          sx={{ mt: 1 }}
                        />
                      ))}
                    </Stack>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Estudiantes</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {proyecto.estudiantes.map((estudiante, index) => (
                        <Chip
                          key={index}
                          label={estudiante.nombre}
                          color="secondary"
                          variant="outlined"
                          sx={{ mt: 1 }}
                        />
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                  Objetivos
                </Typography>
                {editando && permisosUsuario.campos.includes('objetivos') ? (
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Objetivo General</Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        value={form.objetivos?.general || ""}
                        onChange={(e) => handleObjetivoChange('general', null, e.target.value)}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Objetivos Específicos</Typography>
                      {form.objetivos?.especificos?.map((obj, index) => (
                        <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                          <TextField
                            fullWidth
                            value={obj}
                            onChange={(e) => handleObjetivoChange('especifico', index, e.target.value)}
                            variant="outlined"
                            size="small"
                          />
                          <IconButton
                            color="error"
                            onClick={() => removeObjetivoEspecifico(index)}
                            size="small"
                          >
                            <RemoveIcon />
                          </IconButton>
                        </Box>
                      ))}
                      <Button
                        startIcon={<AddIcon />}
                        onClick={addObjetivoEspecifico}
                        sx={{ mt: 1 }}
                      >
                        Agregar Objetivo
                      </Button>
                    </Box>
                  </Stack>
                ) : (
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Objetivo General</Typography>
                      <Typography>{proyecto.objetivos?.general || "No especificado"}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Objetivos Específicos</Typography>
                      <Stack spacing={1}>
                        {proyecto.objetivos?.especificos?.map((obj, index) => (
                          <Typography key={index}>• {obj}</Typography>
                        ))}
                      </Stack>
                    </Box>
                  </Stack>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                  Cronograma
                </Typography>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Fecha de Inicio</Typography>
                  <Typography>{formatDate(proyecto.cronograma.inicio) || "No especificada"}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Fecha de Fin</Typography>
                  <Typography>{formatDate(proyecto.cronograma.fin) || "No especificada"}</Typography>
                </Box>
                {editando && permisosUsuario.puedeAgregarHitos && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Nuevos Hitos
                    </Typography>
                    {form.nuevosHitos?.map((hito, index) => (
                      <Paper
                        key={index}
                        elevation={1}
                        sx={{ p: 2, mb: 2, borderRadius: 2 }}
                      >
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Nombre del Hito"
                              value={hito.nombre}
                              onChange={(e) => handleHitoChange(index, 'nombre', e.target.value)}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              type="date"
                              label="Fecha"
                              value={hito.fecha}
                              onChange={(e) => handleHitoChange(index, 'fecha', e.target.value)}
                              size="small"
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Button
                              component="label"
                              variant="outlined"
                              startIcon={<ImageIcon />}
                              fullWidth
                            >
                              Subir Imagen
                              <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={(e) => handleFileChange(index, 'imagen', e)}
                              />
                            </Button>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Button
                              component="label"
                              variant="outlined"
                              startIcon={<DescriptionIcon />}
                              fullWidth
                            >
                              Subir Documento
                              <input
                                type="file"
                                hidden
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => handleFileChange(index, 'documento', e)}
                              />
                            </Button>
                          </Grid>
                        </Grid>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                          <IconButton
                            color="error"
                            onClick={() => removeHito(index)}
                            size="small"
                          >
                            <RemoveIcon />
                          </IconButton>
                        </Box>
                      </Paper>
                    ))}
                    <Button
                      startIcon={<AddIcon />}
                      onClick={addHito}
                      sx={{ mt: 1 }}
                    >
                      Agregar Hito
                    </Button>
                  </Box>
                )}
                <Grid container spacing={2}>
                  {proyecto.hitosFormateados.map((hito, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card sx={{ height: '100%' }}>
                        {hito.imagen && (
                          <CardMedia
                            component="img"
                            height="140"
                            image={hito.imagen}
                            alt={hito.nombre}
                          />
                        )}
                        <CardContent>
                          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                            {hito.nombre}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Fecha: {hito.fechaFormateada}
                          </Typography>
                          {hito.documento && (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<DescriptionIcon />}
                              href={hito.documento}
                              target="_blank"
                              sx={{ mt: 1 }}
                            >
                              Ver Documento
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                  Observaciones
                </Typography>
                {editando && permisosUsuario.campos.includes('observaciones') ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    name="observaciones"
                    value={form.observaciones || ""}
                    onChange={handleChange}
                    variant="outlined"
                    placeholder="Ingrese las observaciones del proyecto"
                  />
                ) : (
                  <Typography>
                    {proyecto.observaciones || "No hay observaciones registradas"}
                  </Typography>
                )}
              </Paper>
            </Grid>

            {editando && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => setEditando(false)}
                    startIcon={<CancelIcon />}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleGuardar}
                    startIcon={<SaveIcon />}
                  >
                    Guardar Cambios
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Box>

      <Dialog
        open={confirmarEliminar}
        onClose={() => setConfirmarEliminar(false)}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmarEliminar(false)}>Cancelar</Button>
          <Button onClick={handleEliminar} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default ProjectDetail;