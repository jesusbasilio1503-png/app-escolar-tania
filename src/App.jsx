import { useState, useEffect } from 'react';
import {
  Users, CalendarDays, BookOpen, DollarSign, ClipboardList,
  Plus, X, Check, Trash2, FileCheck, NotebookPen,
  ArrowLeft, GraduationCap, Award, Sun, Delete, CheckCircle2,
  LogOut, Loader, Download, Upload, Wand2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { APP_PIN } from './firebase';
import { cargarDatos, guardarDatos } from './storage';
import {
  importarAlumnosDesdeExcel, exportarActividades,
  exportarEvaluacion, exportarAsistencia
} from './excel';

// ============================================================
// SISTEMA DE DISEÑO
// ============================================================
const FONT_TITLE = "'Fredoka', sans-serif";
const FONT_BODY = "'Quicksand', sans-serif";

const C = {
  coral: '#FF7A85', coralSoft: '#FFE3E5',
  lavanda: '#9B8CE8', lavandaSoft: '#ECE8FB',
  menta: '#2EC4A0', mentaSoft: '#DBF5EE',
  cielo: '#4FB0E8', cieloSoft: '#DEF0FB',
  sol: '#FFC93C', solSoft: '#FFF3D2',
  blanco: '#FFFFFF',
  fondo: '#F6F4FB',
  texto: '#4A4458',
  textoSuave: '#9A93AC',
};

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const hoyISO = () => new Date().toISOString().slice(0, 10);

const inputStyle = {
  flex: 1, border: `2px solid ${C.lavandaSoft}`, borderRadius: 14, padding: '11px 14px',
  fontFamily: FONT_BODY, fontSize: 15, color: C.texto, outline: 'none', width: '100%', boxSizing: 'border-box', background: C.blanco,
};
const labelStyle = { display: 'block', fontFamily: FONT_TITLE, fontWeight: 600, fontSize: 13, color: C.textoSuave, marginBottom: 6 };
const iconBtn = { background: 'transparent', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };

// ============================================================
// COMPONENTES BASE
// ============================================================
function Boton({ children, color = C.coral, onClick, full, soft }) {
  return (
    <button onClick={onClick} style={{
      background: soft ? 'transparent' : color, color: soft ? color : '#fff',
      border: soft ? `2px solid ${color}` : 'none', fontFamily: FONT_TITLE, fontWeight: 600, fontSize: 15,
      padding: '11px 18px', borderRadius: 16, cursor: 'pointer', width: full ? '100%' : 'auto',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      boxShadow: soft ? 'none' : '0 4px 0 rgba(0,0,0,0.08)'
    }}>{children}</button>
  );
}
function Tarjeta({ children, style }) {
  return <div style={{ background: C.blanco, borderRadius: 22, padding: 18, boxShadow: '0 6px 20px rgba(74,68,88,0.07)', ...style }}>{children}</div>;
}
function Cabecera({ titulo, onBack, color = C.coral, icon }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
      {onBack && (
        <button onClick={onBack} style={{ background: C.blanco, border: 'none', borderRadius: 14, width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(74,68,88,0.08)', color: C.texto, flexShrink: 0 }}><ArrowLeft size={20} /></button>
      )}
      <div style={{ background: color, width: 42, height: 42, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>{icon}</div>
      <h2 style={{ fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 22, color: C.texto, margin: 0 }}>{titulo}</h2>
    </div>
  );
}
function Vacio({ texto }) {
  return <div style={{ textAlign: 'center', padding: '36px 16px', color: C.textoSuave, fontFamily: FONT_BODY, fontSize: 15 }}>{texto}</div>;
}
function Chip({ children, bg, color }) {
  return <span style={{ background: bg, color, fontFamily: FONT_TITLE, fontWeight: 600, fontSize: 12, padding: '4px 12px', borderRadius: 999, display: 'inline-block' }}>{children}</span>;
}

// ============================================================
// PANTALLA DE CARGA
// ============================================================
function PantallaCarga() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: C.fondo, fontFamily: FONT_BODY }}>
      <div style={{ animation: 'spin 1s linear infinite', color: C.lavanda }}><Loader size={42} /></div>
      <p style={{ marginTop: 14, color: C.textoSuave }}>Cargando tu información…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ============================================================
// PANTALLA DE PIN
// ============================================================
function PinScreen({ onOk }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const tecla = (n) => {
    if (pin.length >= 4) return;
    const nuevo = pin + n; setPin(nuevo); setError(false);
    if (nuevo.length === 4) {
      setTimeout(() => { if (nuevo === APP_PIN) onOk(); else { setError(true); setPin(''); } }, 150);
    }
  };
  const borrar = () => { setPin(p => p.slice(0, -1)); setError(false); };
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, background: `linear-gradient(160deg, ${C.lavandaSoft} 0%, ${C.cieloSoft} 50%, ${C.coralSoft} 100%)`, fontFamily: FONT_BODY }}>
      <div style={{ background: C.sol, width: 76, height: 76, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: '0 8px 24px rgba(255,201,60,0.4)' }}>
        <GraduationCap size={40} color="#fff" />
      </div>
      <h1 style={{ fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 26, color: C.texto, margin: '0 0 4px' }}>App Escolar</h1>
      <p style={{ fontFamily: FONT_BODY, color: C.textoSuave, margin: '0 0 24px' }}>Maestra Tania · Secundaria</p>

      <div style={{ display: 'flex', gap: 12, marginBottom: error ? 8 : 24 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ width: 18, height: 18, borderRadius: '50%', background: i < pin.length ? C.lavanda : C.blanco, border: `2px solid ${error ? C.coral : C.lavanda}`, transition: 'all .15s' }} />
        ))}
      </div>
      {error && <p style={{ color: C.coral, fontFamily: FONT_BODY, fontSize: 13, margin: '0 0 16px' }}>PIN incorrecto, inténtalo de nuevo</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 72px)', gap: 12 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <button key={n} onClick={() => tecla(String(n))} style={teclaStyle}>{n}</button>
        ))}
        <div />
        <button onClick={() => tecla('0')} style={teclaStyle}>0</button>
        <button onClick={borrar} style={{ ...teclaStyle, color: C.textoSuave }}><Delete size={22} /></button>
      </div>
    </div>
  );
}
const teclaStyle = {
  width: 72, height: 72, borderRadius: 22, border: 'none', background: C.blanco,
  fontFamily: FONT_TITLE, fontWeight: 600, fontSize: 26, color: C.texto, cursor: 'pointer',
  boxShadow: '0 4px 14px rgba(74,68,88,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center'
};

