import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  indicadoresAcademicos, listarNotas, obtenerNotasMatricula, validarActas, cerrarActa,
} from "../servicios/notas.servicio";

export default function NotasGestion() {
  const { usuario } = useAuth();
  const [notas, setNotas] = useState([]);
  const [matriculaId, setMatriculaId] = useState("");
  const [consulta, setConsulta] = useState([]);
  const [actas, setActas] = useState(null);
  const [indicadores, setIndicadores] = useState(null);
  const [cerrando, setCerrando] = useState({});
  const [cargandoActas, setCargandoActas] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { cargarNotas(); }, []);

  async function cargarNotas() {
    const { data, error } = await listarNotas();
    if (!error) setNotas(data);
  }

  async function manejarConsulta(e) {
    e.preventDefault();
    setMensaje(null);
    setError(null);
    const { data, error } = await obtenerNotasMatricula(matriculaId);
    if (error) { setError(error); return; }
    setConsulta(data);
  }

  async function manejarValidarActas() {
    setMensaje(null);
    setError(null);
    setCargandoActas(true);
    const { data, error } = await validarActas();
    setCargandoActas(false);
    if (error) { setError(error); return; }
    setActas(data);
  }

  async function manejarCerrarActa(seccionId) {
    setCerrando((prev) => ({ ...prev, [seccionId]: true }));
    setMensaje(null);
    setError(null);
    const { data, error } = await cerrarActa(seccionId);
    setCerrando((prev) => ({ ...prev, [seccionId]: false }));
    if (error) { setError(error); return; }
    setMensaje(data.mensaje);
    manejarValidarActas();
  }

  async function manejarIndicadores() {
    setMensaje(null);
    setError(null);
    const { data, error } = await indicadoresAcademicos();
    if (error) { setError(error); return; }
    setIndicadores(data);
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Supervisión de Calificaciones</h2>
        <p className="text-base text-gray-500 mt-2">Monitoreo general de actas académicas, indicadores consolidados de rendimiento y consulta de matrículas.</p>
      </div>

      {mensaje && <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{mensaje}</div>}
      {error && <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Acciones de Control</h3>
          <div className="flex gap-3 flex-wrap">
            {usuario?.rol === "administrador" && (
              <button type="button" onClick={manejarValidarActas} disabled={cargandoActas}
                className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover disabled:bg-gray-300 disabled:text-gray-500 transition-colors cursor-pointer shadow-sm">
                {cargandoActas ? "Cargando..." : "Validar Actas Oficiales"}
              </button>
            )}
            {(usuario?.rol === "administrador" || usuario?.rol === "direccion") && (
              <button type="button" onClick={manejarIndicadores}
                className="px-5 py-2.5 bg-white text-gray-700 text-sm font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer shadow-sm">
                Ver Indicadores de Rendimiento
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Consultar Notas por Matrícula</h3>
          <form onSubmit={manejarConsulta}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="block mb-2 text-xs font-bold text-gray-500 uppercase tracking-widest">ID de Matrícula</label>
                <input type="number" value={matriculaId} onChange={(e) => setMatriculaId(e.target.value)} placeholder="Ej. 1" required />
              </div>
              <div>
                <button type="submit" className="w-full px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors cursor-pointer shadow-sm">Consultar</button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {indicadores && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Indicadores Académicos Generales</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-50 rounded-xl p-6 text-center border border-gray-200">
              <div className="text-4xl font-black text-primary">{indicadores.promedio_general ?? "—"}</div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-3">Promedio General</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-6 text-center border border-gray-200">
              <div className="text-4xl font-black text-green-600">{indicadores.aprobados}</div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-3">Aprobados</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-6 text-center border border-gray-200">
              <div className="text-4xl font-black text-red-600">{indicadores.reprobados}</div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-3">Reprobados</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-6 text-center border border-gray-200">
              <div className="text-4xl font-black text-gray-700">{indicadores.total_evaluados}</div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-3">Total Evaluados</div>
            </div>
          </div>
        </div>
      )}

      {actas && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
            <h3 className="text-lg font-semibold text-gray-900">Validacion de actas ({actas.items?.length || 0} ofertas)</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Curso</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Estudiantes</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Con nota</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Pendientes</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Acta</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {actas.items?.map((o) => (
                <tr key={o.seccion_curso_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="text-gray-900 font-medium">{o.curso_nombre}</span>
                    <span className="text-xs text-gray-400 block">Seccion #{o.seccion_curso_id}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">{o.total_estudiantes}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{o.con_nota}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{o.pendientes}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      o.acta_cerrada ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"
                    }`}>{o.acta_cerrada ? "Cerrada" : "Abierta"}</span>
                  </td>
                  <td className="px-4 py-3">
                    {usuario?.rol === "administrador" && (
                      <button onClick={() => manejarCerrarActa(o.seccion_curso_id)}
                        disabled={cerrando[o.seccion_curso_id]}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                          o.acta_cerrada
                            ? "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                            : "bg-primary text-white hover:bg-primary-hover"
                        } disabled:bg-gray-300 disabled:text-gray-500`}>
                        {cerrando[o.oferta_academica_id] ? "..." : o.acta_cerrada ? "Reabrir" : "Cerrar acta"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {(!actas.items || actas.items.length === 0) && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">No hay secciones de curso registradas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Consolidado general</h3>
        </div>
        <div className="px-4 py-2 text-sm text-gray-500">Si todavia no se registran notas, esta tabla se mostrara vacia hasta que el docente ingrese calificaciones.</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Matricula</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Seccion</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Parcial</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Final</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
              {notas.map((nota) => (
                <tr key={`${nota.matricula_id}-${nota.seccion_curso_id}`} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{nota.matricula_id}</td>
                  <td className="px-4 py-3 text-gray-600">{nota.seccion_curso_id}</td>
                <td className="px-4 py-3 text-gray-600">{nota.nota_parcial ?? "-"}</td>
                <td className="px-4 py-3 text-gray-600">{nota.nota_final ?? "-"}</td>
                <td className="px-4 py-3 text-gray-600">{nota.estado_nombre || nota.estado_curso_id}</td>
              </tr>
            ))}
            {notas.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">No hay notas registradas.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {consulta.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Consulta por matricula #{matriculaId}</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Curso</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Parcial</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Final</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {consulta.map((nota, i) => (
                <tr key={`${nota.seccion_curso_id}-${i}`} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 font-medium">{nota.curso_nombre || `Seccion #${nota.seccion_curso_id}`}</td>
                  <td className="px-4 py-3 text-gray-600">{nota.nota_parcial ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{nota.nota_final ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{nota.estado_nombre || nota.estado_curso_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
