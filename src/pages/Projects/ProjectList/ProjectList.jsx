import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../../config/firebase";
import Layout from '../../../components/ui/Layout';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  Grid,
  InputAdornment,
  FormControl,
  InputLabel,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import { Search as SearchIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busquedaTitulo, setBusquedaTitulo] = useState("");
  const [docenteSeleccionado, setDocenteSeleccionado] = useState("Todos");
  const [institucionSeleccionada, setInstitucionSeleccionada] = useState("Todos");
  const [docentesUnicos, setDocentesUnicos] = useState([]);
  const [institucionesUnicas, setInstitucionesUnicas] = useState([]);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const getDocenteResponsable = async (projectData) => {
    try {
      if (projectData.miembros?.length > 0) {
        const docentes = projectData.miembros.filter(m => m.rol === "docente");
        if (docentes.length > 0) {
          const docenteDoc = await getDoc(doc(db, "users", docentes[0].userId));
          if (docenteDoc.exists()) {
            return `${docenteDoc.data().nombre} ${docenteDoc.data().apellido || ''}`.trim();
          }
        }
      }
      if (projectData.docenteId) {
        const docenteDoc = await getDoc(doc(db, "users", projectData.docenteId));
        if (docenteDoc.exists()) {
          return `${docenteDoc.data().nombre} ${docenteDoc.data().apellido || ''}`.trim();
        }
      }
      return "No asignado";
    } catch (error) {
      console.error("Error obteniendo docente:", error);
      return "Error cargando docente";
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "projects"));
        const projectsList = [];
        const docentesSet = new Set();
        const institucionesSet = new Set();
        for (const docSnapshot of querySnapshot.docs) {
          const projectData = docSnapshot.data();
          const docenteResponsable = await getDocenteResponsable(projectData);
          const project = {
            id: docSnapshot.id,
            ...projectData,
            docenteResponsable,
            estado: projectData.estado || "No especificado"
          };
          projectsList.push(project);
          if (docenteResponsable !== "No asignado") {
            docentesSet.add(docenteResponsable);
          }
          if (projectData.institucion) {
            institucionesSet.add(projectData.institucion);
          }
        }
        setProjects(projectsList);
        setDocentesUnicos(["Todos", ...Array.from(docentesSet).sort()]);
        setInstitucionesUnicas(["Todos", ...Array.from(institucionesSet).sort()]);
      } catch (error) {
        console.error("Error al obtener proyectos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const proyectosFiltrados = projects.filter((project) => {
    const tituloMatch = project.titulo?.toLowerCase().includes(busquedaTitulo.toLowerCase());
    const docenteMatch = docenteSeleccionado === "Todos" || 
                       project.docenteResponsable === docenteSeleccionado;
    const institucionMatch = institucionSeleccionada === "Todos" || 
                           project.institucion === institucionSeleccionada;
    return tituloMatch && docenteMatch && institucionMatch;
  });

  if (loading) return (
    <Layout>
      <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress color="primary" size={60} thickness={5} />
          <Typography sx={{ mt: 2, fontFamily: 'Baloo 2', fontWeight: 600, color: 'primary.main' }}>
            Cargando proyectos...
          </Typography>
        </Box>
      </Box>
    </Layout>
  );

  return (
    <Layout>
      <Box sx={{ width: '100%', p: { xs: 1, md: 3 } }}>
        <Paper elevation={3} sx={{ width: '100%', p: { xs: 2, md: 3 }, borderRadius: 4, boxShadow: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
            <Typography variant="h4" sx={{ flexGrow: 1, fontWeight: 700, fontFamily: 'Baloo 2' }}>
              Lista de Proyectos
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate("/dashboard")}
              sx={{ borderRadius: 2, fontWeight: 600 }}
              startIcon={<ArrowBackIcon />}
            >
              Volver al Dashboard
            </Button>
          </Box>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Buscar por título"
                value={busquedaTitulo}
                onChange={(e) => setBusquedaTitulo(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ borderRadius: 2, background: '#F7F7F7' }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Docente</InputLabel>
                <Select
                  value={docenteSeleccionado}
                  onChange={(e) => setDocenteSeleccionado(e.target.value)}
                  label="Docente"
                >
                  {docentesUnicos.map((docente, index) => (
                    <MenuItem key={index} value={docente}>
                      {docente === "Todos" ? "Todos los docentes" : docente}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Institución</InputLabel>
                <Select
                  value={institucionSeleccionada}
                  onChange={(e) => setInstitucionSeleccionada(e.target.value)}
                  label="Institución"
                >
                  {institucionesUnicas.map((institucion, index) => (
                    <MenuItem key={index} value={institucion}>
                      {institucion === "Todos" ? "Todas las instituciones" : institucion}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {proyectosFiltrados.length === 0 ? (
            <Typography align="center" sx={{ mt: 6, fontStyle: 'italic' }}>
              No hay proyectos disponibles.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {proyectosFiltrados.map((project) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={project.id}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'box-shadow 0.2s',
                      '&:hover': {
                        boxShadow: 6,
                        background: '#F0FFF0',
                      },
                    }}
                  >
                    <Link to={`/projects/${project.id}`} style={{ textDecoration: 'none', color: 'inherit', flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'primary.main', fontFamily: 'Baloo 2' }}>
                        {project.titulo}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <b>Docente responsable:</b> {project.docenteResponsable}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <b>Área:</b> {project.area || "No especificada"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <b>Institución:</b> {project.institucion || "No especificada"}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          <b>Estado:</b>
                        </Typography>
                        <Box
                          component="span"
                          sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 2,
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            background:
                              project.estado === 'completado'
                                ? '#58CC02'
                                : project.estado === 'en proceso'
                                ? '#FFB300'
                                : project.estado === 'pendiente'
                                ? '#FF4B4B'
                                : '#888',
                          }}
                        >
                          {project.estado}
                        </Box>
                      </Box>
                    </Link>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Box>
    </Layout>
  );
};

export default ProjectList;