// ============================================================
// APP PRINCIPAL
// ============================================================
export default function App() {
  const [logueado, setLogueado] = useState(() => sessionStorage.getItem('tania_pin_ok') === '1');
  const [cargando, setCargando] = useState(true);
  const [hidratado, setHidratado] = useState(false);

  // ---- datos ----
  const [ciclos, setCiclos] = useState([]);          // [{id, nombre}]
  const [grupos, setGrupos] = useState([]);          // [{id, cicloId, nombre}]
  const [alumnos, setAlumnos] = useState({});        // { grupoId: [{id, nombre}] }
  const [asistencia, setAsistencia] = useState({});  // { grupoId: { fecha: {alumnoId:'p'|'r'|'f'} } }
  const [materias, setMaterias] = useState({});      // { grupoId: [materia] }
  const [actividades, setActividades] = useState({});// { grupoId: { materia: [{id,titulo,entregas}] } }
  const [rasgos, setRasgos] = useState({});          // { grupoId: { materia: [{id,nombre,peso}] } }
  const [evalScores, setEvalScores] = useState({});  // { grupoId: { materia: { alumnoId: {rasgoId:val} } } }
  const [diario, setDiario] = useState({});          // { grupoId: [{id,fecha,texto}] }
  const [docs, setDocs] = useState({});              // { grupoId: [{id,nombre,entregas}] }
  const [cuotas, setCuotas] = useState({});          // { grupoId: [{id,concepto,monto,pagos}] }
  const [eventos, setEventos] = useState([]);        // [{id,fecha,tipo,titulo}]

  // ---- navegación ----
  const [cicloId, setCicloId] = useState(null);
  const [grupoId, setGrupoId] = useState(null);
  const [vista, setVista] = useState('ciclos'); // ciclos | grupos | menu | alumnos | asistencia | actividades | evaluaciones | diario | documentos | cuotas | calendario
  const [matSel, setMatSel] = useState('');

  // -------- CARGA INICIAL --------
  useEffect(() => {
    (async () => {
      const d = await cargarDatos();
      if (d) {
        setCiclos(d.ciclos || []); setGrupos(d.grupos || []);
        setAlumnos(d.alumnos || {}); setAsistencia(d.asistencia || {});
        setMaterias(d.materias || {}); setActividades(d.actividades || {});
        setRasgos(d.rasgos || {}); setEvalScores(d.evalScores || {});
        setDiario(d.diario || {}); setDocs(d.docs || {});
        setCuotas(d.cuotas || {}); setEventos(d.eventos || []);
      }
      setHidratado(true); setCargando(false);
    })();
  }, []);

  // -------- GUARDADO AUTOMÁTICO (debounce 700ms) --------
  useEffect(() => {
    if (!hidratado) return;
    const t = setTimeout(() => {
      guardarDatos({ ciclos, grupos, alumnos, asistencia, materias, actividades, rasgos, evalScores, diario, docs, cuotas, eventos });
    }, 700);
    return () => clearTimeout(t);
  }, [ciclos, grupos, alumnos, asistencia, materias, actividades, rasgos, evalScores, diario, docs, cuotas, eventos, hidratado]);

  if (cargando) return <PantallaCarga />;
  if (!logueado) return <PinScreen onOk={() => { sessionStorage.setItem('tania_pin_ok', '1'); setLogueado(true); }} />;

  const cicloActual = ciclos.find(c => c.id === cicloId);
  const grupoActual = grupos.find(g => g.id === grupoId);
  const gruposCiclo = grupos.filter(g => g.cicloId === cicloId);
  const alumnosGrupo = alumnos[grupoId] || [];
  const matsGrupo = materias[grupoId] || [];

  // -------- navegación helpers --------
  const irGrupos = (cid) => { setCicloId(cid); setVista('grupos'); };
  const irMenu = (gid) => { setGrupoId(gid); setMatSel((materias[gid] || [])[0] || ''); setVista('menu'); };
  const volverGrupo = () => setVista('menu');
  const salir = () => { sessionStorage.removeItem('tania_pin_ok'); setLogueado(false); };

  // -------- materias --------
  const agregarMateria = (m) => {
    if (matsGrupo.includes(m)) return;
    setMaterias({ ...materias, [grupoId]: [...matsGrupo, m] });
    const rg = rasgos[grupoId] || {};
    setRasgos({
      ...rasgos,
      [grupoId]: {
        ...rg,
        [m]: [
          { id: uid(), nombre: 'Asistencia', peso: 10 },
          { id: uid(), nombre: 'Examen', peso: 40 },
          { id: uid(), nombre: 'Actividades', peso: 40 },
          { id: uid(), nombre: 'Conducta', peso: 10 },
        ]
      }
    });
    setMatSel(m);
  };
  const eliminarMateria = (m) => {
    setMaterias({ ...materias, [grupoId]: matsGrupo.filter(x => x !== m) });
    const ra = { ...(rasgos[grupoId] || {}) }; delete ra[m];
    setRasgos({ ...rasgos, [grupoId]: ra });
    const ac = { ...(actividades[grupoId] || {}) }; delete ac[m];
    setActividades({ ...actividades, [grupoId]: ac });
    const ev = { ...(evalScores[grupoId] || {}) }; delete ev[m];
    setEvalScores({ ...evalScores, [grupoId]: ev });
  };

  // -------- cálculos compartidos --------
  const calcFinal = (scores, listaRasgos) => {
    const pesoTotal = listaRasgos.reduce((s, r) => s + (Number(r.peso) || 0), 0);
    if (!pesoTotal) return '–';
    let acc = 0, hay = false;
    listaRasgos.forEach(r => { const sc = scores?.[r.id]; if (sc !== '' && sc != null) { acc += Number(sc) * (Number(r.peso) || 0); hay = true; } });
    return hay ? (acc / pesoTotal).toFixed(1) : '–';
  };
  const calcAsist = (gid, aId, fechas) => {
    const data = asistencia[gid] || {};
    let p = 0, r = 0, f = 0;
    fechas.forEach(fch => { const e = data[fch]?.[aId]; if (e === 'p') p++; else if (e === 'r') r++; else if (e === 'f') f++; });
    const total = p + r + f;
    return { p, r, f, total, pct: total ? Math.round(((p + r * 0.5) / total) * 100) : 0 };
  };
  const calcAct = (gid, materia, aId) => {
    const acts = actividades[gid]?.[materia] || [];
    if (!acts.length) return { done: 0, total: 0, pct: 0 };
    const done = acts.filter(a => a.entregas?.[aId]).length;
    return { done, total: acts.length, pct: Math.round((done / acts.length) * 100) };
  };
  const setEvalScore = (gid, materia, aId, rasgoId, val) => {
    const v = val === '' ? '' : Math.max(0, Math.min(10, Number(val)));
    const gEv = evalScores[gid] || {};
    const mEv = gEv[materia] || {};
    const aEv = mEv[aId] || {};
    setEvalScores({ ...evalScores, [gid]: { ...gEv, [materia]: { ...mEv, [aId]: { ...aEv, [rasgoId]: v } } } });
  };

  // ========================================================
  // SALUDO
  // ========================================================
  const Saludo = () => (
    <div style={{ background: `linear-gradient(135deg, ${C.coral}, ${C.lavanda})`, borderRadius: 24, padding: '18px 22px', marginBottom: 22, color: '#fff', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ background: 'rgba(255,255,255,0.25)', width: 46, height: 46, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sun size={26} /></div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 20 }}>¡Hola, maestra Tania!</p>
        <p style={{ margin: 0, fontFamily: FONT_BODY, fontSize: 13, opacity: 0.9 }}>Que tengas un excelente día 🌷</p>
      </div>
      <button onClick={salir} title="Salir" style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 12, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}><LogOut size={18} /></button>
    </div>
  );

  // ========================================================
  // VISTA: CICLOS
  // ========================================================
  function VistaCiclos() {
    const [nuevo, setNuevo] = useState('');
    return (
      <div>
        <Saludo />
        <Cabecera titulo="Ciclos escolares" color={C.cielo} icon={<GraduationCap size={22} />} />
        <Tarjeta style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={nuevo} onChange={e => setNuevo(e.target.value)} placeholder="Ej. 2026–2027" style={inputStyle} />
            <Boton color={C.menta} onClick={() => { if (!nuevo.trim()) return; setCiclos([...ciclos, { id: uid(), nombre: nuevo.trim() }]); setNuevo(''); }}><Plus size={18} />Crear</Boton>
          </div>
        </Tarjeta>
        {ciclos.length === 0 && <Vacio texto="Aún no hay ciclos escolares. Crea el primero arriba." />}
        {ciclos.map(c => {
          const ng = grupos.filter(g => g.cicloId === c.id).length;
          return (
            <Tarjeta key={c.id} style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div onClick={() => irGrupos(c.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, cursor: 'pointer' }}>
                <div style={{ background: C.cieloSoft, width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.cielo }}><CalendarDays size={22} /></div>
                <div>
                  <p style={{ margin: 0, fontFamily: FONT_TITLE, fontWeight: 700, color: C.texto }}>{c.nombre}</p>
                  <p style={{ margin: 0, fontFamily: FONT_BODY, fontSize: 13, color: C.textoSuave }}>{ng} grupo{ng !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <button onClick={() => { if (window.confirm(`¿Eliminar el ciclo "${c.nombre}"?`)) setCiclos(ciclos.filter(x => x.id !== c.id)); }} style={iconBtn}><Trash2 size={18} color={C.textoSuave} /></button>
            </Tarjeta>
          );
        })}
      </div>
    );
  }

  // ========================================================
  // VISTA: GRUPOS
  // ========================================================
  function VistaGrupos() {
    const [nuevo, setNuevo] = useState('');
    return (
      <div>
        <Cabecera titulo={cicloActual?.nombre || 'Grupos'} color={C.lavanda} icon={<Users size={22} />} onBack={() => setVista('ciclos')} />
        <Tarjeta style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={nuevo} onChange={e => setNuevo(e.target.value)} placeholder="Ej. 1°A" style={inputStyle} />
            <Boton color={C.menta} onClick={() => { if (!nuevo.trim()) return; setGrupos([...grupos, { id: uid(), cicloId, nombre: nuevo.trim() }]); setNuevo(''); }}><Plus size={18} />Crear</Boton>
          </div>
        </Tarjeta>
        {gruposCiclo.length === 0 && <Vacio texto="Crea tu primer grupo para este ciclo." />}
        {gruposCiclo.map(g => {
          const na = (alumnos[g.id] || []).length;
          return (
            <Tarjeta key={g.id} style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div onClick={() => irMenu(g.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, cursor: 'pointer' }}>
                <div style={{ background: C.lavandaSoft, width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.lavanda }}><Users size={22} /></div>
                <div>
                  <p style={{ margin: 0, fontFamily: FONT_TITLE, fontWeight: 700, color: C.texto }}>{g.nombre}</p>
                  <p style={{ margin: 0, fontFamily: FONT_BODY, fontSize: 13, color: C.textoSuave }}>{na} alumno{na !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <button onClick={() => { if (window.confirm(`¿Eliminar el grupo "${g.nombre}"?`)) setGrupos(grupos.filter(x => x.id !== g.id)); }} style={iconBtn}><Trash2 size={18} color={C.textoSuave} /></button>
            </Tarjeta>
          );
        })}
      </div>
    );
  }

  // ========================================================
  // VISTA: MENÚ DE GRUPO
  // ========================================================
  function MenuGrupo() {
    const mods = [
      { k: 'alumnos', t: 'Lista de alumnos', i: <Users size={24} />, c: C.lavanda, bg: C.lavandaSoft },
      { k: 'asistencia', t: 'Asistencia', i: <CheckCircle2 size={24} />, c: C.menta, bg: C.mentaSoft },
      { k: 'evaluaciones', t: 'Evaluaciones', i: <Award size={24} />, c: C.coral, bg: C.coralSoft },
      { k: 'actividades', t: 'Actividades', i: <ClipboardList size={24} />, c: C.cielo, bg: C.cieloSoft },
      { k: 'diario', t: 'Diario de trabajo', i: <NotebookPen size={24} />, c: C.sol, bg: C.solSoft },
      { k: 'documentos', t: 'Documentos', i: <FileCheck size={24} />, c: C.menta, bg: C.mentaSoft },
      { k: 'cuotas', t: 'Cuotas / pagos', i: <DollarSign size={24} />, c: C.lavanda, bg: C.lavandaSoft },
      { k: 'calendario', t: 'Calendario', i: <CalendarDays size={24} />, c: C.cielo, bg: C.cieloSoft },
    ];
    return (
      <div>
        <Cabecera titulo={grupoActual?.nombre || 'Grupo'} color={C.coral} icon={<BookOpen size={22} />} onBack={() => setVista('grupos')} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {mods.map(m => (
            <Tarjeta key={m.k} style={{ cursor: 'pointer', textAlign: 'center', padding: '20px 12px' }}>
              <div onClick={() => setVista(m.k)}>
                <div style={{ background: m.bg, width: 54, height: 54, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.c, margin: '0 auto 10px' }}>{m.i}</div>
                <p style={{ margin: 0, fontFamily: FONT_TITLE, fontWeight: 600, fontSize: 14, color: C.texto }}>{m.t}</p>
              </div>
            </Tarjeta>
          ))}
        </div>
      </div>
    );
  }

  // ========================================================
  // MÓDULO: ALUMNOS (con importación Excel)
  // ========================================================
  function ModAlumnos() {
    const [nombre, setNombre] = useState('');
    const lista = alumnos[grupoId] || [];
    const setLista = (l) => setAlumnos({ ...alumnos, [grupoId]: l });
    const importar = async (e) => {
      const file = e.target.files?.[0]; if (!file) return;
      try {
        const nombres = await importarAlumnosDesdeExcel(file);
        if (!nombres.length) { alert('No se encontraron nombres en la primera columna del Excel.'); return; }
        const nuevos = nombres.map(n => ({ id: uid(), nombre: n }));
        setLista([...lista, ...nuevos]);
        alert(`Se importaron ${nuevos.length} alumnos.`);
      } catch { alert('No se pudo leer el archivo. Verifica que sea un Excel válido.'); }
      e.target.value = '';
    };
    return (
      <div>
        <Cabecera titulo="Lista de alumnos" color={C.lavanda} icon={<Users size={22} />} onBack={volverGrupo} />
        <Tarjeta style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre del alumno" style={inputStyle}
              onKeyDown={e => { if (e.key === 'Enter' && nombre.trim()) { setLista([...lista, { id: uid(), nombre: nombre.trim() }]); setNombre(''); } }} />
            <Boton color={C.menta} onClick={() => { if (!nombre.trim()) return; setLista([...lista, { id: uid(), nombre: nombre.trim() }]); setNombre(''); }}><Plus size={18} /></Boton>
          </div>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: C.cieloSoft, color: C.cielo, fontFamily: FONT_TITLE, fontWeight: 600, fontSize: 14, padding: '10px 16px', borderRadius: 14, width: '100%', justifyContent: 'center', boxSizing: 'border-box' }}>
            <Upload size={18} /> Importar desde Excel
            <input type="file" accept=".xlsx,.xls,.csv" onChange={importar} style={{ display: 'none' }} />
          </label>
        </Tarjeta>
        {lista.length === 0 && <Vacio texto="Agrega alumnos manualmente o impórtalos desde Excel." />}
        {lista.map((a, idx) => (
          <Tarjeta key={a.id} style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: C.lavandaSoft, width: 34, height: 34, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_TITLE, fontWeight: 700, color: C.lavanda, fontSize: 14 }}>{idx + 1}</div>
            <span style={{ flex: 1, fontFamily: FONT_BODY, color: C.texto, fontSize: 15 }}>{a.nombre}</span>
            <button onClick={() => { if (window.confirm(`¿Eliminar a ${a.nombre}?`)) setLista(lista.filter(x => x.id !== a.id)); }} style={iconBtn}><Trash2 size={17} color={C.textoSuave} /></button>
          </Tarjeta>
        ))}
      </div>
    );
  }

  // ========================================================
  // MÓDULO: ASISTENCIA (Por día + Resumen)
  // ========================================================
  function ModAsistencia() {
    const [tab, setTab] = useState('dia');
    const [fecha, setFecha] = useState(hoyISO());
    const data = asistencia[grupoId] || {};
    const setEstado = (aId, estado) => {
      const dia = { ...(data[fecha] || {}) };
      if (dia[aId] === estado) delete dia[aId]; else dia[aId] = estado;
      setAsistencia({ ...asistencia, [grupoId]: { ...data, [fecha]: dia } });
    };
    const todos = (estado) => {
      const dia = {}; alumnosGrupo.forEach(a => { dia[a.id] = estado; });
      setAsistencia({ ...asistencia, [grupoId]: { ...data, [fecha]: dia } });
    };

    const [periodo, setPeriodo] = useState('mes');
    const [mes, setMes] = useState(hoyISO().slice(0, 7));
    const [desde, setDesde] = useState(hoyISO());
    const [hasta, setHasta] = useState(hoyISO());
    const fechasTodas = Object.keys(data);
    let fechasPeriodo = fechasTodas, etiqueta = 'Ciclo';
    if (periodo === 'mes') { fechasPeriodo = fechasTodas.filter(f => f.startsWith(mes)); etiqueta = mes; }
    else if (periodo === 'rango') { fechasPeriodo = fechasTodas.filter(f => f >= desde && f <= hasta); etiqueta = `${desde}_a_${hasta}`; }

    const opciones = [
      { k: 'p', label: 'P', color: C.menta, soft: C.mentaSoft },
      { k: 'r', label: 'R', color: C.sol, soft: C.solSoft },
      { k: 'f', label: 'F', color: C.coral, soft: C.coralSoft },
    ];

    return (
      <div>
        <Cabecera titulo="Asistencia" color={C.menta} icon={<CheckCircle2 size={22} />} onBack={volverGrupo} />
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <button onClick={() => setTab('dia')} style={tabStyle(tab === 'dia', C.menta)}>Por día</button>
          <button onClick={() => setTab('resumen')} style={tabStyle(tab === 'resumen', C.menta)}>Resumen</button>
        </div>

        {tab === 'dia' && (
          <>
            <Tarjeta style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Fecha</label>
              <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={inputStyle} />
              <div style={{ marginTop: 10 }}>
                <Boton soft color={C.menta} onClick={() => todos('p')}>Marcar todos presentes</Boton>
              </div>
            </Tarjeta>
            {alumnosGrupo.length === 0 && <Vacio texto="Primero agrega alumnos al grupo." />}
            {alumnosGrupo.map(a => (
              <Tarjeta key={a.id} style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ flex: 1, fontFamily: FONT_BODY, color: C.texto, fontSize: 15 }}>{a.nombre}</span>
                {opciones.map(o => {
                  const activo = (data[fecha] || {})[a.id] === o.k;
                  return (
                    <button key={o.k} onClick={() => setEstado(a.id, o.k)} style={{ width: 38, height: 38, borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 15, background: activo ? o.color : o.soft, color: activo ? '#fff' : o.color }}>{o.label}</button>
                  );
                })}
              </Tarjeta>
            ))}
          </>
        )}

        {tab === 'resumen' && (
          <>
            <Tarjeta style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Periodo</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                {[['mes', 'Mes'], ['rango', 'Rango'], ['ciclo', 'Ciclo']].map(([k, l]) => (
                  <button key={k} onClick={() => setPeriodo(k)} style={tabStyle(periodo === k, C.menta)}>{l}</button>
                ))}
              </div>
              {periodo === 'mes' && <input type="month" value={mes} onChange={e => setMes(e.target.value)} style={inputStyle} />}
              {periodo === 'rango' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="date" value={desde} onChange={e => setDesde(e.target.value)} style={inputStyle} />
                  <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} style={inputStyle} />
                </div>
              )}
              <div style={{ marginTop: 12 }}>
                <Boton color={C.menta} full onClick={() => exportarAsistencia(alumnosGrupo, data, fechasPeriodo, etiqueta)}><Download size={18} />Exportar a Excel</Boton>
              </div>
            </Tarjeta>
            <Tarjeta>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT_BODY, fontSize: 13 }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: C.textoSuave }}>
                      <th style={thStyle}>Alumno</th><th style={thCenter}>P</th><th style={thCenter}>R</th><th style={thCenter}>F</th><th style={thCenter}>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alumnosGrupo.map(a => {
                      const r = calcAsist(grupoId, a.id, fechasPeriodo);
                      return (
                        <tr key={a.id} style={{ borderTop: `1px solid ${C.fondo}` }}>
                          <td style={tdStyle}>{a.nombre}</td>
                          <td style={tdCenter}>{r.p}</td><td style={tdCenter}>{r.r}</td><td style={tdCenter}>{r.f}</td>
                          <td style={{ ...tdCenter, fontWeight: 700, color: r.pct >= 80 ? C.menta : C.coral }}>{r.pct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Tarjeta>
          </>
        )}
      </div>
    );
  }

  // ========================================================
  // SELECTOR DE MATERIA (con borrado)
  // ========================================================
  function SelectorMateria({ color, onAgregar, onEliminar }) {
    const [nueva, setNueva] = useState('');
    const eliminar = (m, e) => { e.stopPropagation(); if (window.confirm(`¿Eliminar la materia "${m}"? Se borrarán también sus actividades, rasgos y calificaciones.`)) onEliminar(m); };
    return (
      <Tarjeta style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Materia</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          {matsGrupo.map(m => (
            <div key={m} onClick={() => setMatSel(m)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 8px 6px 14px', borderRadius: 999, cursor: 'pointer', background: matSel === m ? color : C.fondo, color: matSel === m ? '#fff' : C.texto, fontFamily: FONT_TITLE, fontWeight: 600, fontSize: 13 }}>
              {m}
              <span onClick={(e) => eliminar(m, e)} style={{ display: 'inline-flex', opacity: 0.85 }}><X size={14} /></span>
            </div>
          ))}
          {matsGrupo.length === 0 && <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.textoSuave }}>Agrega tu primera materia →</span>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={nueva} onChange={e => setNueva(e.target.value)} placeholder="Nueva materia" style={inputStyle}
            onKeyDown={e => { if (e.key === 'Enter' && nueva.trim()) { onAgregar(nueva.trim()); setNueva(''); } }} />
          <Boton color={color} onClick={() => { if (!nueva.trim()) return; onAgregar(nueva.trim()); setNueva(''); }}><Plus size={18} /></Boton>
        </div>
      </Tarjeta>
    );
  }

  // ========================================================
  // MÓDULO: ACTIVIDADES (lista + tabla resumen)
  // ========================================================
  function ModActividades() {
    const [tab, setTab] = useState('lista');
    const [titulo, setTitulo] = useState('');
    const acts = (actividades[grupoId]?.[matSel]) || [];
    const setActs = (l) => setActividades({ ...actividades, [grupoId]: { ...(actividades[grupoId] || {}), [matSel]: l } });
    const toggle = (actId, aId) => setActs(acts.map(a => a.id === actId ? { ...a, entregas: { ...a.entregas, [aId]: !a.entregas?.[aId] } } : a));
    return (
      <div>
        <Cabecera titulo="Actividades" color={C.cielo} icon={<ClipboardList size={22} />} onBack={volverGrupo} />
        <SelectorMateria color={C.cielo} onAgregar={agregarMateria} onEliminar={(m) => { eliminarMateria(m); if (matSel === m) setMatSel(matsGrupo.filter(x => x !== m)[0] || ''); }} />
        {!matSel ? <Vacio texto="Selecciona o crea una materia para registrar actividades." /> : (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <button onClick={() => setTab('lista')} style={tabStyle(tab === 'lista', C.cielo)}>Actividades</button>
              <button onClick={() => setTab('tabla')} style={tabStyle(tab === 'tabla', C.cielo)}>Tabla resumen</button>
            </div>

            {tab === 'lista' && (
              <>
                <Tarjeta style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ej. Tarea 1 · Ecuaciones" style={inputStyle}
                      onKeyDown={e => { if (e.key === 'Enter' && titulo.trim()) { setActs([...acts, { id: uid(), titulo: titulo.trim(), entregas: {} }]); setTitulo(''); } }} />
                    <Boton color={C.cielo} onClick={() => { if (!titulo.trim()) return; setActs([...acts, { id: uid(), titulo: titulo.trim(), entregas: {} }]); setTitulo(''); }}><Plus size={18} /></Boton>
                  </div>
                </Tarjeta>
                {acts.length === 0 && <Vacio texto="Crea la primera actividad de esta materia." />}
                {acts.map(a => {
                  const entregadas = alumnosGrupo.filter(al => a.entregas?.[al.id]).length;
                  return (
                    <Tarjeta key={a.id} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <p style={{ margin: 0, fontFamily: FONT_TITLE, fontWeight: 700, color: C.texto }}>{a.titulo}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Chip bg={C.cieloSoft} color={C.cielo}>{entregadas}/{alumnosGrupo.length}</Chip>
                          <button onClick={() => { if (window.confirm(`¿Eliminar la actividad "${a.titulo}"?`)) setActs(acts.filter(x => x.id !== a.id)); }} style={iconBtn}><Trash2 size={16} color={C.textoSuave} /></button>
                        </div>
                      </div>
                      {alumnosGrupo.map(al => (
                        <div key={al.id} onClick={() => toggle(a.id, al.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', cursor: 'pointer' }}>
                          <div style={{ width: 24, height: 24, borderRadius: 8, background: a.entregas?.[al.id] ? C.cielo : C.cieloSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{a.entregas?.[al.id] && <Check size={15} color="#fff" />}</div>
                          <span style={{ fontFamily: FONT_BODY, color: C.texto, fontSize: 14 }}>{al.nombre}</span>
                        </div>
                      ))}
                    </Tarjeta>
                  );
                })}
              </>
            )}

            {tab === 'tabla' && (
              <Tarjeta>
                <div style={{ marginBottom: 12 }}>
                  <Boton color={C.cielo} full onClick={() => exportarActividades(matSel, alumnosGrupo, acts)}><Download size={18} />Exportar a Excel</Boton>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT_BODY, fontSize: 13 }}>
                    <thead>
                      <tr style={{ textAlign: 'left', color: C.textoSuave }}>
                        <th style={thStyle}>Alumno</th><th style={thCenter}>Entregadas</th><th style={thCenter}>%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alumnosGrupo.map(al => {
                        const r = calcAct(grupoId, matSel, al.id);
                        return (
                          <tr key={al.id} style={{ borderTop: `1px solid ${C.fondo}` }}>
                            <td style={tdStyle}>{al.nombre}</td>
                            <td style={tdCenter}>{r.done}/{r.total}</td>
                            <td style={{ ...tdCenter, fontWeight: 700, color: r.pct >= 80 ? C.menta : C.coral }}>{r.pct}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Tarjeta>
            )}
          </>
        )}
      </div>
    );
  }

  // ========================================================
  // MÓDULO: EVALUACIONES (rasgos ponderados + autollenado)
  // ========================================================
  function ModEvaluaciones() {
    const [config, setConfig] = useState(false);
    const listaRasgos = (rasgos[grupoId]?.[matSel]) || [];
    const scoresMat = (evalScores[grupoId]?.[matSel]) || {};
    const setRasgosMat = (l) => setRasgos({ ...rasgos, [grupoId]: { ...(rasgos[grupoId] || {}), [matSel]: l } });
    const pesoTotal = listaRasgos.reduce((s, r) => s + (Number(r.peso) || 0), 0);

    const autollenar = () => {
      const fechas = Object.keys(asistencia[grupoId] || {});
      const rAsis = listaRasgos.find(r => /asist/i.test(r.nombre));
      const rAct = listaRasgos.find(r => /activ/i.test(r.nombre));
      const gEv = evalScores[grupoId] || {};
      const mEv = { ...(gEv[matSel] || {}) };
      alumnosGrupo.forEach(al => {
        const aEv = { ...(mEv[al.id] || {}) };
        if (rAsis) aEv[rAsis.id] = +(calcAsist(grupoId, al.id, fechas).pct / 10).toFixed(1);
        if (rAct) aEv[rAct.id] = +(calcAct(grupoId, matSel, al.id).pct / 10).toFixed(1);
        mEv[al.id] = aEv;
      });
      setEvalScores({ ...evalScores, [grupoId]: { ...gEv, [matSel]: mEv } });
    };

    return (
      <div>
        <Cabecera titulo="Evaluaciones" color={C.coral} icon={<Award size={22} />} onBack={volverGrupo} />
        <SelectorMateria color={C.coral} onAgregar={agregarMateria} onEliminar={(m) => { eliminarMateria(m); if (matSel === m) setMatSel(matsGrupo.filter(x => x !== m)[0] || ''); }} />
        {!matSel ? <Vacio texto="Selecciona o crea una materia para evaluar." /> : (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <Boton soft color={C.coral} onClick={() => setConfig(c => !c)}>{config ? 'Cerrar pesos' : 'Configurar pesos'}</Boton>
              <Boton soft color={C.menta} onClick={autollenar}><Wand2 size={16} />Autollenar</Boton>
            </div>

            {config && (
              <Tarjeta style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Rasgos y pesos (suman {pesoTotal}%)</label>
                {listaRasgos.map(r => (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <input value={r.nombre} onChange={e => setRasgosMat(listaRasgos.map(x => x.id === r.id ? { ...x, nombre: e.target.value } : x))} style={{ ...inputStyle, flex: 2 }} />
                    <input type="number" value={r.peso} onChange={e => setRasgosMat(listaRasgos.map(x => x.id === r.id ? { ...x, peso: Number(e.target.value) || 0 } : x))} style={{ ...inputStyle, flex: 1, textAlign: 'center' }} />
                    <span style={{ fontFamily: FONT_TITLE, color: C.textoSuave }}>%</span>
                    <button onClick={() => setRasgosMat(listaRasgos.filter(x => x.id !== r.id))} style={iconBtn}><Trash2 size={16} color={C.textoSuave} /></button>
                  </div>
                ))}
                <Boton soft color={C.coral} full onClick={() => setRasgosMat([...listaRasgos, { id: uid(), nombre: 'Nuevo rasgo', peso: 0 }])}><Plus size={16} />Agregar rasgo</Boton>
                {pesoTotal !== 100 && <p style={{ color: C.coral, fontFamily: FONT_BODY, fontSize: 12, margin: '10px 0 0' }}>Los pesos suman {pesoTotal}%. Ajústalos a 100% para una calificación exacta.</p>}
              </Tarjeta>
            )}

            <Tarjeta>
              <div style={{ marginBottom: 12 }}>
                <Boton color={C.coral} full onClick={() => exportarEvaluacion(matSel, alumnosGrupo, listaRasgos, scoresMat, calcFinal)}><Download size={18} />Exportar a Excel</Boton>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT_BODY, fontSize: 13 }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: C.textoSuave }}>
                      <th style={thStyle}>Alumno</th>
                      {listaRasgos.map(r => <th key={r.id} style={thCenter}>{r.nombre}<br /><span style={{ fontWeight: 400 }}>({r.peso}%)</span></th>)}
                      <th style={thCenter}>Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alumnosGrupo.map(al => {
                      const sc = scoresMat[al.id] || {};
                      const final = calcFinal(sc, listaRasgos);
                      return (
                        <tr key={al.id} style={{ borderTop: `1px solid ${C.fondo}` }}>
                          <td style={tdStyle}>{al.nombre}</td>
                          {listaRasgos.map(r => (
                            <td key={r.id} style={tdCenter}>
                              <input type="number" min="0" max="10" step="0.1" value={sc[r.id] ?? ''} onChange={e => setEvalScore(grupoId, matSel, al.id, r.id, e.target.value)} style={{ width: 48, textAlign: 'center', border: `2px solid ${C.lavandaSoft}`, borderRadius: 10, padding: '6px 4px', fontFamily: FONT_BODY, fontSize: 13, color: C.texto, outline: 'none' }} />
                            </td>
                          ))}
                          <td style={{ ...tdCenter, fontWeight: 700, color: final !== '–' && Number(final) >= 6 ? C.menta : C.coral }}>{final}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Tarjeta>
          </>
        )}
      </div>
    );
  }

  // ========================================================
  // MÓDULO: DIARIO DE TRABAJO
  // ========================================================
  function ModDiario() {
    const [fecha, setFecha] = useState(hoyISO());
    const [texto, setTexto] = useState('');
    const lista = diario[grupoId] || [];
    const setLista = (l) => setDiario({ ...diario, [grupoId]: l });
    return (
      <div>
        <Cabecera titulo="Diario de trabajo" color={C.sol} icon={<NotebookPen size={22} />} onBack={volverGrupo} />
        <Tarjeta style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Fecha</label>
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={{ ...inputStyle, marginBottom: 8 }} />
          <textarea value={texto} onChange={e => setTexto(e.target.value)} placeholder="¿Qué se trabajó hoy?" rows={3} style={{ ...inputStyle, resize: 'vertical', marginBottom: 10 }} />
          <Boton color={C.sol} full onClick={() => { if (!texto.trim()) return; setLista([{ id: uid(), fecha, texto: texto.trim() }, ...lista]); setTexto(''); }}><Plus size={18} />Guardar nota</Boton>
        </Tarjeta>
        {lista.length === 0 && <Vacio texto="Registra lo que trabajas día con día." />}
        {lista.map(n => (
          <Tarjeta key={n.id} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Chip bg={C.solSoft} color={'#C9931A'}>{n.fecha}</Chip>
              <button onClick={() => setLista(lista.filter(x => x.id !== n.id))} style={iconBtn}><Trash2 size={16} color={C.textoSuave} /></button>
            </div>
            <p style={{ margin: 0, fontFamily: FONT_BODY, color: C.texto, fontSize: 14, whiteSpace: 'pre-wrap' }}>{n.texto}</p>
          </Tarjeta>
        ))}
      </div>
    );
  }

  // ========================================================
  // MÓDULO: DOCUMENTOS
  // ========================================================
  function ModDocumentos() {
    const [nombre, setNombre] = useState('');
    const lista = docs[grupoId] || [];
    const toggle = (dId, aId) => setDocs({ ...docs, [grupoId]: lista.map(d => d.id === dId ? { ...d, entregas: { ...d.entregas, [aId]: !d.entregas?.[aId] } } : d) });
    return (
      <div>
        <Cabecera titulo="Documentos" color={C.menta} icon={<FileCheck size={22} />} onBack={volverGrupo} />
        <Tarjeta style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. Acta de nacimiento" style={inputStyle} />
            <Boton color={C.menta} onClick={() => { if (!nombre.trim()) return; setDocs({ ...docs, [grupoId]: [...lista, { id: uid(), nombre: nombre.trim(), entregas: {} }] }); setNombre(''); }}><Plus size={18} /></Boton>
          </div>
        </Tarjeta>
        {lista.length === 0 && <Vacio texto="Registra los documentos que pides a los alumnos." />}
        {lista.map(d => {
          const entregados = alumnosGrupo.filter(a => d.entregas?.[a.id]).length;
          return (
            <Tarjeta key={d.id} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <p style={{ margin: 0, fontFamily: FONT_TITLE, fontWeight: 700, color: C.texto }}>{d.nombre}</p>
                <Chip bg={C.mentaSoft} color={C.menta}>{entregados}/{alumnosGrupo.length}</Chip>
              </div>
              {alumnosGrupo.map(a => (
                <div key={a.id} onClick={() => toggle(d.id, a.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', cursor: 'pointer' }}>
                  <div style={{ width: 24, height: 24, borderRadius: 8, background: d.entregas?.[a.id] ? C.menta : C.mentaSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{d.entregas?.[a.id] && <Check size={15} color="#fff" />}</div>
                  <span style={{ fontFamily: FONT_BODY, color: C.texto, fontSize: 14 }}>{a.nombre}</span>
                </div>
              ))}
              <button onClick={() => { if (window.confirm(`¿Eliminar el documento "${d.nombre}"?`)) setDocs({ ...docs, [grupoId]: lista.filter(x => x.id !== d.id) }); }} style={{ ...iconBtn, marginTop: 6 }}><Trash2 size={16} color={C.textoSuave} /></button>
            </Tarjeta>
          );
        })}
      </div>
    );
  }

  // ========================================================
  // MÓDULO: CUOTAS / PAGOS
  // ========================================================
  function ModCuotas() {
    const [concepto, setConcepto] = useState('');
    const [monto, setMonto] = useState('');
    const lista = cuotas[grupoId] || [];
    const toggle = (cId, aId) => setCuotas({ ...cuotas, [grupoId]: lista.map(c => c.id === cId ? { ...c, pagos: { ...c.pagos, [aId]: !c.pagos?.[aId] } } : c) });
    return (
      <div>
        <Cabecera titulo="Cuotas / pagos" color={C.lavanda} icon={<DollarSign size={22} />} onBack={volverGrupo} />
        <Tarjeta style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Nueva cuota</label>
          <input value={concepto} onChange={e => setConcepto(e.target.value)} placeholder="Ej. Cooperación anual" style={{ ...inputStyle, marginBottom: 8 }} />
          <input value={monto} onChange={e => setMonto(e.target.value)} type="number" placeholder="Monto $" style={{ ...inputStyle, marginBottom: 10 }} />
          <Boton color={C.lavanda} full onClick={() => { if (!concepto.trim()) return; setCuotas({ ...cuotas, [grupoId]: [...lista, { id: uid(), concepto: concepto.trim(), monto: Number(monto) || 0, pagos: {} }] }); setConcepto(''); setMonto(''); }}><Plus size={18} />Agregar cuota</Boton>
        </Tarjeta>
        {lista.length === 0 && <Vacio texto="Registra cuotas o cooperaciones del grupo." />}
        {lista.map(c => {
          const pagados = alumnosGrupo.filter(a => c.pagos?.[a.id]).length;
          const recaudado = pagados * c.monto;
          return (
            <Tarjeta key={c.id} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <p style={{ margin: 0, fontFamily: FONT_TITLE, fontWeight: 700, color: C.texto }}>{c.concepto}</p>
                <span style={{ fontFamily: FONT_TITLE, fontWeight: 700, color: C.lavanda }}>${c.monto}</span>
              </div>
              <Chip bg={C.lavandaSoft} color={C.lavanda}>{pagados}/{alumnosGrupo.length} pagados · ${recaudado} recaudado</Chip>
              <div style={{ marginTop: 10 }}>
                {alumnosGrupo.map(a => (
                  <div key={a.id} onClick={() => toggle(c.id, a.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', cursor: 'pointer' }}>
                    <div style={{ width: 24, height: 24, borderRadius: 8, background: c.pagos?.[a.id] ? C.menta : C.coralSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.pagos?.[a.id] ? <Check size={15} color="#fff" /> : <X size={14} color={C.coral} />}</div>
                    <span style={{ fontFamily: FONT_BODY, color: C.texto, fontSize: 14 }}>{a.nombre}</span>
                    <span style={{ marginLeft: 'auto', fontFamily: FONT_BODY, fontSize: 12, fontWeight: 600, color: c.pagos?.[a.id] ? C.menta : C.coral }}>{c.pagos?.[a.id] ? 'Pagado' : 'Pendiente'}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => { if (window.confirm(`¿Eliminar la cuota "${c.concepto}"?`)) setCuotas({ ...cuotas, [grupoId]: lista.filter(x => x.id !== c.id) }); }} style={{ ...iconBtn, marginTop: 6 }}><Trash2 size={16} color={C.textoSuave} /></button>
            </Tarjeta>
          );
        })}
      </div>
    );
  }

  // ========================================================
  // MÓDULO: CALENDARIO
  // ========================================================
  function ModCalendario() {
    const [cursor, setCursor] = useState(new Date());
    const [tipo, setTipo] = useState('clase');
    const tipos = [
      { k: 'clase', label: 'Día laboral', color: C.menta },
      { k: 'consejo', label: 'Consejo técnico', color: C.lavanda },
      { k: 'junta', label: 'Junta de padres', color: C.coral },
      { k: 'suspension', label: 'Suspensión', color: C.sol },
    ];
    const y = cursor.getFullYear(), m = cursor.getMonth();
    const primerDia = new Date(y, m, 1).getDay();
    const diasMes = new Date(y, m + 1, 0).getDate();
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const fechaStr = (d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const evDia = (d) => eventos.find(e => e.fecha === fechaStr(d));
    const marcar = (d) => {
      const f = fechaStr(d); const ya = eventos.find(e => e.fecha === f);
      if (ya && ya.tipo === tipo) setEventos(eventos.filter(e => e.fecha !== f));
      else { const sin = eventos.filter(e => e.fecha !== f); const t = tipos.find(x => x.k === tipo); setEventos([...sin, { id: uid(), fecha: f, tipo, titulo: t.label }]); }
    };
    const celdas = [];
    for (let i = 0; i < primerDia; i++) celdas.push(null);
    for (let d = 1; d <= diasMes; d++) celdas.push(d);
    return (
      <div>
        <Cabecera titulo="Calendario" color={C.cielo} icon={<CalendarDays size={22} />} onBack={volverGrupo} />
        <Tarjeta style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Marca con</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {tipos.map(t => (
              <button key={t.k} onClick={() => setTipo(t.k)} style={{ padding: '6px 12px', borderRadius: 999, border: tipo === t.k ? `2px solid ${t.color}` : `2px solid ${C.fondo}`, background: tipo === t.k ? t.color : C.fondo, color: tipo === t.k ? '#fff' : C.texto, fontFamily: FONT_TITLE, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>{t.label}</button>
            ))}
          </div>
        </Tarjeta>
        <Tarjeta>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <button onClick={() => setCursor(new Date(y, m - 1, 1))} style={iconBtn}><ChevronLeft size={22} color={C.texto} /></button>
            <p style={{ margin: 0, fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 17, color: C.texto }}>{meses[m]} {y}</p>
            <button onClick={() => setCursor(new Date(y, m + 1, 1))} style={iconBtn}><ChevronRight size={22} color={C.texto} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 4 }}>
            {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => <div key={i} style={{ textAlign: 'center', fontFamily: FONT_TITLE, fontSize: 12, color: C.textoSuave, fontWeight: 600 }}>{d}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
            {celdas.map((d, i) => {
              if (!d) return <div key={i} />;
              const e = evDia(d); const t = e && tipos.find(x => x.k === e.tipo);
              return (
                <button key={i} onClick={() => marcar(d)} style={{ aspectRatio: '1', borderRadius: 12, border: 'none', cursor: 'pointer', background: t ? t.color : C.fondo, color: t ? '#fff' : C.texto, fontFamily: FONT_TITLE, fontWeight: 600, fontSize: 14 }}>{d}</button>
              );
            })}
          </div>
        </Tarjeta>
      </div>
    );
  }

  // ========================================================
  // ROUTER DE VISTAS
  // ========================================================
  const render = () => {
    switch (vista) {
      case 'ciclos': return <VistaCiclos />;
      case 'grupos': return <VistaGrupos />;
      case 'menu': return <MenuGrupo />;
      case 'alumnos': return <ModAlumnos />;
      case 'asistencia': return <ModAsistencia />;
      case 'actividades': return <ModActividades />;
      case 'evaluaciones': return <ModEvaluaciones />;
      case 'diario': return <ModDiario />;
      case 'documentos': return <ModDocumentos />;
      case 'cuotas': return <ModCuotas />;
      case 'calendario': return <ModCalendario />;
      default: return <VistaCiclos />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.fondo, fontFamily: FONT_BODY }}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '20px 16px 48px' }}>
        {render()}
      </div>
    </div>
  );
}

// ============================================================
// estilos de tabla / tabs
// ============================================================
const thStyle = { padding: '8px 6px', fontFamily: FONT_TITLE, fontWeight: 600, fontSize: 12 };
const thCenter = { ...thStyle, textAlign: 'center' };
const tdStyle = { padding: '8px 6px', color: C.texto };
const tdCenter = { ...tdStyle, textAlign: 'center' };
function tabStyle(activo, color) {
  return { flex: 1, padding: '9px 12px', borderRadius: 14, border: 'none', cursor: 'pointer', fontFamily: FONT_TITLE, fontWeight: 600, fontSize: 14, background: activo ? color : C.blanco, color: activo ? '#fff' : C.textoSuave, boxShadow: activo ? 'none' : '0 2px 8px rgba(74,68,88,0.06)' };
}
