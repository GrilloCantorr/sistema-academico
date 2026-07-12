import { useState, useEffect } from "react";
import { solicitarMatricula, obtenerPeriodoActual, obtenerCursosDisponibles, urlDescargarFicha } from "../servicios/matricula.servicio";

const NOMBRES_DIA = ["", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];

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
    if (!resCursos.error) setDatosCursos(resCursos.data);
    if (resCursos.error) setError(resCursos.error);
    setCargando(false);
  }

  function toggleCurso(cursoId) {
    setSeleccionados((prev) => {
      if (prev.includes(cursoId)) return prev.filter((id) => id !== cursoId);
      const curso = datosCursos?.regular?.concat(datosCursos?.repetir || []).concat(datosCursos?.adelanto || []).find((c) => c.id === cursoId);
      if (!curso) return prev;
      const creditosActuales = prev.reduce((sum, id) => {
        const c = datosCursos?.regular?.concat(datosCursos?.repetir || []).concat(datosCursos?.adelanto || []).find((x) => x.id === id);
        return sum + (c?.creditos || 0);
      }, 0);
      if (creditosActuales + (curso.creditos || 0) > MAX_CREDITOS) return prev;
      const conflicto = prev.some((id) => {
        const otro = datosCursos?.regular?.concat(datosCursos?.repetir || []).concat(datosCursos?.adelanto || []).find((x) => x.id === id);
        return otro && hayConflictoHorario(curso, otro);
      });
      if (conflicto) return prev;
      return [...prev, cursoId];
    });
  }

  function creditosSeleccionados() {
    return seleccionados.reduce((sum, id) => {
      const curso = datosCursos?.regular?.concat(datosCursos?.repetir || []).concat(datosCursos?.adelanto || []).find((c) => c.id === id);
      return sum + (curso?.creditos || 0);
    }, 0);
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    if (seleccionados.length === 0) { setError("Selecciona al menos un curso."); return; }
    setError(null);
    setMensaje(null);
    setEnviando(true);
    const { data, error } = await solicitarMatricula(seleccionados);
    setEnviando(false);
    if (error) { setError(error); return; }
    setMensaje("Solicitud de matricula enviada correctamente.");
    setUltimaMatriculaId(data?.matricula_id);
    setSeleccionados([]);
  }

  function renderCurso(curso, idx) {
    const checked = seleccionados.includes(curso.id);
    const creditos = curso.creditos || 0;
    return (
      <tr key={curso.id || idx} className="hover:bg-gray-50">
        <td className="px-4 py-3">
          <input
            type="checkbox"
            checked={checked}
            onChange={() => toggleCurso(curso.id)}
            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
          />
        </td>
        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{curso.nombre}</td>
        <td className="px-4 py-3 text-sm text-gray-600">{creditos}</td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {curso.horarios?.map((h, i) => (
            <span key={i} className="block">{NOMBRES_DIA[h.dia] || "?"} {h.hora_inicio?.slice(0, 5)}-{h.hora_fin?.slice(0, 5)}</span>
          )) || "-"}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">{curso.aula || "-"}</td>
      </tr>
    );
  }

  const Categorias = ({ titulo, cursos, color }) => {
    if (!cursos?.length) return null;
    return (
      <div className="mb-6">
        <h4 className={`text-sm font-semibold ${color} uppercase tracking-wider mb-3`}>{titulo}</h4>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-10"></th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Curso</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Creditos</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Horario</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Aula</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">{cursos.map((c, i) => renderCurso(c, i))}</tbody>
          </table>
        </div>
      </div>
    );
  };

  const creditosTotales = creditosSeleccionados();

  if (cargando) {
    return <div className="bg-white rounded-lg border border-gray-200 p-6"><p className="text-sm text-gray-500">Cargando...</p></div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Solicitar matricula</h2>
        <p className="text-sm text-gray-500 mt-1">
          {periodo ? `Periodo academico: ${periodo.nombre || periodo}` : "Cargando periodo..."}
        </p>
      </div>

      {error && <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}
      {mensaje && <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{mensaje}</div>}

      {ultimaMatriculaId && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700 font-medium mb-2">Tu solicitud fue registrada.</p>
          <a
            href={urlDescargarFicha(ultimaMatriculaId)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 text-sm font-medium text-green-700 bg-white border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
          >
            Descargar ficha
          </a>
        </div>
      )}

      {error && !mensaje && error.includes("creditos") && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800 font-medium">Limite de creditos: maximo {MAX_CREDITOS} creditos por ciclo.</p>
        </div>
      )}

      {datosCursos ? (
        <form onSubmit={manejarEnvio}>
          <Categorias titulo="Cursos regulares" cursos={datosCursos.regular} color="text-gray-700" />
          <Categorias titulo="Cursos a repetir" cursos={datosCursos.repetir} color="text-red-600" />
          <Categorias titulo="Cursos de adelanto" cursos={datosCursos.adelanto} color="text-blue-600" />

          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">Creditos seleccionados:</span>
              <span className="text-lg font-bold text-gray-900">{creditosTotales} / {MAX_CREDITOS}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={enviando || seleccionados.length === 0}
            className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {enviando ? "Enviando..." : "Enviar solicitud de matricula"}
          </button>
        </form>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-500">
            {error || "No hay cursos disponibles para matricula en este periodo."}
          </p>
        </div>
      )}
    </div>
  );
}
