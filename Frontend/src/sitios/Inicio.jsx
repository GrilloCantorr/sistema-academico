import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { obtenerDashboard } from "../servicios/dashboard.servicio";

function StatCard({ valor, etiqueta }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
      <div className="text-3xl font-bold text-gray-900 leading-tight">
        {valor === null || valor === undefined ? "-" : valor}
      </div>
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">
        {etiqueta}
      </div>
    </div>
  );
}

export default function Inicio() {
  const { usuario } = useAuth();
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);

  const cargarDashboard = useCallback(async () => {
    setCargando(true);
    const res = await obtenerDashboard();
    if (res.data) setDatos(res.data);
    setCargando(false);
    setUltimaActualizacion(new Date());
  }, []);

  useEffect(() => { cargarDashboard(); }, [cargarDashboard]);

  const rolLabel = usuario?.rol === "estudiante" ? "estudiante"
    : usuario?.rol === "docente" ? "docente"
    : usuario?.rol === "administrador" ? "administracion"
    : "direccion academica";

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bienvenido, {usuario?.username}</h2>
          <p className="text-sm text-gray-500 mt-1">Panel de {rolLabel}</p>
        </div>
        <div className="text-right">
          <button
            onClick={cargarDashboard}
            disabled={cargando}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {cargando ? "Cargando..." : "Actualizar"}
          </button>
          {ultimaActualizacion && (
            <p className="text-xs text-gray-400 mt-1">
              Ultima actualizacion: {ultimaActualizacion.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {cargando && !datos && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="animate-pulse bg-gray-200 rounded h-8 w-16 mx-auto mb-2" />
              <div className="animate-pulse bg-gray-200 rounded h-4 w-24 mx-auto" />
            </div>
          ))}
        </div>
      )}

      {!cargando && !datos && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-500">No se pudieron cargar los datos del dashboard.</p>
        </div>
      )}

      {datos?.stats && datos.stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {datos.stats.map((stat, i) => (
            <StatCard key={i} valor={stat.valor} etiqueta={stat.etiqueta} />
          ))}
        </div>
      )}

      {datos?.info && usuario?.rol === "estudiante" && (
        <div className="mt-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informacion academica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Especialidad</span>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{datos.info.especialidad || "-"}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Facultad</span>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{datos.info.facultad || "-"}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado de matricula</span>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{datos.info.estado_matricula}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pago</span>
                <p className={`text-sm font-medium mt-0.5 ${datos.info.pagado ? "text-green-600" : "text-red-600"}`}>
                  {datos.info.pagado ? "Pagado" : "Pendiente"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {datos?.cursos && datos.cursos.length > 0 && (
        <div className="mt-6">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Curso</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Horario</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Aula</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {datos.cursos.map((curso, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900 font-medium">{curso.nombre}</td>
                    <td className="px-4 py-3 text-gray-600">{curso.horario || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{curso.aula || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {datos?.cursos && datos.cursos.length === 0 && usuario?.rol === "docente" && !cargando && (
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Mis cursos este periodo</h3>
          <p className="text-sm text-gray-500">No tienes cursos asignados en el periodo actual.</p>
        </div>
      )}
    </div>
  );
}
