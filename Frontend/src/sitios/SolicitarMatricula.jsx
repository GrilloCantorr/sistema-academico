import { useState, useEffect } from "react";
import { solicitarMatricula, obtenerPeriodoActual, obtenerCursosDisponibles, urlDescargarFicha } from "../servicios/matricula.servicio";

const NOMBRES_DIA = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

function hayConflictoHorario(cursoA, cursoB) {
  if (!cursoA.horarios?.length || !cursoB.horarios?.length) return false;
  for (const ha of cursoA.horarios) {
    for (const hb of cursoB.horarios) {
      if (ha.dia !== hb.dia) continue;
      const ai = ha.hora_inicio, af = ha.hora_fin;
      const bi = hb.hora_inicio, bf = hb.hora_fin;
      if (ai < bf && af > bi) return true;
    }
  }
  return false;
}

const MAX_CREDITOS = 22;

export default function SolicitarMatricula() {
  const [periodo, setPeriodo] = useState(null);
  const [datosCursos, setDatosCursos] = useState(null);
  const [seleccionados, setSeleccionados] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [ultimaMatriculaId, setUltimaMatriculaId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => { cargarDatos(); }, []);

  async function cargarDatos() {
    setCargando(true);
    const [resPeriodo, resCursos] = await Promise.all([
      obtenerPeriodoActual(),
      obtenerCursosDisponibles(),
    ]);
    if (!resPeriodo.error) setPeriodo(resPeriodo.data);
    if (!resCursos.error) {
      const cursos = (resCursos.data.cursos || []).map(c => ({
        ...c,
        id: c.curso_id,
        nombre: c.curso_nombre
      }));
      setDatosCursos({
        regular: cursos.filter(c => c.tipo === "regular"),
        repetir: cursos.filter(c => c.tipo === "repetir"),
        adelanto: cursos.filter(c => c.tipo === "adelanto"),
      });
    }
    if (resCursos.error) setError(resCursos.error);
    setCargando(false);
  }

  function toggleCurso(seccionId) {
    setSeleccionados((prev) => {
      if (prev.includes(seccionId)) return prev.filter((id) => id !== seccionId);
      const allCursos = datosCursos?.regular?.concat(datosCursos?.repetir || []).concat(datosCursos?.adelanto || []) || [];
      const curso = allCursos.find((c) => c.seccion_curso_id === seccionId);
      if (!curso) return prev;
      const creditosActuales = prev.reduce((sum, id) => {
        const c = allCursos.find((x) => x.seccion_curso_id === id);
        return sum + (c?.creditos || 0);
      }, 0);
      if (creditosActuales + (curso.creditos || 0) > MAX_CREDITOS) {
        setError(`Límite excedido: No puedes matricularte en más de ${MAX_CREDITOS} créditos.`);
        return prev;
      }
      const conflicto = prev.some((id) => {
        const otro = allCursos.find((x) => x.seccion_curso_id === id);
        return otro && hayConflictoHorario(curso, otro);
      });
      if (conflicto) {
        setError("Conflicto de horario detectado con otra asignatura seleccionada.");
        return prev;
      }
      setError(null);
      return [...prev, seccionId];
    });
  }

  function creditosSeleccionados() {
    return seleccionados.reduce((sum, id) => {
      const allCursos = datosCursos?.regular?.concat(datosCursos?.repetir || []).concat(datosCursos?.adelanto || []) || [];
      const curso = allCursos.find((c) => c.seccion_curso_id === id);
      return sum + (curso?.creditos || 0);
    }, 0);
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    if (seleccionados.length === 0) { setError("Seleccione al menos un curso de la oferta académica."); return; }
    setError(null);
    setMensaje(null);
    setEnviando(true);
    const { data, error } = await solicitarMatricula(seleccionados);
    setEnviando(false);
    if (error) { setError(error); return; }
    setMensaje("Solicitud de matrícula enviada y registrada en el sistema.");
    setUltimaMatriculaId(data?.matricula_id);
    setSeleccionados([]);
  }

  function renderCurso(curso, idx) {
    const checked = seleccionados.includes(curso.seccion_curso_id);
    const creditos = curso.creditos || 0;
    return (
      <tr key={curso.id || idx} className={`hover:bg-gray-50/50 transition-colors ${!curso.habilitado ? "opacity-50 bg-gray-50" : ""}`}>
        <td className="px-6 py-4 text-center">
          <input
            type="checkbox"
            checked={checked}
            onChange={() => toggleCurso(curso.seccion_curso_id)}
            disabled={!curso.habilitado}
            className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer disabled:cursor-not-allowed"
          />
        </td>
        <td className="px-6 py-4">
          <span className="text-gray-900 font-bold block text-base">{curso.nombre}</span>
          <span className="text-xs text-gray-400 block mt-0.5">Sección ID: {curso.seccion_curso_id} · Aula: {curso.aula || "—"}</span>
          {!curso.habilitado && curso.motivo_bloqueo && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-700 border border-red-200 mt-1.5">{curso.motivo_bloqueo}</span>
          )}
        </td>
        <td className="px-6 py-4 text-center font-extrabold text-gray-700 text-lg">{creditos} cr.</td>
        <td className="px-6 py-4">
          <div className="text-sm text-gray-700 font-semibold space-y-1">
            {curso.horarios?.map((h, i) => (
              <span key={i} className="block bg-slate-50 border border-gray-200/60 rounded px-2.5 py-1 inline-block mr-1">{NOMBRES_DIA[h.dia] || "?"} — {h.hora_inicio?.slice(0, 5)} a {h.hora_fin?.slice(0, 5)}</span>
            )) || "—"}
          </div>
        </td>
      </tr>
    );
  }

  const Categorias = ({ titulo, cursos, colorBadge, colorText }) => {
    if (!cursos?.length) return null;
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm mb-8">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">{titulo}</h3>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${colorBadge}`}>{cursos.length} Ofertas</span>
        </div>
        <table className="w-full text-base">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-14">Inscribir</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Asignatura / Curso</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-28">Créditos</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Horario de Clases</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">{cursos.map((c, i) => renderCurso(c, i))}</tbody>
        </table>
      </div>
    );
  };

  const creditosTotales = creditosSeleccionados();
  const creditosPorcentaje = Math.min((creditosTotales / MAX_CREDITOS) * 100, 100);

  if (cargando) {
    return <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm text-center"><p className="text-sm text-gray-500">Cargando oferta académica...</p></div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Inscripción y Solicitud de Matrícula</h2>
        <p className="text-base text-gray-500 mt-1">
          {periodo ? `Periodo Académico Vigente: ${periodo.nombre || periodo}` : "Cargando periodo..."}
        </p>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl shadow-sm">⚠ {error}</div>}
      {mensaje && <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold rounded-xl shadow-sm">✓ {mensaje}</div>}

      {ultimaMatriculaId && (
        <div className="mb-8 bg-green-50 border border-green-200 rounded-xl p-6 shadow-sm">
          <p className="text-base text-green-800 font-bold mb-3">✓ ¡Su solicitud de matrícula ha sido procesada correctamente!</p>
          <a
            href={urlDescargarFicha(ultimaMatriculaId)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-5 py-2.5 text-sm font-semibold text-green-700 bg-white border border-green-300 rounded-lg hover:bg-green-100 transition-colors shadow-sm no-underline"
          >
            Descargar Constancia de Solicitud (PDF)
          </a>
        </div>
      )}

      {datosCursos ? (
        <form onSubmit={manejarEnvio}>
          <Categorias titulo="Cursos Regulares" cursos={datosCursos.regular} colorBadge="bg-gray-50 text-gray-700 border-gray-200" />
          <Categorias titulo="Cursos a Repetir (Requerido)" cursos={datosCursos.repetir} colorBadge="bg-red-50 text-red-700 border-red-200" />
          <Categorias titulo="Cursos de Adelanto" cursos={datosCursos.adelanto} colorBadge="bg-blue-50 text-blue-700 border-blue-200" />

          {/* Panel de Control de Créditos y Envío */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="w-full md:w-2/3">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-base font-bold text-gray-750">Créditos de Matrícula Seleccionados</span>
                <span className="text-xl font-black text-gray-900">{creditosTotales} / {MAX_CREDITOS} cr.</span>
              </div>
              <div className="w-full h-4 bg-gray-150 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-350 ${
                    creditosTotales > 18 ? "bg-primary-dark" : "bg-primary"
                  }`} 
                  style={{ width: `${creditosPorcentaje}%` }} 
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={enviando || seleccionados.length === 0}
              className="w-full md:w-auto px-8 py-3.5 bg-primary text-white text-base font-bold rounded-lg hover:bg-primary-hover disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer whitespace-nowrap"
            >
              {enviando ? "Registrando solicitud..." : "Enviar Solicitud Académica"}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm text-center">
          <p className="text-base text-gray-500">
            {error || "No se registran asignaturas disponibles para matrícula en este periodo académico."}
          </p>
        </div>
      )}
    </div>
  );
}
