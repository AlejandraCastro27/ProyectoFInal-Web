// Importación de librerías y módulos necesarios
import React, { useState, useEffect } from "react";
import { collection, addDoc, Timestamp, getDocs } from "firebase/firestore";
import { db, storage } from "../../../config/firebase";
import { useAuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./CreateProject.css";
import Layout from '../../../components/ui/Layout';
import { CircularProgress, Box, Typography, Paper, Button, Grid, TextField, MenuItem } from '@mui/material';

// Componente principal CreateProject
const CreateProject = () => {
  // Obtenemos el usuario actual desde el contexto de autenticación
  const { currentUser } = useAuthContext();
  const navigate = useNavigate();

  // Estado para almacenar la lista de usuarios obtenida de Firestore
  const [usuarios, setUsuarios] = useState([]);

  // Estado del formulario con todos los campos necesarios para un proyecto
  const [form, setForm] = useState({
    titulo: "",
    area: "",
    objetivoGeneral: "",
    objetivosEspecificos: [""],
    institucion: "",
    presupuesto: "",
    inicio: "",
    fin: "",
    hitos: [{ nombre: "", fecha: "", imagen: null, documento: null }],
    observaciones: "",
    miembros: [{ userId: "", rol: "docente" }],
  });

  // useEffect para cargar la lista de usuarios al cargar el componente
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        // Se obtienen todos los documentos de la colección "users"
        const querySnapshot = await getDocs(collection(db, "users"));
        // Se mapean los datos a un nuevo formato con id, nombre y rol
        const listaUsuarios = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            nombre: data.nombre || data.email || "Usuario sin nombre",
            rol: data.rol ? data.rol : "estudiante", 
          };
        });
        setUsuarios(listaUsuarios);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    };
    fetchUsuarios();
  }, []);

  // Función para manejar cambios simples en los inputs del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Maneja el cambio de un objetivo específico en la lista
  const handleObjetivoChange = (index, value) => {
    const nuevos = [...form.objetivosEspecificos];
    nuevos[index] = value;
    setForm({ ...form, objetivosEspecificos: nuevos });
  };

  // Agrega un nuevo campo de objetivo específico
  const addObjetivoEspecifico = () => {
    setForm((prev) => ({
      ...prev,
      objetivosEspecificos: [...prev.objetivosEspecificos, ""],
    }));
  };

  // Maneja el cambio de cualquier campo dentro de un hito
  const handleHitoChange = (index, key, value) => {
    const nuevos = [...form.hitos];
    nuevos[index][key] = value;
    setForm({ ...form, hitos: nuevos });
  };

  // Agrega un nuevo hito al formulario
  const addHito = () => {
    setForm((prev) => ({
      ...prev,
      hitos: [...prev.hitos, { nombre: "", fecha: "", imagen: null, documento: null }],
    }));
  };

  // Maneja la carga de archivos (imagen o documento) para un hito
  const handleFileChange = (index, fileType, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const nuevos = [...form.hitos];
    nuevos[index][fileType] = file;
    setForm({ ...form, hitos: nuevos });
  };

  // Maneja el cambio de datos para un miembro del proyecto
  const handleMiembroChange = (index, key, value) => {
    const nuevosMiembros = [...form.miembros];
    nuevosMiembros[index][key] = value;
    setForm({ ...form, miembros: nuevosMiembros });
  };

  // Agrega un nuevo miembro al proyecto
  const addMiembro = () => {
    setForm((prev) => ({
      ...prev,
      miembros: [...prev.miembros, { userId: "", rol: "docente" }],
    }));
  };

  // Maneja el envío del formulario para crear el proyecto
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Procesamiento de cada hito para subir archivos (imagen y documento)
      const hitosWithFiles = await Promise.all(
        form.hitos.map(async (hito, index) => {
          let imagenUrl = null;
          let documentoUrl = null;

          // Subir imagen si existe y validar tipo de archivo
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

          // Subir documento si existe y validar tipo de archivo
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

          // Retornar el hito con las URLs de los archivos
          return {
            ...hito,
            imagen: imagenUrl,
            documento: documentoUrl,
          };
        })
      );

      // Crear el objeto final del proyecto a guardar en Firestore
      const proyecto = {
        titulo: form.titulo,
        area: form.area,
        objetivos: {
          general: form.objetivoGeneral,
          especificos: form.objetivosEspecificos,
        },
        cronograma: {
          inicio: Timestamp.fromDate(new Date(form.inicio)),
          fin: Timestamp.fromDate(new Date(form.fin)),
          hitos: hitosWithFiles.map((h) => ({
            nombre: h.nombre,
            fecha: Timestamp.fromDate(new Date(h.fecha)),
            imagen: h.imagen,
            documento: h.documento,
          })),
        },
        presupuesto: Number(form.presupuesto),
        institucion: form.institucion,
        docenteId: currentUser.uid,
        estado: "formulacion",
        fechaCreacion: Timestamp.now(),
        observaciones: form.observaciones,
        miembros: form.miembros,
      };

      // Guardar el proyecto en la colección "projects"
      await addDoc(collection(db, "projects"), proyecto);

      alert("Proyecto creado exitosamente.");
      
      // Reiniciar formulario a valores iniciales
      setForm({
        titulo: "",
        area: "",
        objetivoGeneral: "",
        objetivosEspecificos: [""],
        institucion: "",
        presupuesto: "",
        inicio: "",
        fin: "",
        hitos: [{ nombre: "", fecha: "", imagen: null, documento: null }],
        observaciones: "",
        miembros: [{ userId: "", rol: "docente" }],
      });

    } catch (error) {
      console.error("Error al crear proyecto:", error);
      alert(`Error al crear el proyecto: ${error.message}`);
    }
  };

  if (!usuarios.length) {
    return (
      <Layout>
        <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress color="primary" size={60} thickness={5} />
            <Typography sx={{ mt: 2, fontFamily: 'Baloo 2', fontWeight: 600, color: 'primary.main' }}>
              Cargando usuarios...
            </Typography>
          </Box>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ width: '100%', p: { xs: 1, md: 3 } }}>
        <Paper elevation={3} sx={{ width: '100%', maxWidth: 800, mx: 'auto', p: { xs: 2, md: 4 }, borderRadius: 4, boxShadow: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
            <Typography variant="h4" sx={{ flexGrow: 1, fontWeight: 700, fontFamily: 'Baloo 2' }}>
              Crear Proyecto
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate("/dashboard")}
              sx={{ borderRadius: 2, fontWeight: 600 }}
            >
              ← Volver al Dashboard
            </Button>
          </Box>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Título"
                  name="titulo"
                  value={form.titulo}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Área"
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Institución"
                  name="institucion"
                  value={form.institucion}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Presupuesto (COP)"
                  name="presupuesto"
                  type="number"
                  value={form.presupuesto}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Fecha de Inicio"
                  name="inicio"
                  type="date"
                  value={form.inicio}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Fecha de Finalización"
                  name="fin"
                  type="date"
                  value={form.fin}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Objetivo General"
                  name="objetivoGeneral"
                  value={form.objetivoGeneral}
                  onChange={handleChange}
                  fullWidth
                  required
                  multiline
                  rows={2}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
                  Objetivos Específicos
                </Typography>
                <Grid container spacing={1}>
                  {form.objetivosEspecificos.map((obj, index) => (
                    <Grid item xs={12} md={6} key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        value={obj}
                        onChange={(e) => handleObjetivoChange(index, e.target.value)}
                        placeholder={`Objetivo ${index + 1}`}
                        fullWidth
                        variant="outlined"
                        size="small"
                      />
                      <Button
                        color="error"
                        variant="outlined"
                        onClick={() => setForm(prev => ({
                          ...prev,
                          objetivosEspecificos: prev.objetivosEspecificos.filter((_, i) => i !== index)
                        }))}
                        sx={{ minWidth: 0, px: 1 }}
                        disabled={form.objetivosEspecificos.length === 1}
                      >
                        –
                      </Button>
                    </Grid>
                  ))}
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={addObjetivoEspecifico}
                      sx={{ mt: 1 }}
                    >
                      + Añadir objetivo específico
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
                  Hitos
                </Typography>
                <Grid container spacing={2}>
                  {form.hitos.map((hito, index) => (
                    <Grid item xs={12} key={index}>
                      <Paper elevation={1} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={4}>
                            <TextField
                              label="Nombre del hito"
                              value={hito.nombre}
                              onChange={(e) => handleHitoChange(index, "nombre", e.target.value)}
                              fullWidth
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              label="Fecha"
                              type="date"
                              value={hito.fecha}
                              onChange={(e) => handleHitoChange(index, "fecha", e.target.value)}
                              fullWidth
                              size="small"
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                          <Grid item xs={12} md={2}>
                            <Button
                              component="label"
                              variant="outlined"
                              fullWidth
                            >
                              Imagen
                              <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={(e) => handleFileChange(index, "imagen", e)}
                              />
                            </Button>
                          </Grid>
                          <Grid item xs={12} md={2}>
                            <Button
                              component="label"
                              variant="outlined"
                              fullWidth
                            >
                              Documento
                              <input
                                type="file"
                                hidden
                                accept=".pdf,.doc,.docx,.ppt,.pptx"
                                onChange={(e) => handleFileChange(index, "documento", e)}
                              />
                            </Button>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  ))}
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={addHito}
                      sx={{ mt: 1 }}
                    >
                      + Añadir Hito
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Observaciones"
                  name="observaciones"
                  value={form.observaciones}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={2}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
                  Miembros del Proyecto
                </Typography>
                <Grid container spacing={2}>
                  {form.miembros.map((miembro, index) => {
                    const usuariosFiltrados = usuarios.filter((u) => u.rol === miembro.rol);
                    return (
                      <Grid item xs={12} md={6} key={index}>
                        <Grid container spacing={1} alignItems="center">
                          <Grid item xs={6}>
                            <TextField
                              select
                              label="Usuario"
                              value={miembro.userId}
                              onChange={(e) => handleMiembroChange(index, "userId", e.target.value)}
                              fullWidth
                              required
                              variant="outlined"
                            >
                              <MenuItem value="">Seleccione un usuario</MenuItem>
                              {usuariosFiltrados.map((u) => (
                                <MenuItem key={u.id} value={u.id}>
                                  {u.nombre} ({u.rol})
                                </MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              select
                              label="Rol"
                              value={miembro.rol}
                              onChange={(e) => handleMiembroChange(index, "rol", e.target.value)}
                              fullWidth
                              variant="outlined"
                            >
                              <MenuItem value="docente">Docente</MenuItem>
                              <MenuItem value="estudiante">Estudiante</MenuItem>
                            </TextField>
                          </Grid>
                        </Grid>
                      </Grid>
                    );
                  })}
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={addMiembro}
                      sx={{ mt: 1 }}
                    >
                      + Añadir Miembro
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button type="submit" variant="contained" color="success" size="large" sx={{ borderRadius: 2, fontWeight: 700, fontFamily: 'Baloo 2' }}>
                  Crear Proyecto
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
};

export default CreateProject;
