import { useEffect, useState } from "react";
import { 
  asignarDocente, 
  gestionarHorario, 
  listarDocentes, 
  listarTiposDocentes, 
  listarAsignacionesSecciones 
} from "../servicios/cursosDocentes.servicio";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function CursosAsignar() {
  const [secciones, setSecciones] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [tiposDocentes, setTiposDocentes] = useState([]);
  const [seccionSeleccionada, setSeccionSeleccionada] = useState(null);
  
  const [asigForm, setAsigForm] = useState({ docenteId: "", horasAsignadas: "", tipoDocenteId: "" });
  const [horForm, setHorForm] = useState({ dia: "Lunes", horaInicio: "", horaFin: "", aula: "" });
  const [activeTab, setActiveTab] = useState("docente"); // "docente" o "horario"
  
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [enviandoAsig, setEnviandoAsig] = useState(false);
  const [enviandoHor, setEnviandoHor] = useState(false);

  useEffect(() => { cargarDatos(); }, []);

  async function cargarDatos() {
    setCargando(true);
    const [resSecciones, resDocentes, resTipos] = await Promise.all([
      listarAsignacionesSecciones(),
      listarDocentes(),
      listarTiposDocentes(),
    ]);
    const listaSecciones = resSecciones.data || [];
    setSecciones(listaSecciones);
    if (!resDocentes.error) setDocentes(resDocentes.data || []);
    if (!resTipos.error) setTiposDocentes(resTipos.data || []);
    if (resSecciones.error) setError(resSecciones.error);
    setCargando(false);

    if (listaSecciones.length > 0) {
      setSeccionSeleccionada((prev) => {
        if (prev) {
          const actual = listaSecciones.find(x => x.id === prev.id);
          return actual || listaSecciones[0];
        }
        return listaSecciones[0];
      });
    }
  }

  async function manejarAsignacion(e) {
    e.preventDefault();
    if (!seccionSeleccionada) return;
    const { docenteId, horasAsignadas, tipoDocenteId } = asigForm;
    if (!docenteId || !horasAsignadas) { setError("Complete todos los campos obligatorios."); return; }
    setError(null);
    setMensaje(null);
    setEnviandoAsig(true);
    const res = await asignarDocente(Number(seccionSeleccionada.id), {
      docente_id: Number(docenteId),
      horas_asignadas: Number(horasAsignadas),
      tipo_docente_id: tipoDocenteId ? Number(tipoDocenteId) : undefined,
    });
    setEnviandoAsig(false);
    if (res.error) { setError(res.error); return; }
    setMensaje("Carga de docente asignada correctamente.");
    setAsigForm({ docenteId: "", horasAsignadas: "", tipoDocenteId: "" });
    await cargarDatos();
  }

  async function manejarHorario(e) {
    e.preventDefault();
    if (!seccionSeleccionada) return;
    const { dia, horaInicio, horaFin, aula } = horForm;
    if (!horaInicio || !horaFin || !aula) { setError("Complete todos los campos obligatorios."); return; }
    setError(null);
    setMensaje(null);
    setEnviandoHor(true);
    const res = await gestionarHorario(Number(seccionSeleccionada.id), {
      dia, hora_inicio: horaInicio, hora_fin: horaFin, aula,
    });
    setEnviandoHor(false);
    if (res.error) { setError(res.error); return; }
    setMensaje("Horario de sección registrado correctamente.");
    setHorForm({ dia: "Lunes", horaInicio: "", horaFin: "", aula: "" });
    await cargarDatos();
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Carga y Programación Horaria</h2>
        <p className="text-base text-gray-500 mt-1">Asignación de docentes, distribución de horas académicas y reserva de aulas por sección.</p>
      </div>

      {mensaje && <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{mensaje}</div>}
      {error && <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Columna Izquierda: Listado de Secciones */}
        <div className="w-full lg:w-7/12 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-900">Secciones y Asignaturas</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">Curso / Sección</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">Periodo</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">Docente(s)</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">Horario / Aula</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cargando ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">Cargando secciones...</td></tr>
                ) : secciones.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">No hay secciones registradas.</td></tr>
                ) : secciones.map((o) => (
                  <tr 
                    key={o.id} 
                    onClick={() => setSeccionSeleccionada(o)}
                    className={`cursor-pointer transition-colors ${
                      seccionSeleccionada?.id === o.id 
                        ? "bg-primary-light/40 border-l-4 border-primary font-medium" 
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-4">
                      <span className="text-gray-900 font-bold block">{o.curso_nombre || o.curso}</span>
                      <span className="text-xs text-gray-400 block mt-0.5">Sección ID: {o.id} · Vacantes: {o.cupos}</span>
                    </td>
                    <td className="px-4 py-4 text-gray-600 font-medium">{o.periodo_academico_id}</td>
                    <td className="px-4 py-4">
                      <div className="text-xs text-gray-500 space-y-0.5 font-medium">
                        {o.docentes?.length > 0 ? o.docentes.map((d, idx) => (
                          <span key={idx} className="block text-gray-900 font-semibold">{d.docente_nombre} <span className="text-xs text-gray-400">({d.tipo || "Regular"})</span></span>
                        )) : <span className="text-red-500 font-semibold">Sin docente</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs text-gray-500 space-y-0.5 font-medium">
                        {o.horarios?.length > 0 ? o.horarios.map((h, idx) => (
                          <span key={idx} className="block text-gray-900">{h.dia} {h.hora_inicio?.slice(0, 5)}-{h.hora_fin?.slice(0, 5)} <span className="text-gray-400">({h.aula})</span></span>
                        )) : <span className="text-yellow-600 font-semibold">Sin horario</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Columna Derecha: Panel de Asignación y Horarios */}
        <div className="w-full lg:w-5/12">
          {seccionSeleccionada ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
              <div className="mb-6 border-b border-gray-100 pb-6">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Sección Seleccionada</span>
                <h3 className="text-2xl font-black text-gray-900">{seccionSeleccionada.curso_nombre || seccionSeleccionada.curso}</h3>
                <p className="text-sm font-medium text-gray-500 mt-1">ID Sección: {seccionSeleccionada.id} · Vacantes: {seccionSeleccionada.cupos}</p>
              </div>

              {/* Tabs de Formulario */}
              <div className="flex border-b border-gray-200 mb-6">
                <button 
                  onClick={() => setActiveTab("docente")}
                  className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 cursor-pointer transition-colors ${
                    activeTab === "docente" 
                      ? "border-primary text-primary" 
                      : "border-transparent text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Asignar Docente
                </button>
                <button 
                  onClick={() => setActiveTab("horario")}
                  className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 cursor-pointer transition-colors ${
                    activeTab === "horario" 
                      ? "border-primary text-primary" 
                      : "border-transparent text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Registrar Horario
                </button>
              </div>

              {activeTab === "docente" ? (
                <form onSubmit={manejarAsignacion}>
                  <div className="mb-4">
                    <label className="block mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Seleccionar Docente *</label>
                    <select 
                      value={asigForm.docenteId} 
                      onChange={(e) => setAsigForm({ ...asigForm, docenteId: e.target.value })}
                      className="bg-white border-gray-300 w-full"
                    >
                      <option value="">Seleccionar...</option>
                      {docentes.map((d) => (
                        <option key={d.id} value={d.id}>{d.nombres} {d.apellido_paterno}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Horas Asignadas Semanales *</label>
                    <input 
                      type="number" 
                      value={asigForm.horasAsignadas} 
                      onChange={(e) => setAsigForm({ ...asigForm, horasAsignadas: e.target.value })} 
                      placeholder="Ej: 4" 
                      min="1" 
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo Docente (opcional)</label>
                    <select 
                      value={asigForm.tipoDocenteId} 
                      onChange={(e) => setAsigForm({ ...asigForm, tipoDocenteId: e.target.value })}
                      className="bg-white border-gray-300 w-full"
                    >
                      <option value="">Sin tipo específico</option>
                      {tiposDocentes.map((t) => (
                        <option key={t.id} value={t.id}>{t.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <button 
                    type="submit" 
                    disabled={enviandoAsig} 
                    className="w-full px-5 py-3 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover disabled:bg-gray-300 disabled:text-gray-500 transition-colors shadow-sm cursor-pointer"
                  >
                    {enviandoAsig ? "Asignando carga..." : "Asignar Catedrático"}
                  </button>
                </form>
              ) : (
                <form onSubmit={manejarHorario}>
                  <div className="mb-4">
                    <label className="block mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Día de Clases *</label>
                    <select 
                      value={horForm.dia} 
                      onChange={(e) => setHorForm({ ...horForm, dia: e.target.value })}
                      className="bg-white border-gray-300 w-full font-medium"
                    >
                      {DIAS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Hora Inicio *</label>
                      <input 
                        type="time" 
                        value={horForm.horaInicio} 
                        onChange={(e) => setHorForm({ ...horForm, horaInicio: e.target.value })} 
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Hora Fin *</label>
                      <input 
                        type="time" 
                        value={horForm.horaFin} 
                        onChange={(e) => setHorForm({ ...horForm, horaFin: e.target.value })} 
                      />
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Aula Física *</label>
                    <input 
                      type="text" 
                      value={horForm.aula} 
                      onChange={(e) => setHorForm({ ...horForm, aula: e.target.value })} 
                      placeholder="Ej: A-102, Lab-A" 
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={enviandoHor} 
                    className="w-full px-5 py-3 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover disabled:bg-gray-300 disabled:text-gray-500 transition-colors shadow-sm cursor-pointer"
                  >
                    {enviandoHor ? "Registrando horario..." : "Registrar Horario"}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-350 p-12 text-center">
              <p className="text-gray-500 font-medium">Seleccione una sección del listado para asignar catedráticos u horarios.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
