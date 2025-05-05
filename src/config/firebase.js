import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAVoNsKFsc0YtBoufPjCGabjLiF09yw-kw",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "proyectosescolares-61e69.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "proyectosescolares-61e69",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "proyectosescolares-61e69.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "276922117102",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:276922117102:web:5053b8151774824d203cff",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX"
};

let app;
let analytics;
let db;
let auth;
let storage;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    analytics = getAnalytics(app);
  }
  
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
} else {
  app = getApps()[0];
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
}

if (process.env.NODE_ENV === 'development') {
  import('firebase/firestore').then(({ connectFirestoreEmulator }) => {
    if (!window.emulatorsStarted) {
      connectFirestoreEmulator(db, 'localhost', 8080);
      window.emulatorsStarted = true;
    }
  }).catch(err => {
    console.error("Error al cargar emuladores:", err);
  });
}

export { app, db, auth, storage, analytics };