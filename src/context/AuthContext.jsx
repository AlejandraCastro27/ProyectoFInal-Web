import { createContext, useContext, useEffect, useState } from "react";
// Importa funciones y hooks de React para crear contexto, manejar estado y efectos

import { auth } from "../config/firebase";
// Importa la instancia de autenticación Firebase configurada

import { onAuthStateChanged, signOut } from "firebase/auth"; 
// Importa funciones de Firebase Authentication para detectar cambios en el estado de autenticación y cerrar sesión

import { doc, getDoc } from "firebase/firestore";
// Importa funciones de Firestore para acceder a documentos específicos

import { db } from "../config/firebase";
// Importa la instancia de Firestore configurada

// Crea un contexto para compartir el estado de autenticación en toda la aplicación
const AuthContext = createContext();

// Componente proveedor del contexto que envolverá la aplicación o partes que necesitan acceso al usuario
export const AuthProvider = ({ children }) => {
  // Estado para almacenar el usuario autenticado
  const [currentUser, setCurrentUser] = useState(null);
  // Estado para controlar si la carga de usuario está en proceso
  const [loading, setLoading] = useState(true);

  // useEffect para ejecutar código al montar el componente y suscribirse al estado de autenticación
  useEffect(() => {
    // Función que se ejecuta cada vez que cambia el estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Si hay usuario autenticado, intenta obtener los datos adicionales desde Firestore
        const userDoc = doc(db, "users", user.uid); // Referencia al documento del usuario en Firestore
        const userSnap = await getDoc(userDoc); // Obtener datos del documento
        if (userSnap.exists()) {
          const userData = userSnap.data(); // Datos del usuario almacenados en Firestore
          // Combina datos de autenticación y Firestore en el estado currentUser
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            ...userData, 
          });
        } else {
          // Si no hay datos en Firestore para el usuario autenticado, mostrar error
          console.error("No se encontraron los datos del usuario");
        }
      } else {
        // Si no hay usuario autenticado, limpiar el estado currentUser
        setCurrentUser(null);
      }
      // Indica que la carga ya terminó
      setLoading(false);
    });

    // Devuelve una función para desuscribirse del listener cuando el componente se desmonte
    return () => unsubscribe();
  }, []);

  // Función para cerrar sesión del usuario actual
  const logout = () => {
    signOut(auth)
      .then(() => {
        setCurrentUser(null); // Limpiar el usuario actual al cerrar sesión
        console.log("Sesión cerrada con éxito");
      })
      .catch((error) => {
        // Mostrar error si falla el cierre de sesión
        console.error("Error al cerrar sesión: ", error);
      });
  };

  return (
    // Proveedor del contexto con el valor de currentUser y la función logout
    // Solo renderiza los hijos si ya terminó de cargar el usuario
    <AuthContext.Provider value={{ currentUser, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para consumir el contexto de autenticación en otros componentes
export const useAuthContext = () => useContext(AuthContext);
