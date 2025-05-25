import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../../config/firebase';
import {
  Box, Paper, Grid, Typography, TextField, Button, InputAdornment, IconButton, Divider, Tabs, Tab
} from '@mui/material';
import { Visibility, VisibilityOff, Google as GoogleIcon } from '@mui/icons-material';

function Header() {
  return (
    <Box sx={{ width: '100%', bgcolor: 'primary.main', py: 2, px: { xs: 2, md: 6 }, display: 'flex', alignItems: 'center', boxShadow: 2 }}>
     
    </Box>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const [mostrarClave, setMostrarClave] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, clave);
      navigate('/dashboard');
    } catch (err) {
      setError('Correo o clave incorrectos');
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          nombre: user.displayName,
          creado: new Date()
        });
      }
      navigate('/dashboard');
    } catch (error) {
      setError('Error al iniciar sesión con Google');
    }
  };

  // Tabs: 0 = Login, 1 = Register
  const handleTabChange = (e, newValue) => {
    setTab(newValue);
    if (newValue === 1) navigate('/register');
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '100%', bgcolor: '#fff' }}>
      <Grid container sx={{ minHeight: '100vh', width: '100%' }}>
        {/* Imagen 80% */}
        <Grid item xs={12} md={8} sx={{ p: 0, m: 0, height: '100vh', display: { xs: 'none', md: 'flex' } }}>
          <Box sx={{ width: '100%', height: '100%' }}>
            <Box component="img"
              src="https://sdmntprwestus.oaiusercontent.com/files/00000000-1304-6230-b909-f8d5a42b7f24/raw?se=2025-05-25T19%3A10%3A07Z&sp=r&sv=2024-08-04&sr=b&scid=1524dfe4-5a5d-53be-ac74-26fc5c9b7701&skoid=ea0c7534-f237-4ccd-b7ea-766c4ed977ad&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-05-25T00%3A22%3A57Z&ske=2025-05-26T00%3A22%3A57Z&sks=b&skv=2024-08-04&sig=mGJ03WzAIXQ3Y8G4uzuwet%2Bn1bBg9tQC5N%2BTgWy0ED8%3D"
              alt="School Illustration"
              sx={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover'
              }}
            />
          </Box>
        </Grid>
        {/* Formulario 20% */}
        <Grid item xs={12} md={4} sx={{ p: 0, m: 0, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fff' }}>
          <Box sx={{ width: '100%', mx: 'auto', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ width: 600, ml: '10%', maxWidth: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Logo/Título */}
           
              {/* Subtítulo */}
              <Typography variant="subtitle1" sx={{ color: '#666', mb: 3, fontFamily: 'Comic Neue, sans-serif', textAlign: 'center' }}>
                ¡Bienvenido! Ingresa tus datos para acceder
              </Typography>
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
              <form onSubmit={handleSubmit} autoComplete="off" style={{ width: '100%' }}>
                <TextField
                  label="Email"
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
                  label="Password"
                  type={mostrarClave ? 'text' : 'password'}
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
                        <IconButton onClick={() => setMostrarClave(!mostrarClave)} edge="end" aria-label="toggle password visibility">
                          {mostrarClave ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2, fontFamily: 'Comic Neue' }
                  }}
                />
                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 1, fontWeight: 700, fontSize: '1.1rem', borderRadius: 2, py: 1.5, mb: 2, boxShadow: 'none' }}>
                  Login
                </Button>
              </form>
              <Button
                variant="contained"
                fullWidth
                startIcon={<GoogleIcon />}
                onClick={handleGoogleLogin}
                sx={{ mb: 2, bgcolor: '#db4437', color: '#fff', fontWeight: 700, fontSize: '1.05rem', borderRadius: 2, py: 1.5, boxShadow: 'none', '&:hover': { bgcolor: '#c13525' } }}
              >
                Iniciar sesión con Google
              </Button>
              <Divider sx={{ my: 2, width: '100%' }} />
              <Typography sx={{ textAlign: 'center', fontFamily: 'Comic Neue', fontSize: '1rem' }}>
                ¿No tienes cuenta? <Link to="/register" style={{ color: '#58CC02', fontWeight: 700 }}>Regístrate aquí</Link>
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
