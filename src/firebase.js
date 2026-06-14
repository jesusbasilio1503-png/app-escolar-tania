import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuración del proyecto Firebase de la maestra Tania
const firebaseConfig = {
  apiKey: "AIzaSyD68gblOeyOQQdUIh9O1wR2K_AtaJg0xv8",
  authDomain: "app-escolar-tania.firebaseapp.com",
  projectId: "app-escolar-tania",
  storageBucket: "app-escolar-tania.firebasestorage.app",
  messagingSenderId: "36764544627",
  appId: "1:36764544627:web:07952c1f4b2050bf220406"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// PIN de acceso de la maestra Tania (4 dígitos). Cámbialo si quieres.
export const APP_PIN = "1357";

// Identificador único de esta maestra dentro de Firestore
export const USER_ID = "maestra-tania";
