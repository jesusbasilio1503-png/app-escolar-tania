import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, USER_ID } from './firebase';

// Todo el estado de la app vive en un solo documento:
//   usuarios / maestra-tania / app / estado
// Así se minimiza el consumo de Firebase (1 lectura al abrir, 1 escritura al guardar).
const refEstado = () => doc(db, 'usuarios', USER_ID, 'app', 'estado');

export async function cargarDatos() {
  try {
    const snap = await getDoc(refEstado());
    return snap.exists() ? (snap.data().data || null) : null;
  } catch (e) {
    console.error('Error al cargar datos:', e);
    return null;
  }
}

export async function guardarDatos(data) {
  try {
    await setDoc(refEstado(), { data, actualizado: Date.now() });
    return true;
  } catch (e) {
    console.error('Error al guardar datos:', e);
    return false;
  }
}
