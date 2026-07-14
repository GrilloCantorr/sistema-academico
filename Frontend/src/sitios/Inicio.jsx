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
    <div className="flex flex-col min-h-[calc(100vh-8rem)] pb-4">
      {/* Nuevo Hero Banner de Bienvenida Centrado */}
      <div className="relative rounded-3xl overflow-hidden mb-10 bg-gradient-to-r from-primary via-[#4a0d1f] to-primary shadow-xl">
        {/* Decoración de fondo premium */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <svg className="absolute -top-24 -right-24 w-96 h-96 text-white" fill="currentColor" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50"/></svg>
          <svg className="absolute -bottom-24 -left-24 w-72 h-72 text-white" fill="currentColor" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50"/></svg>
          <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white rounded-full blur-3xl opacity-30 transform -translate-y-1/2"></div>
        </div>
        
        <div className="relative px-8 py-20 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-md border border-white/20 shadow-inner">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4 drop-shadow-md">
            Hola, {usuario?.username}
          </h2>
          <p className="text-lg md:text-xl text-white/90 font-medium tracking-wide uppercase">
            Panel de {rolLabel}
          </p>
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

      {/* Tarjetas removidas según solicitud */}

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
      <div className="mt-auto pt-12 pb-4 flex flex-col items-center">
        <button
          onClick={cargarDashboard}
          disabled={cargando}
          className="px-8 py-3.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary-hover disabled:opacity-50 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
        >
          <svg className={`w-5 h-5 ${cargando ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          {cargando ? "Actualizando panel..." : "Actualizar Datos del Sistema"}
        </button>
        {ultimaActualizacion && (
          <p className="text-xs font-bold text-gray-400 mt-4 flex items-center gap-1.5 uppercase tracking-widest">
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Sincronizado: {ultimaActualizacion.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}
