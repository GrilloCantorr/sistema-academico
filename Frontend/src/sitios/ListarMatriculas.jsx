import { useState, useEffect } from "react";
import { listarMatriculas, listarEstadosMatricula, validarRequisitos, registrarPago, generarFichaOficial } from "../servicios/matricula.servicio";

export default function ListarMatriculas() {
  const [matriculas, setMatriculas] = useState([]);
  const [estados, setEstados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { cargarDatos(); }, []);

  async function cargarDatos() {
    setCargando(true);
    const [res, resEst] = await Promise.all([listarMatriculas(), listarEstadosMatricula()]);
    if (!res.error) setMatriculas(res.data?.matriculas || res.data || []);
    if (!resEst.error) setEstados(resEst.data || []);
    if (res.error) setError(res.error);
    setCargando(false);
  }

  function nombreEstado(id) {
    return estados.find((e) => e.id === id || e.estado_id === id)?.nombre || `Estado ${id}`;
  }

  async function manejarValidar(id) {
    const { error } = await validarRequisitos(id);
    if (error) { setError(error); return; }
    setMensaje("Matricula validada correctamente.");
    cargarDatos();
  }

  async function manejarPago(id) {
    const { error } = await registrarPago(id);
    if (error) { setError(error); return; }
    setMensaje("Pago registrado correctamente.");
    cargarDatos();
  }

  async function manejarFicha(id) {
    const { error } = await generarFichaOficial(id);
    if (error) { setError(error); return; }
    setMensaje("Ficha oficial generada correctamente.");
    cargarDatos();
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Listar matriculas</h2>
        <p className="text-sm text-gray-500 mt-1">Gestion de solicitudes de matricula.</p>
      </div>

      {mensaje && <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{mensaje}</div>}
      {error && <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">ID</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Estudiante</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Periodo</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Semestre</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Estado</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Pagado</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cargando ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">Cargando...</td></tr>
            ) : matriculas.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">No hay matriculas registradas.</td></tr>
            ) : matriculas.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900 font-medium">{m.id}</td>
                <td className="px-4 py-3 text-gray-600">{m.estudiante_nombre || m.estudiante || "-"}</td>
                <td className="px-4 py-3 text-gray-600">{m.periodo_nombre || m.periodo?.nombre || "-"}</td>
                <td className="px-4 py-3 text-gray-600">{m.semestre_codigo || m.semestre?.codigo || "-"}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    {nombreEstado(m.estado_id || m.estado?.id)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-medium ${m.pagado ? "text-green-600" : "text-red-600"}`}>
                    {m.pagado ? "Si" : "No"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 flex-wrap">
                    {(m.estado_id === 1 || m.estado?.id === 1) && (
                      <button onClick={() => manejarValidar(m.id)} className="px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors cursor-pointer">
                        Validar
                      </button>
                    )}
                    {(m.estado_id === 2 || m.estado?.id === 2) && !m.pagado && (
                      <button onClick={() => manejarPago(m.id)} className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
                        Pago
                      </button>
                    )}
                    {m.pagado && m.estado_id !== 3 && m.estado?.id !== 3 && (
                      <button onClick={() => manejarFicha(m.id)} className="px-3 py-1.5 text-xs font-medium text-primary bg-primary-light border border-primary/20 rounded-lg hover:bg-primary hover:text-white transition-colors cursor-pointer">
                        Ficha oficial
                      </button>
                    )}
                    {(m.estado_id === 3 || m.estado?.id === 3) && (
                      <span className="px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg">
                        Completada
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
