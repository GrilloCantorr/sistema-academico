import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { obtenerDashboard } from "../servicios/dashboard.servicio";

function StatCard({ valor, etiqueta }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm hover:shadow-md transition-shadow">
      <div className="text-4xl font-black text-primary leading-tight">
        {valor === null || valor === undefined ? "-" : valor}
      </div>
      <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-3">
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

  const rolLabel = usuario?.rol === "estudiante" ? "Estudiante"
    : usuario?.rol === "docente" ? "Docente"
    : usuario?.rol === "administrador" ? "Administrador del Sistema"
    : "Dirección Académica";

  return (
    <div>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Bienvenido, {usuario?.username}</h2>
          <p className="text-base text-gray-500 mt-1">Panel de {rolLabel}</p>
        </div>
        <div className="text-right">
          <button
            onClick={cargarDashboard}
            disabled={cargando}
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 transition-colors cursor-pointer shadow-sm"
          >
            {cargando ? "Actualizando..." : "Actualizar Datos"}
          </button>
          {ultimaActualizacion && (
            <p className="text-xs text-gray-400 mt-2">
              Última sincronización: {ultimaActualizacion.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {cargando && !datos && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <div className="animate-pulse bg-gray-100 rounded h-10 w-16 mx-auto mb-4" />
              <div className="animate-pulse bg-gray-100 rounded h-4 w-28 mx-auto" />
            </div>
          ))}
        </div>
      )}

      {!cargando && !datos && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <p className="text-sm text-gray-500">No se pudieron cargar los datos del panel en este momento.</p>
        </div>
      )}

      {/* Tarjetas de estadísticas */}
      {datos?.stats && datos.stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {datos.stats.map((stat, i) => (
            <StatCard key={i} valor={stat.valor} etiqueta={stat.etiqueta} />
          ))}
        </div>
      )}

      {/* Tabla Grande de Consolidado de Métricas (Solo para Dirección y Administrador) */}
      {!cargando && datos?.stats && datos.stats.length > 0 && (usuario?.rol === "direccion" || usuario?.rol === "administrador") && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm mb-8">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-900">Consolidado Institucional del Dashboard</h3>
          </div>
          <table className="w-full text-base">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wider">Concepto de Control</th>
                <th className="text-center px-6 py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wider">Total Acumulado</th>
                <th className="text-left px-6 py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wider">Detalle Operativo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {datos.stats.map((stat, i) => (
                <tr key={i} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 text-gray-900 font-semibold">{stat.etiqueta}</td>
                  <td className="px-6 py-4 text-center text-primary font-black text-xl">{stat.valor}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {stat.etiqueta === "Estudiantes" && "Total de alumnos matriculados y activos en el sistema general."}
                    {stat.etiqueta === "Docentes" && "Total de catedráticos con carga lectiva asignada."}
                    {stat.etiqueta === "Cursos" && "Asignaturas registradas vigentes en la currícula oficial."}
                    {stat.etiqueta === "Facultades" && "Facultades y dependencias académicas oficiales."}
                    {stat.etiqueta === "Especialidades" && "Escuelas profesionales activas y programas de pregrado."}
                    {stat.etiqueta === "Matrículas período actual" && `Registros oficiales en curso correspondientes al periodo ${datos.info?.periodo_actual || "actual"}.`}
                  </td>
                </tr>
              ))}
              {datos.info?.total_matriculas_historicas > 0 && (
                <tr className="hover:bg-gray-50/50 bg-slate-50/30">
                  <td className="px-6 py-4 text-gray-900 font-semibold">Total Matrículas Históricas</td>
                  <td className="px-6 py-4 text-center text-primary font-black text-xl">{datos.info.total_matriculas_historicas}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">Acumulado total de matrículas procesadas en la plataforma.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Información del Estudiante */}
      {datos?.info && usuario?.rol === "estudiante" && (
        <div className="mt-6">
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Información Académica del Estudiante</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-gray-200">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Especialidad Académica</span>
                <p className="text-base font-semibold text-gray-900">{datos.info.especialidad || "-"}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-gray-200">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Facultad</span>
                <p className="text-base font-semibold text-gray-900">{datos.info.facultad || "-"}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-gray-200">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Estado de Matrícula</span>
                <p className="text-base font-semibold text-gray-900">{datos.info.estado_matricula}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-gray-200">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Estado de Pago Administrativo</span>
                <p className={`text-base font-bold ${datos.info.pagado ? "text-green-600" : "text-red-600"}`}>
                  {datos.info.pagado ? "Cancelado" : "Pendiente de Pago"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cursos del Docente o Estudiante */}
      {datos?.cursos && datos.cursos.length > 0 && (
        <div className="mt-8">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">
                {usuario?.rol === "docente" ? "Mis Asignaturas Asignadas" : "Cursos Inscritos este Periodo"}
              </h3>
            </div>
            <table className="w-full text-base">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wider">
                    {usuario?.rol === "docente" ? "Código" : "Curso"}
                  </th>
                  <th className="text-left px-6 py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wider">
                    {usuario?.rol === "docente" ? "Asignatura / Curso" : "Horario Semanal"}
                  </th>
                  <th className="text-center px-6 py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wider">
                    {usuario?.rol === "docente" ? "Créditos" : "Aula Física"}
                  </th>
                  {usuario?.rol === "docente" && (
                    <th className="text-center px-6 py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wider">Alumnos</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {datos.cursos.map((curso, i) => (
                  <tr key={i} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-gray-900 font-semibold">
                      {usuario?.rol === "docente" ? curso.codigo : curso.nombre}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {usuario?.rol === "docente" ? curso.nombre : (curso.horario || "—")}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600 font-medium">
                      {usuario?.rol === "docente" ? `${curso.creditos} cr.` : (curso.aula || "—")}
                    </td>
                    {usuario?.rol === "docente" && (
                      <td className="px-6 py-4 text-center text-gray-900 font-bold bg-slate-50/30">
                        {curso.estudiantes} alumnos
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {datos?.cursos && datos.cursos.length === 0 && usuario?.rol === "docente" && !cargando && (
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-8 shadow-sm text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Carga Lectiva de Docente</h3>
          <p className="text-base text-gray-500">No se registran asignaturas asignadas para el periodo académico actual.</p>
        </div>
      )}
    </div>
  );
}
