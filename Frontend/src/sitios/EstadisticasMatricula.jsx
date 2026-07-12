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
        <h2 className="text-2xl font-bold text-gray-900">Estadisticas de matricula</h2>
        <p className="text-sm text-gray-500 mt-1">Resumen de solicitudes por estado.</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {cargando ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-24" />
            ))}
          </div>
        ) : !estadisticas ? (
          <p className="text-sm text-gray-500">{error || "No hay datos disponibles."}</p>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-3xl font-bold text-gray-900">{estadisticas.total_solicitudes}</div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">Total solicitudes</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-3xl font-bold text-gray-900">{estadisticas.matriculados}</div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">Matriculados</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-3xl font-bold text-gray-900">{estadisticas.pendientes}</div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">Pendientes</div>
              </div>
            </div>
            {estadisticas.validados > 0 && (
              <div className="mt-4 text-center">
                <span className="text-sm text-gray-500">Validados: </span>
                <span className="text-lg font-bold text-gray-900">{estadisticas.validados}</span>
              </div>
            )}
            <div className="mt-4 text-right">
              <button onClick={cargar} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                Actualizar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
