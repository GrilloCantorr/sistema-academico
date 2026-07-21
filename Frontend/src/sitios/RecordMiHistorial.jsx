import { useEffect, useState } from "react";
import { miHistorial } from "../servicios/recordAcademico.servicio";
import { urlDescargarFicha } from "../servicios/matricula.servicio";

export default function RecordMiHistorial() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState("todos");

  useEffect(() => { cargarHistorial(); }, []);

  async function cargarHistorial() {
    const { data, error } = await miHistorial();
    if (error) { setError(error); return; }
    setDatos(data);
  }

  const cursosFiltrados = !datos?.cursos ? [] : filtro === "todos"
    ? datos.cursos : datos.cursos.filter((c) => filtro === "aprobados" ? c.estado_nombre === "Aprobado" : c.estado_nombre !== "Aprobado");

  const aprobados = datos?.cursos?.filter((c) => c.estado_nombre === "Aprobado").length ?? 0;
  const desaprobados = (datos?.cursos?.length ?? 0) - aprobados;

  return (
    <div>
      <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Mi Historial Curricular</h2>
          <p className="text-base text-gray-500 mt-1">Avance curricular general, promedio ponderado acumulado y consolidado de méritos por ciclo.</p>
        </div>
        <div className="flex items-center gap-3 no-print flex-wrap">
          {datos?.matricula_id && (
            <a
              href={urlDescargarFicha(datos.matricula_id)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm no-underline transition-colors"
            >
              📥 Descargar Ficha de Matrícula (PDF)
            </a>
          )}
          <button
            onClick={() => window.print()}
            type="button"
            className="px-5 py-2.5 bg-white text-gray-750 border border-gray-350 rounded-lg text-sm font-bold hover:bg-gray-50 flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            Imprimir Historial
          </button>
        </div>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl">⚠ {error}</div>}

      {datos && (
        <>
          {/* Fichas de rendimiento grandes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-primary rounded-xl p-8 text-white shadow-sm flex flex-col justify-between min-h-[140px]">
              <div className="text-sm text-white/80 font-bold uppercase tracking-wider">Promedio Ponderado Acumulado</div>
              <div className="text-5xl font-black mt-2">{datos.progreso_actual?.promedio_ponderado_acumulado ?? "—"}</div>
            </div>
            <div className={`rounded-xl p-8 text-white shadow-sm flex flex-col justify-between min-h-[140px] ${
              datos.progreso_actual?.estado_permanencia_nombre === "Regular" ? "bg-green-600"
              : datos.progreso_actual?.estado_permanencia_nombre === "Bueno" ? "bg-primary-dark"
              : "bg-slate-500"
            }`}>
              <div className="text-sm text-white/80 font-bold uppercase tracking-wider">Estado de Permanencia</div>
              <div className="text-4xl font-black mt-2">{datos.progreso_actual?.estado_permanencia_nombre ?? "—"}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-8 border border-gray-200 shadow-sm flex flex-col justify-between min-h-[140px]">
              <div className="text-sm text-gray-500 font-bold uppercase tracking-wider">Cursos Llevados</div>
              <div className="mt-2">
                <div className="text-5xl font-black text-gray-900">{datos.cursos?.length ?? 0}</div>
                <div className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-wider">
                  <span className="text-green-700">{aprobados} Aprobados</span>
                  <span className="mx-2">·</span>
                  <span className="text-red-600">{desaprobados} Desaprobados</span>
                </div>
              </div>
            </div>
          </div>

          {/* Avance del plan de estudios */}
          {datos.plan_progreso && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Avance del Plan de Estudios</h3>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex justify-between mb-2 text-sm font-semibold">
                    <span className="text-gray-600">Créditos de carrera aprobados</span>
                    <span className="text-gray-900">{datos.plan_progreso.creditos_aprobados} de {datos.plan_progreso.total_creditos_requeridos} cr.</span>
                  </div>
                  <div className="w-full h-6 bg-gray-150 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full flex items-center justify-center transition-all duration-500 font-extrabold text-white text-xs ${
                      datos.plan_progreso.porcentaje >= 100 ? "bg-green-600" : "bg-primary"
                    }`} style={{ width: `${Math.min(datos.plan_progreso.porcentaje, 100)}%` }}>
                      {datos.plan_progreso.porcentaje}%
                    </div>
                  </div>
                </div>
              </div>
              {datos.plan_progreso.porcentaje >= 100 && (
                <p className="text-green-700 font-bold text-base mt-3">🎉 ¡Felicidades! Completó satisfactoriamente el plan de estudios curricular.</p>
              )}
            </div>
          )}

          {/* Listado de cursos cursados */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between flex-wrap gap-4">
              <h3 className="text-lg font-bold text-gray-900">Historial Detallado de Asignaturas</h3>
              <div className="flex gap-2">
                {["todos", "aprobados", "desaprobados"].map((op) => (
                  <button key={op} onClick={() => setFiltro(op)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                      filtro === op ? "bg-primary text-white border-primary" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}>
                    {op === "todos" ? "Todos" : op === "aprobados" ? "Aprobados" : "Desaprobados"}
                  </button>
                ))}
              </div>
            </div>
            {cursosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-gray-50/50">
                <div className="w-16 h-16 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Sin registros académicos</h3>
                <p className="text-sm text-gray-500 max-w-sm">No se encontraron asignaturas que coincidan con este filtro. Explora otras opciones o contacta a dirección.</p>
              </div>
            ) : (
              <table className="w-full text-base">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-6 py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wider">Periodo Académico</th>
                    <th className="text-left px-6 py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wider">Asignatura / Curso</th>
                    <th className="text-center px-4 py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wider w-32">Nota Promedio</th>
                    <th className="text-center px-6 py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wider w-36">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {cursosFiltrados.map((c, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-600 font-medium">{c.periodo_academico_nombre}</td>
                      <td className="px-6 py-4 text-gray-900 font-bold">{c.curso_nombre}</td>
                      <td className="px-4 py-4 text-center font-extrabold text-gray-900 text-lg">{c.nota_final ?? "—"}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                          c.estado_nombre === "Aprobado" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
                        }`}>{c.estado_nombre}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Resumen por periodo */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Resumen y Evolución Meritocrática por Periodo</h3>
            </div>
            <table className="w-full text-base">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wider">Periodo</th>
                  <th className="text-left px-6 py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wider">Semestre</th>
                  <th className="text-center px-4 py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wider w-36">PPA Ciclo</th>
                  <th className="text-center px-4 py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wider w-36">Créd. Aprobados</th>
                  <th className="text-center px-4 py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wider w-36">Orden Mérito</th>
                  <th className="text-left px-6 py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wider">Clasificación Académica</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {datos.historial.map((item, index) => (
                  <tr key={`${item.periodo_academico_id}-${index}`} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-gray-600 font-medium">{item.periodo_academico_nombre || item.periodo_academico_id}</td>
                    <td className="px-6 py-4 text-gray-600">{item.semestre_codigo || item.semestre_id}</td>
                    <td className="px-4 py-4 text-center font-extrabold text-gray-900 text-lg">{item.promedio_ponderado_periodo}</td>
                    <td className="px-4 py-4 text-center font-bold text-gray-700">{item.creditos_aprobados_periodo} cr.</td>
                    <td className="px-4 py-4 text-center text-gray-600 font-bold">{item.orden_merito}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">{item.tipo_clasificacion_nombre || item.tipo_clasificacion_id}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
