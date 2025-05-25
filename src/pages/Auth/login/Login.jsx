import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../../config/firebase';
import './Login.css';

export default function Login() {
  // Estados para campos del formulario y errores
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const [mostrarClave, setMostrarClave] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Función para login con correo/clave
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, clave);
      const user = userCredential.user;
      navigate('/dashboard'); // Redirige al dashboard
    } catch (err) {
      console.error(err);
      setError('Correo o clave incorrectos');
    }
  };

  // Función para login con Google
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Guarda en Firestore si es nuevo
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
      console.error('Error con Google login:', error);
      setError('Error al iniciar sesión con Google');
    }
  };

  return (
    <div className="login-container"> {/* Contenedor principal con estilo centralizado */}
      <h2>Iniciar Sesión</h2> {/* Título del formulario */}

      {error && <p className="error-message">{error}</p>} {/* Mensaje de error visible si ocurre */}

      <form onSubmit={handleSubmit}> {/* Formulario de login */}
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="password-field"> {/* Campo de contraseña con botón de mostrar/ocultar */}
          <input
            type={mostrarClave ? 'text' : 'password'}
            placeholder="Clave"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setMostrarClave(!mostrarClave)}
            className="ver-clave-btn"
          >
            {mostrarClave ? 'Ocultar' : 'Ver'}
          </button>
        </div>

        <button type="submit">Ingresar</button> {/* Botón principal de ingreso */}
      </form>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="google-button"
      >
        Iniciar sesión con Google
      </button> {/* Botón alternativo para login con Google */}

      <p>
        ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
      </p> {/* Enlace de registro */}
    </div>
  );
}
