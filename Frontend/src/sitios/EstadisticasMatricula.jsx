import { useState, useEffect, useCallback } from "react";
import { obtenerEstadisticas } from "../servicios/matricula.servicio";

export default function EstadisticasMatricula() {
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    const res = await obtenerEstadisticas();
    if (!res.error) setEstadisticas(res.data);
    if (res.error) setError(res.error);
    setCargando(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Estadísticas e Indicadores de Admisiones</h2>
        <p className="text-base text-gray-500 mt-2">Seguimiento y control de los procesos de matrícula y registros estudiantiles.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        {cargando ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-32" />
            ))}
          </div>
        ) : !estadisticas ? (
          <p className="text-sm text-gray-500">{error || "No hay datos disponibles."}</p>
        ) : (
          <div>
            {/* Tarjetas estadísticas grandes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-slate-50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                <div className="text-4xl font-black text-primary">{estadisticas.total_solicitudes}</div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-3">Total Solicitudes</div>
              </div>
              <div className="text-center p-6 bg-slate-50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                <div className="text-4xl font-black text-green-600">{estadisticas.matriculados}</div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-3">Matriculados</div>
              </div>
              <div className="text-center p-6 bg-slate-50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                <div className="text-4xl font-black text-yellow-600">{estadisticas.pendientes}</div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-3">Pendientes</div>
              </div>
            </div>

            {/* Tabla consolidada con porcentajes */}
            <div className="mt-8 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-900">Consolidado del Estado de Matrículas</h3>
              </div>
              <table className="w-full text-base">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-6 py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wider">Estado Académico</th>
                    <th className="text-center px-6 py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wider">Alumnos</th>
                    <th className="text-center px-6 py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wider">Porcentaje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-gray-900 font-semibold">Confirmados / Matriculados</td>
                    <td className="px-6 py-4 text-center font-extrabold text-gray-700">{estadisticas.matriculados}</td>
                    <td className="px-6 py-4 text-center font-medium text-green-600">
                      {estadisticas.total_solicitudes ? ((estadisticas.matriculados / estadisticas.total_solicitudes) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-gray-900 font-semibold">Pendientes de Pago/Validación</td>
                    <td className="px-6 py-4 text-center font-extrabold text-gray-700">{estadisticas.pendientes}</td>
                    <td className="px-6 py-4 text-center font-medium text-yellow-600">
                      {estadisticas.total_solicitudes ? ((estadisticas.pendientes / estadisticas.total_solicitudes) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  {estadisticas.validados > 0 && (
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 text-gray-900 font-semibold">Validados sin Pago</td>
                      <td className="px-6 py-4 text-center font-extrabold text-gray-700">{estadisticas.validados}</td>
                      <td className="px-6 py-4 text-center font-medium text-blue-600">
                        {estadisticas.total_solicitudes ? ((estadisticas.validados / estadisticas.total_solicitudes) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={cargar} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm cursor-pointer">
                Actualizar Datos
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
