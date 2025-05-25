import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../../config/firebase';
import {
  Box, Grid, Typography, TextField, Button, InputAdornment, IconButton, MenuItem, Divider, Tabs, Tab
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

function Header() {
  return (
    <Box sx={{ width: '100%', bgcolor: 'primary.main', py: 2, px: { xs: 2, md: 6 }, display: 'flex', alignItems: 'center', boxShadow: 2 }}>
     
    </Box>
  );
}

export default function Register() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const [rol, setRol] = useState('');
  const [institucion, setInstitucion] = useState('');
  const [grado, setGrado] = useState('');
  const [telefono, setTelefono] = useState('');
  const [verClave, setVerClave] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();
  const [tab, setTab] = useState(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, clave);
      const user = userCredential.user;
      const data = {
        id: user.uid,
        email,
        nombre,
        apellido,
        rol,
        institucion,
        fechaRegistro: serverTimestamp()
      };
      if (rol === 'estudiante') {
        data.grado = parseInt(grado);
      }
      if (telefono) {
        data.telefono = parseInt(telefono);
      }
      await setDoc(doc(db, 'users', user.uid), data);
      setMensaje('Cuenta creada con éxito. Redirigiendo...');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo ya está registrado');
      } else {
        setError('Error al registrar el usuario');
      }
    }
  };

  // Tabs: 0 = Login, 1 = Register
  const handleTabChange = (e, newValue) => {
    setTab(newValue);
    if (newValue === 0) navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', bgcolor: '#fff' }}>
      <Grid container sx={{ minHeight: '100vh' }}>
        {/* Imagen 80% */}
        <Grid item xs={12} md={10} sx={{ p: 0, m: 0, height: '100vh', display: { xs: 'none', md: 'flex' } }}>
          <Box sx={{ width: '100%', height: '100vh', p: 0, m: 0 }}>
            <Box component="img"
              src="https://sdmntprwestus.oaiusercontent.com/files/00000000-58a8-6230-894a-ae7a1d0119f8/raw?se=2025-05-25T18%3A59%3A58Z&sp=r&sv=2024-08-04&sr=b&scid=df8b16a5-52a2-5123-8b5b-aa054e3f18d8&skoid=ea0c7534-f237-4ccd-b7ea-766c4ed977ad&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-05-25T12%3A13%3A14Z&ske=2025-05-26T12%3A13%3A14Z&sks=b&skv=2024-08-04&sig=dzY2o/lL4DedTWQmbCHTdgjZZP/GMhvSlXZolVvnT9c%3D"
              alt="School Illustration"
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: 0, boxShadow: 0 }}
            />
          </Box>
        </Grid>
        {/* Formulario 20% */}
        <Grid item xs={12} md={4} sx={{ p: 0, m: 0, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fff' }}>
          <Box sx={{ width: '100%', mx: 'auto', height: '100%',  mt: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="subtitle1" sx={{ color: '#666', mb: 3, fontFamily: 'Comic Neue, sans-serif', textAlign: 'center' }}>
                ¡Bienvenido! Ingresa tus datos para registrarte
              </Typography>
            <Box sx={{ width: 600, ml: '10%', maxWidth: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Tabs
                value={tab}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{ mb: 3, borderRadius: 3, bgcolor: '#fff', boxShadow: 'none', minHeight: 0,
                  '& .MuiTabs-flexContainer': { borderRadius: 3, overflow: 'hidden' },
                  '& .MuiTab-root': {
                    fontFamily: 'Baloo 2', fontWeight: 700, fontSize: '1.15rem', minHeight: 0, py: 1.5, borderRadius: 0,
                    bgcolor: '#fff', color: '#222', transition: 'all 0.2s',
                  },
                  '& .Mui-selected': {
                    color: '#222 !important', bgcolor: 'primary.main', borderBottom: '4px solid #58CC02', borderRadius: '12px 12px 0 0',
                    boxShadow: '0 4px 0 #58CC02',
                  },
                  '& .MuiTabs-indicator': { display: 'none' }
                }}
              >
                <Tab label="Login" disableRipple />
                <Tab label="Register" disableRipple />
              </Tabs>
              {error && (
                <Typography color="error" sx={{ mb: 2, textAlign: 'center', fontFamily: 'Comic Neue' }}>{error}</Typography>
              )}
              {mensaje && (
                <Typography color="success.main" sx={{ mb: 2, textAlign: 'center', fontFamily: 'Comic Neue' }}>{mensaje}</Typography>
              )}
              <form onSubmit={handleSubmit} autoComplete="off" style={{ width: '100%' }}>
                <TextField
                  label="Nombre"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  fullWidth
                  required
                  margin="normal"
                  variant="outlined"
                  sx={{ mb: 2, borderRadius: 2, bgcolor: '#f3f7ff' }}
                  InputProps={{ sx: { borderRadius: 2, fontFamily: 'Comic Neue' } }}
                />
                <TextField
                  label="Apellido"
                  value={apellido}
                  onChange={e => setApellido(e.target.value)}
                  fullWidth
                  required
                  margin="normal"
                  variant="outlined"
                  sx={{ mb: 2, borderRadius: 2, bgcolor: '#f3f7ff' }}
                  InputProps={{ sx: { borderRadius: 2, fontFamily: 'Comic Neue' } }}
                />
                <TextField
                  label="Correo electrónico"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  fullWidth
                  required
                  margin="normal"
                  variant="outlined"
                  sx={{ mb: 2, borderRadius: 2, bgcolor: '#f3f7ff' }}
                  InputProps={{ sx: { borderRadius: 2, fontFamily: 'Comic Neue' } }}
                />
                <TextField
                  label="Clave"
                  type={verClave ? 'text' : 'password'}
                  value={clave}
                  onChange={e => setClave(e.target.value)}
                  fullWidth
                  required
                  margin="normal"
                  variant="outlined"
                  sx={{ mb: 2, borderRadius: 2, bgcolor: '#f3f7ff' }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setVerClave(!verClave)} edge="end" aria-label="toggle password visibility">
                          {verClave ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2, fontFamily: 'Comic Neue' }
                  }}
                />
                <TextField
                  select
                  label="Rol"
                  value={rol}
                  onChange={e => setRol(e.target.value)}
                  fullWidth
                  required
                  margin="normal"
                  variant="outlined"
                  sx={{ mb: 2, borderRadius: 2, bgcolor: '#f3f7ff' }}
                  InputProps={{ sx: { borderRadius: 2, fontFamily: 'Comic Neue' } }}
                >
                  <MenuItem value="">Selecciona un rol</MenuItem>
                  <MenuItem value="estudiante">Estudiante</MenuItem>
                </TextField>
                {rol === 'estudiante' && (
                  <TextField
                    label="Grado"
                    type="number"
                    value={grado}
                    onChange={e => setGrado(e.target.value)}
                    fullWidth
                    required
                    margin="normal"
                    variant="outlined"
                    sx={{ mb: 2, borderRadius: 2, bgcolor: '#f3f7ff' }}
                    InputProps={{ sx: { borderRadius: 2, fontFamily: 'Comic Neue' } }}
                  />
                )}
                <TextField
                  label="Institución"
                  value={institucion}
                  onChange={e => setInstitucion(e.target.value)}
                  fullWidth
                  required
                  margin="normal"
                  variant="outlined"
                  sx={{ mb: 2, borderRadius: 2, bgcolor: '#f3f7ff' }}
                  InputProps={{ sx: { borderRadius: 2, fontFamily: 'Comic Neue' } }}
                />
                <TextField
                  label="Teléfono (opcional)"
                  type="number"
                  value={telefono}
                  onChange={e => setTelefono(e.target.value)}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  sx={{ mb: 2, borderRadius: 2, bgcolor: '#f3f7ff' }}
                  InputProps={{ sx: { borderRadius: 2, fontFamily: 'Comic Neue' } }}
                />
                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 1, fontWeight: 700, fontSize: '1.1rem', borderRadius: 2, py: 1.5 }}>
                  Registrarse
                </Button>
              </form>
              <Divider sx={{ my: 2, width: '100%' }} />
              <Typography sx={{ textAlign: 'center', fontFamily: 'Comic Neue', fontSize: '1rem' }}>
                ¿Ya tienes cuenta? <Link to="/login" style={{ color: '#58CC02', fontWeight: 700 }}>Inicia sesión aquí</Link>
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
