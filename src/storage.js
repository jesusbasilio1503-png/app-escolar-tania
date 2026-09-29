import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, USER_ID } from './firebase';

// Todo el estado de la app vive en un solo documento:
//   usuarios / {USER_ID} / app / estado
// Así se minimiza el consumo de Firebase (1 lectura al abrir, 1 escritura al guardar).
const refEstado = () => doc(db, 'usuarios', USER_ID, 'app', 'estado');
const refRespaldo = (fecha) => doc(db, 'usuarios', USER_ID, 'respaldos', fecha);

// 🔒 Bandera de seguridad: solo permitimos GUARDAR después de que la
// lectura inicial desde Firebase haya respondido correctamente.
// Si la app abre sin internet (o Firebase falla), esta bandera queda en
// false y NO se guarda nada, para no sobrescribir los datos buenos con vacío.
let cargaExitosa = false;

// ¿El estado viene completamente vacío?
function estaVacio(data) {
  if (!data || typeof data !== 'object') return true;
  const arrays = ['ciclos', 'grupos', 'eventos'];
  const objetos = ['alumnos', 'asistencia', 'materias', 'actividades', 'rasgos', 'evalScores', 'diario', 'docs', 'cuotas'];
  const hayEnArrays = arrays.some(k => Array.isArray(data[k]) && data[k].length > 0);
  const hayEnObjetos = objetos.some(k => data[k] && typeof data[k] === 'object' && Object.keys(data[k]).length > 0);
  return !hayEnArrays && !hayEnObjetos;
}

export async function cargarDatos() {
  try {
    const snap = await getDoc(refEstado());
    cargaExitosa = true; // la lectura respondió (exista o no el documento)
    return snap.exists() ? (snap.data().data || null) : null;
  } catch (e) {
    console.error('Error al cargar datos:', e);
    cargaExitosa = false; // no pudimos leer → bloqueamos el guardado
    return null;
  }
}

export async function guardarDatos(data) {
  try {
    // 🔒 CANDADO ANTI-BORRADO
    // Si la carga inicial no se confirmó, no sabemos qué hay en Firebase,
    // así que NO escribimos para no arriesgarnos a borrar los datos buenos.
    if (!cargaExitosa) {
      console.warn('Guardado cancelado: la carga inicial no se ha confirmado (posible falta de conexión).');
      return false;
    }

    await setDoc(refEstado(), { data, actualizado: Date.now() });

    // 🗂️ RESPALDO AUTOMÁTICO: una copia por día (solo si hay datos reales).
    // Se guarda en usuarios/{USER_ID}/respaldos/{YYYY-MM-DD}.
    // Usamos localStorage para hacerlo 1 sola vez al día por dispositivo
    // (así casi no aumenta el consumo de Firebase).
    if (!estaVacio(data)) {
      try {
        const hoy = new Date().toISOString().slice(0, 10);
        const claveLocal = `respaldo_${USER_ID}_${hoy}`;
        if (typeof localStorage !== 'undefined' && !localStorage.getItem(claveLocal)) {
          await setDoc(refRespaldo(hoy), { data, actualizado: Date.now() });
          localStorage.setItem(claveLocal, '1');
        }
      } catch (e) {
        console.warn('No se pudo crear el respaldo diario:', e);
      }
    }

    return true;
  } catch (e) {
    console.error('Error al guardar datos:', e);
    return false;
  }
}
