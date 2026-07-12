import { useEffect, useState } from "react";
import { miHistorial } from "../servicios/recordAcademico.servicio";

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
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Mi historial academico</h2>
        <p className="text-sm text-gray-500 mt-1">Revisa tu historial completo, cursos aprobados y desaprobados, y el avance de tu plan de estudios.</p>
      </div>

      {error && <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

      {datos && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-primary rounded-lg p-6 text-white">
              <div className="text-4xl font-bold">{datos.progreso_actual?.promedio_ponderado_acumulado ?? "—"}</div>
              <div className="text-sm text-white/80 mt-1">Promedio Ponderado Acumulado (PPA)</div>
            </div>
            <div className={`rounded-lg p-6 text-white ${
              datos.progreso_actual?.estado_permanencia_nombre === "Regular" ? "bg-green-600"
              : datos.progreso_actual?.estado_permanencia_nombre === "Bueno" ? "bg-primary"
              : "bg-gray-500"
            }`}>
              <div className="text-2xl font-bold">{datos.progreso_actual?.estado_permanencia_nombre ?? "—"}</div>
              <div className="text-sm text-white/80 mt-1">Estado de permanencia</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-4xl font-bold text-gray-900">{datos.cursos?.length ?? 0}</div>
              <div className="text-sm text-gray-500 mt-1">Total cursos cursados</div>
              <div className="text-sm mt-1">
                <span className="text-green-700">{aprobados} aprobados</span>
                <span className="text-gray-400 mx-1">·</span>
                <span className="text-red-600">{desaprobados} desaprobados</span>
              </div>
            </div>
          </div>

          {datos.plan_progreso && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Avance del plan de estudios</h3>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex justify-between mb-1.5 text-sm">
                    <span className="text-gray-600">Creditos aprobados</span>
                    <span className="font-semibold text-gray-900">{datos.plan_progreso.creditos_aprobados} / {datos.plan_progreso.total_creditos_requeridos}</span>
                  </div>
                  <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full flex items-center justify-center transition-all duration-500 ${
                      datos.plan_progreso.porcentaje >= 100 ? "bg-green-500" : "bg-primary"
                    }`} style={{ width: `${Math.min(datos.plan_progreso.porcentaje, 100)}%` }}>
                      <span className="text-xs font-bold text-white px-2">{datos.plan_progreso.porcentaje}%</span>
                    </div>
                  </div>
                </div>
              </div>
              {datos.plan_progreso.porcentaje >= 100 && (
                <p className="text-green-700 font-semibold mt-2">Completaste todos los creditos requeridos!</p>
              )}
            </div>
          )}

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Cursos cursados</h3>
              <div className="flex gap-2">
                {["todos", "aprobados", "desaprobados"].map((op) => (
                  <button key={op} onClick={() => setFiltro(op)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                      filtro === op ? "bg-primary text-white border-primary" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}>
                    {op === "todos" ? "Todos" : op === "aprobados" ? "Aprobados" : "Desaprobados"}
                  </button>
                ))}
              </div>
            </div>
            {cursosFiltrados.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No hay cursos que mostrar.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Periodo</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Curso</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Nota final</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cursosFiltrados.map((c, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">{c.periodo_academico_nombre}</td>
                      <td className="px-4 py-3 text-gray-900 font-medium">{c.curso_nombre}</td>
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
            )}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Resumen por periodo</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Periodo</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Semestre</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Promedio</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Creditos</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Orden</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Clasificacion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {datos.historial.map((item, index) => (
                  <tr key={`${item.periodo_academico_id}-${index}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{item.periodo_academico_nombre || item.periodo_academico_id}</td>
                    <td className="px-4 py-3 text-gray-600">{item.semestre_codigo || item.semestre_id}</td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-900">{item.promedio_ponderado_periodo}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{item.creditos_aprobados_periodo}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{item.orden_merito}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">{item.tipo_clasificacion_nombre || item.tipo_clasificacion_id}</span>
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
