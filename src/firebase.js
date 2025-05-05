import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAVoNsKFsc0YtBoufPjCGabjLiF09yw-kw",
    authDomain: "proyectosescolares-61e69.firebaseapp.com",
    projectId: "proyectosescolares-61e69",
    storageBucket: "proyectosescolares-61e69.firebasestorage.app",
    messagingSenderId: "276922117102",
    appId: "1:276922117102:web:5053b8151774824d203cff"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };