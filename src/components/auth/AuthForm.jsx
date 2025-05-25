import React, { useState } from "react";
import { registerUser, loginUser } from "../../services/authService";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Container,
  Alert,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff, School, Login } from "@mui/icons-material";

const AuthForm = ({ isRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await registerUser(email, password);
      } else {
        await loginUser(email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mt: 4,
          borderRadius: 4,
          background: "linear-gradient(145deg, #ffffff 0%, #f0f0f0 100%)",
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <School sx={{ fontSize: 60, color: "primary.main", mb: 1 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              {isRegister ? "¡Únete a la Aventura!" : "¡Bienvenido de Vuelta!"}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {isRegister
                ? "Crea tu cuenta y comienza tu viaje de aprendizaje"
                : "Continúa tu camino hacia el éxito"}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            label="Correo Electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />

          <TextField
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={isRegister ? <School /> : <Login />}
            sx={{
              mt: 2,
              py: 1.5,
              fontSize: "1.1rem",
            }}
          >
            {isRegister ? "¡Comenzar Aventura!" : "¡Entrar!"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AuthForm;
