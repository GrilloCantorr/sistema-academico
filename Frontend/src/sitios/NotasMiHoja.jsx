import { useEffect, useState } from "react";
import { miHojaDeNotas } from "../servicios/notas.servicio";

export default function NotasMiHoja() {
  const [semestreId, setSemestreId] = useState("");
  const [historial, setHistorial] = useState([]);
  const [progresoActual, setProgresoActual] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => { cargarHoja(); }, []);

  async function cargarHoja(evento) {
    if (evento) evento.preventDefault();
    setError(null);
    setCargando(true);
    const { data, error } = await miHojaDeNotas(semestreId || null);
    setCargando(false);
    if (error) { setError(error); return; }
    const historialNormalizado = Array.isArray(data)
      ? data : Array.isArray(data?.historial) ? data.historial : [];
    setHistorial(historialNormalizado);
    setProgresoActual(Array.isArray(data) ? null : data?.progreso_actual ?? null);
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Mi Planilla de Calificaciones</h2>
          <p className="text-base text-gray-500 mt-1">Consulta detallada de notas parciales, exámenes finales y situación académica del estudiante.</p>
        </div>
        <button
          onClick={() => window.print()}
          type="button"
          className="px-5 py-2.5 bg-white text-gray-750 border border-gray-350 rounded-lg text-sm font-bold hover:bg-gray-50 flex items-center gap-2 cursor-pointer shadow-sm no-print"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          Imprimir Planilla
        </button>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl">⚠ {error}</div>}

      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Filtrar por Semestre Académico</h3>
        <form onSubmit={cargarHoja}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block mb-2 text-xs font-bold text-gray-500 uppercase tracking-widest">Código del Semestre (Opcional)</label>
              <input type="number" placeholder="Ej: 1 (deje vacío para ver todo el historial)" value={semestreId} onChange={(e) => setSemestreId(e.target.value)} />
            </div>
            <div>
              <button type="submit" className="w-full px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm cursor-pointer">Consultar Planilla</button>
            </div>
          </div>
        </form>
      </div>

      {cargando && <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm text-center mb-8"><p className="text-sm text-gray-500">Cargando calificaciones...</p></div>}

      {!cargando && !error && (
        <>
          {progresoActual && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Resumen del Rendimiento Acumulado</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-50 rounded-xl p-6 text-center border border-gray-200 shadow-sm">
                  <div className="text-4xl font-black text-primary">{progresoActual.creditos_aprobados_acumulados} cr.</div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-3">Créditos Aprobados</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-6 text-center border border-gray-200 shadow-sm">
                  <div className="text-4xl font-black text-primary">{progresoActual.promedio_ponderado_acumulado}</div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-3">Promedio Ponderado Acumulado</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-6 text-center border border-gray-200 shadow-sm">
                  <div className="text-4xl font-black text-primary">{progresoActual.estado_permanencia_id}</div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-3">Estado de Permanencia</div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Historial de Calificaciones por Semestre</h3>
            </div>
            <table className="w-full text-base">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Periodo</th>
                  <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Semestre</th>
                  <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Curso / Asignatura</th>
                  <th className="text-center px-4 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider w-32">Parcial</th>
                  <th className="text-center px-4 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider w-32">Final</th>
                  <th className="text-center px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider w-36">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {historial.length > 0 ? historial.map((item, index) => (
                  <tr key={`${item.periodo_academico_id}-${index}`} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-gray-600 font-medium">{item.periodo_academico_nombre}</td>
                    <td className="px-6 py-4 text-gray-600">{item.semestre_codigo}</td>
                    <td className="px-6 py-4 text-gray-900 font-bold">{item.curso_nombre || "—"}</td>
                    <td className="px-4 py-4 text-center font-bold text-gray-700 text-lg">{item.nota_parcial ?? "—"}</td>
                    <td className="px-4 py-4 text-center font-bold text-gray-700 text-lg">{item.nota_final ?? "—"}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                        item.estado_nombre === "Aprobado" ? "bg-green-50 text-green-700 border-green-200"
                        : item.estado_nombre === "Desaprobado" ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-gray-50 text-gray-600 border-gray-200"
                      }`}>{item.estado_nombre}</span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">No hay registros de notas para mostrar.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!cargando && !error && historial.length === 0 && !progresoActual && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm text-center">
          <p className="text-base text-gray-500">No se encontró historial académico registrado para su código de estudiante.</p>
        </div>
      )}
    </div>
  );
}
