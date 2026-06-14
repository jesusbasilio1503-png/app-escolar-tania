import * as XLSX from 'xlsx';

// ============================================================
// Helper: descargar una matriz (array of arrays) como .xlsx
// ============================================================
function descargarAOA(aoa, nombreHoja, nombreArchivo) {
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  // Ajuste de ancho de columnas según el contenido
  const cols = (aoa[0] || []).map((_, i) => {
    const max = aoa.reduce((m, row) => Math.max(m, String(row[i] ?? '').length), 10);
    return { wch: Math.min(max + 2, 40) };
  });
  ws['!cols'] = cols;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, nombreHoja);
  XLSX.writeFile(wb, nombreArchivo);
}

// ============================================================
// IMPORTAR: lista de alumnos desde un Excel (primera columna)
// Devuelve un arreglo de nombres (string[])
// ============================================================
export function importarAlumnosDesdeExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const filas = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false });
        const nombres = filas
          .map((f) => (f && f[0] != null ? String(f[0]).trim() : ''))
          .filter((n) => n.length > 0)
          // descarta un posible encabezado "Nombre", "Alumno", etc.
          .filter((n, i) => !(i === 0 && /^(nombre|alumno|alumnos|nombres)$/i.test(n)));
        resolve(nombres);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// ============================================================
// EXPORTAR: Actividades (tabla resumen por alumno)
// ============================================================
export function exportarActividades(materia, alumnos, actividades) {
  const titulos = actividades.map(a => a.titulo);
  const header = ['Alumno', ...titulos, 'Entregadas', '% Cumplimiento'];
  const filas = alumnos.map(al => {
    const marcas = actividades.map(a => (a.entregas?.[al.id] ? 'Sí' : 'No'));
    const entregadas = actividades.filter(a => a.entregas?.[al.id]).length;
    const pct = actividades.length ? Math.round((entregadas / actividades.length) * 100) : 0;
    return [al.nombre, ...marcas, entregadas, `${pct}%`];
  });
  descargarAOA([header, ...filas], 'Actividades', `Actividades_${materia}.xlsx`);
}

// ============================================================
// EXPORTAR: Evaluación (rasgos con pesos + calificación final)
// ============================================================
export function exportarEvaluacion(materia, alumnos, rasgos, evalScores, calcFinal) {
  const header = ['Alumno', ...rasgos.map(r => `${r.nombre} (${r.peso}%)`), 'Calificación final'];
  const filas = alumnos.map(al => {
    const scores = evalScores?.[al.id] || {};
    const cols = rasgos.map(r => (scores[r.id] ?? ''));
    return [al.nombre, ...cols, calcFinal(scores, rasgos)];
  });
  descargarAOA([header, ...filas], 'Evaluacion', `Evaluacion_${materia}.xlsx`);
}

// ============================================================
// EXPORTAR: Asistencia (matriz por día + resumen P/R/F + %)
// ============================================================
export function exportarAsistencia(alumnos, datosGrupo, fechas, etiquetaPeriodo) {
  const fechasOrden = [...fechas].sort();
  const header = ['Alumno', ...fechasOrden, 'Presentes', 'Retardos', 'Faltas', '% Asistencia'];
  const mapa = { p: 'P', r: 'R', f: 'F' };
  const filas = alumnos.map(al => {
    let p = 0, r = 0, f = 0;
    const celdas = fechasOrden.map(fch => {
      const e = datosGrupo?.[fch]?.[al.id];
      if (e === 'p') p++; else if (e === 'r') r++; else if (e === 'f') f++;
      return mapa[e] || '';
    });
    const total = p + r + f;
    const pct = total ? Math.round(((p + r * 0.5) / total) * 100) : 0;
    return [al.nombre, ...celdas, p, r, f, `${pct}%`];
  });
  descargarAOA([header, ...filas], 'Asistencia', `Asistencia_${etiquetaPeriodo}.xlsx`);
}
