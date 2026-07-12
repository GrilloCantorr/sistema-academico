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
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Mi hoja de notas</h2>
        <p className="text-sm text-gray-500 mt-1">Consulta tus cursos, notas y progreso academico. Si dejas el semestre vacio, veras todo tu historial.</p>
      </div>

      {error && <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtrar</h3>
        <form onSubmit={cargarHoja}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label>Filtrar por semestre</label>
              <input type="number" placeholder="Opcional" value={semestreId} onChange={(e) => setSemestreId(e.target.value)} />
            </div>
            <div>
              <button type="submit" className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors cursor-pointer">Consultar</button>
            </div>
          </div>
        </form>
      </div>

      {cargando && <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8"><p className="text-sm text-gray-500">Cargando notas...</p></div>}

      {!cargando && !error && (
        <>
          {progresoActual && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Progreso actual</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-primary">{progresoActual.creditos_aprobados_acumulados}</div>
                  <div className="text-sm text-gray-500 mt-1">Creditos aprobados</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-primary">{progresoActual.promedio_ponderado_acumulado}</div>
                  <div className="text-sm text-gray-500 mt-1">Promedio ponderado</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-primary">{progresoActual.estado_permanencia_id}</div>
                  <div className="text-sm text-gray-500 mt-1">Estado permanencia</div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Historial de notas</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Periodo</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Semestre</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Curso</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Nota parcial</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Nota final</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {historial.length > 0 ? historial.map((item, index) => (
                  <tr key={`${item.periodo_academico_id}-${index}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{item.periodo_academico_nombre}</td>
                    <td className="px-4 py-3 text-gray-600">{item.semestre_codigo}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium">{item.curso_nombre || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{item.nota_parcial ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{item.nota_final ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        item.estado_nombre === "Aprobado" ? "bg-green-50 text-green-700 border-green-200"
                        : item.estado_nombre === "Desaprobado" ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-gray-50 text-gray-600 border-gray-200"
                      }`}>{item.estado_nombre}</span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">No hay registros de notas para mostrar.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!cargando && !error && historial.length === 0 && !progresoActual && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-500">No se encontro informacion academica para este usuario. Si eres estudiante, revisa que tu cuenta tenga historial semilla cargado.</p>
        </div>
      )}
    </div>
  );
}
