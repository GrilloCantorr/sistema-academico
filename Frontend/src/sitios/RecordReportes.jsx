import { useEffect, useState } from "react";
import {
  desempenoPorCohorte, reportesConsolidados, buscarEstudiantes, kardexEstudiante, urlKardexPdf,
} from "../servicios/recordAcademico.servicio";

export default function RecordReportes() {
  const [resumen, setResumen] = useState(null);
  const [cohortes, setCohortes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [kardex, setKardex] = useState(null);
  const [cargandoKardex, setCargandoKardex] = useState(false);
  const [filtroCurso, setFiltroCurso] = useState("todos");

  useEffect(() => { cargarDatos(); }, []);

  async function cargarDatos() {
    setCargando(true);
    setError(null);
    const [resResumen, resCohortes] = await Promise.all([reportesConsolidados(), desempenoPorCohorte()]);
    setCargando(false);
    if (resResumen.error) { setError(resResumen.error); return; }
    setResumen(resResumen.data);
    if (!resCohortes.error) setCohortes(resCohortes.data);
  }

  async function manejarBusqueda(e) {
    const val = e.target.value;
    setBusqueda(val);
    if (val.length < 2) { setResultados([]); return; }
    setBuscando(true);
    const res = await buscarEstudiantes(val);
    setBuscando(false);
    if (!res.error) setResultados(res.data);
  }

  async function seleccionarEstudiante(est) {
    setKardex(null);
    setBusqueda(est.nombre_completo);
    setResultados([]);
    setCargandoKardex(true);
    const res = await kardexEstudiante(est.id);
    setCargandoKardex(false);
    if (res.error) { setError(res.error); return; }
    setKardex(res.data);
  }

  function cerrarKardex() { setKardex(null); setBusqueda(""); setResultados([]); }

  const aprobados = kardex?.cursos?.filter((c) => c.estado_nombre === "Aprobado").length ?? 0;
  const cursosFiltrados = !kardex?.cursos ? [] : filtroCurso === "todos" ? kardex.cursos
    : kardex.cursos.filter((c) => filtroCurso === "aprobados" ? c.estado_nombre === "Aprobado" : c.estado_nombre !== "Aprobado");

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Reportes academicos</h2>
        <p className="text-sm text-gray-500 mt-1">Consulta el resumen institucional y el kardex detallado de cualquier estudiante.</p>
      </div>

      {error && <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Kardex de estudiante</h3>
        <div className="relative">
          <input type="text" placeholder="Buscar por codigo, nombre, apellido o correo..." value={busqueda} onChange={manejarBusqueda} />
          {buscando && <p className="mt-1.5 text-xs text-gray-500">Buscando...</p>}
          {resultados.length > 0 && (
            <ul className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto mt-1 list-none p-0">
              {resultados.map((est) => (
                <li key={est.id} onClick={() => seleccionarEstudiante(est)}
                  className="px-3.5 py-2.5 cursor-pointer border-b border-gray-100 text-sm hover:bg-blue-50">
                  <strong className="text-gray-900">{est.nombre_completo}</strong>
                  <span className="text-gray-500 ml-2">ID {est.id}</span>
                  <div className="text-xs text-gray-400">{est.especialidad_nombre} — {est.correo_institucional}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {cargandoKardex && <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8"><p className="text-sm text-gray-500">Cargando kardex...</p></div>}

      {kardex && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Kardex — {kardex.estudiante.nombre_completo}</h3>
            <div className="flex gap-2">
              <button onClick={cerrarKardex}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                Cerrar
              </button>
              <a href={urlKardexPdf(kardex.estudiante.id)} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors no-underline inline-block">
                Descargar PDF
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500">Estudiante</div>
              <div className="text-lg font-semibold text-gray-900">{kardex.estudiante.nombre_completo}</div>
              <div className="text-xs text-gray-500 mt-1">ID: {kardex.estudiante.id}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500">Especialidad</div>
              <div className="text-lg font-semibold text-gray-900">{kardex.estudiante.especialidad_nombre}</div>
              <div className="text-xs text-gray-500 mt-1">{kardex.estudiante.facultad_nombre}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500">PPA</div>
              <div className="text-lg font-semibold text-gray-900">{kardex.progreso_actual?.promedio_ponderado_acumulado ?? "—"}</div>
              <div className="text-xs text-gray-500 mt-1">{kardex.progreso_actual?.creditos_aprobados_acumulados ?? 0} creditos aprobados · {kardex.progreso_actual?.estado_permanencia_nombre}</div>
            </div>
          </div>

          {kardex.plan_progreso && (
            <div className="mb-6">
              <div className="flex justify-between mb-1.5 text-sm">
                <span className="text-gray-600">Avance del plan de estudios</span>
                <span className="font-semibold text-gray-900">{kardex.plan_progreso.creditos_aprobados} / {kardex.plan_progreso.total_creditos_requeridos} creditos</span>
              </div>
              <div className="w-full h-5 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full flex items-center justify-center ${
                  kardex.plan_progreso.porcentaje >= 100 ? "bg-green-500" : "bg-primary"
                }`} style={{ width: `${Math.min(kardex.plan_progreso.porcentaje, 100)}%` }}>
                  <span className="text-xs font-bold text-white">{kardex.plan_progreso.porcentaje}%</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-semibold text-gray-900">Cursos cursados</h4>
            <div className="flex gap-2">
              {["todos", "aprobados", "desaprobados"].map((op) => (
                <button key={op} onClick={() => setFiltroCurso(op)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                    filtroCurso === op ? "bg-primary text-white border-primary" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}>
                  {op === "todos" ? "Todos" : op === "aprobados" ? "Aprobados" : "Desaprobados"}
                </button>
              ))}
            </div>
          </div>
          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Periodo</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Curso</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Cred.</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Nota final</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cursosFiltrados.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">No hay cursos que mostrar.</td></tr>
              ) : cursosFiltrados.map((c, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{c.periodo_academico_nombre}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">{c.curso_nombre}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{c.creditos}</td>
                  <td className="px-4 py-3 text-center font-semibold text-gray-900">{c.nota_final ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      c.estado_nombre === "Aprobado" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
                    }`}>{c.estado_nombre}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {kardex.historial.length > 0 && (
            <>
              <h4 className="text-base font-semibold text-gray-900 mb-4">Resumen por periodo</h4>
              <table className="w-full text-sm mb-6">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Periodo</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Promedio</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Cred. aprob.</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Orden merito</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Clasificacion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {kardex.historial.map((h, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">{h.periodo_academico_nombre}</td>
                      <td className="px-4 py-3 text-center font-semibold text-gray-900">{h.promedio_ponderado_periodo}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{h.creditos_aprobados_periodo}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{h.orden_merito}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">{h.tipo_clasificacion_nombre}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          <div className="text-xs text-gray-500 text-right">Total: {kardex.cursos.length} cursos · {aprobados} aprobados · {kardex.cursos.length - aprobados} desaprobados</div>
        </div>
      )}

      {!cargando && !kardex && (
        <>
          {resumen && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-primary">{resumen.total_estudiantes}</div>
                <div className="text-sm text-gray-500 mt-1">Total estudiantes</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-primary">{resumen.estudiantes_con_registro_de_progreso}</div>
                <div className="text-sm text-gray-500 mt-1">Con progreso</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-primary">{resumen.promedio_general_institucional ?? "—"}</div>
                <div className="text-sm text-gray-500 mt-1">Promedio institucional</div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Desempeno por cohorte</h3>
            </div>
            {cohortes.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No hay datos de cohorte disponibles.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Especialidad</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Total estudiantes</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Promedio ponderado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cohortes.map((item) => (
                    <tr key={item.especialidad_id ?? "sin-especialidad"} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900 font-medium">{item.especialidad_nombre || `Especialidad #${item.especialidad_id}`}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{item.total_estudiantes}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{item.promedio_ponderado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
