import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../../config/firebase';
import './Register.css';

export default function Register() {
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const [mostrarClave, setMostrarClave] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, clave);
      const user = userCredential.user;

      
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        creado: new Date()
      });

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo ya está registrado');
      } else {
        setError('Error al registrar usuario');
      }
    }
  };

  return (
    <div className="register-container">
      <h2>Registro</h2>
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="password-field">
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

        <button type="submit">Registrarse</button>
      </form>

      <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link></p>
    </div>
  );
}
