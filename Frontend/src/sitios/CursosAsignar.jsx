import { useEffect, useState } from "react";
import { asignarDocente, gestionarHorario, listarDocentes, listarTiposDocentes, listarAsignacionesSecciones } from "../servicios/cursosDocentes.servicio";

const DIAS = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];

export default function CursosAsignar() {
  const [secciones, setSecciones] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [tiposDocentes, setTiposDocentes] = useState([]);
  const [asigForm, setAsigForm] = useState({ seccionId: "", docenteId: "", horasAsignadas: "", tipoDocenteId: "" });
  const [horForm, setHorForm] = useState({ seccionId: "", dia: "Lunes", horaInicio: "", horaFin: "", aula: "" });
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
    if (!resSecciones.error) setSecciones(resSecciones.data || []);
    if (!resDocentes.error) setDocentes(resDocentes.data || []);
    if (!resTipos.error) setTiposDocentes(resTipos.data || []);
    if (resSecciones.error) setError(resSecciones.error);
    setCargando(false);
  }

  async function manejarAsignacion(e) {
    e.preventDefault();
    const { seccionId, docenteId, horasAsignadas, tipoDocenteId } = asigForm;
    if (!seccionId || !docenteId || !horasAsignadas) { setError("Completa todos los campos."); return; }
    setError(null);
    setMensaje(null);
    setEnviandoAsig(true);
    const res = await asignarDocente(Number(seccionId), {
      docente_id: Number(docenteId),
      horas_asignadas: Number(horasAsignadas),
      tipo_docente_id: tipoDocenteId ? Number(tipoDocenteId) : undefined,
    });
    setEnviandoAsig(false);
    if (res.error) { setError(res.error); return; }
    setMensaje("Docente asignado correctamente.");
    setAsigForm({ seccionId: "", docenteId: "", horasAsignadas: "", tipoDocenteId: "" });
    cargarDatos();
  }

  async function manejarHorario(e) {
    e.preventDefault();
    const { seccionId, dia, horaInicio, horaFin, aula } = horForm;
    if (!seccionId || !horaInicio || !horaFin || !aula) { setError("Completa todos los campos."); return; }
    setError(null);
    setMensaje(null);
    setEnviandoHor(true);
    const res = await gestionarHorario(Number(seccionId), {
      dia, hora_inicio: horaInicio, hora_fin: horaFin, aula,
    });
    setEnviandoHor(false);
    if (res.error) { setError(res.error); return; }
    setMensaje("Horario registrado correctamente.");
    setHorForm({ seccionId: "", dia: "Lunes", horaInicio: "", horaFin: "", aula: "" });
    cargarDatos();
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Asignar docentes y horarios</h2>
        <p className="text-sm text-gray-500 mt-1">Gestion de secciones de curso.</p>
      </div>

      {mensaje && <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{mensaje}</div>}
      {error && <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Asignar docente</h3>
          <form onSubmit={manejarAsignacion}>
            <div className="mb-3">
              <label>Seccion</label>
              <select value={asigForm.seccionId} onChange={(e) => setAsigForm({ ...asigForm, seccionId: e.target.value })}>
                <option value="">Seleccionar</option>
                {secciones.map((o) => (
                  <option key={o.id} value={o.id}>{o.curso_nombre || o.curso} (ID {o.id})</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label>Docente</label>
              <select value={asigForm.docenteId} onChange={(e) => setAsigForm({ ...asigForm, docenteId: e.target.value })}>
                <option value="">Seleccionar</option>
                {docentes.map((d) => (
                  <option key={d.id} value={d.id}>{d.nombres} {d.apellido_paterno}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label>Horas asignadas</label>
              <input type="number" value={asigForm.horasAsignadas} onChange={(e) => setAsigForm({ ...asigForm, horasAsignadas: e.target.value })} placeholder="Ej: 4" min="1" />
            </div>
            <div className="mb-4">
              <label>Tipo docente (opcional)</label>
              <select value={asigForm.tipoDocenteId} onChange={(e) => setAsigForm({ ...asigForm, tipoDocenteId: e.target.value })}>
                <option value="">Sin tipo</option>
                {tiposDocentes.map((t) => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={enviandoAsig} className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover disabled:bg-gray-300 disabled:text-gray-500 transition-colors cursor-pointer">
              {enviandoAsig ? "Asignando..." : "Asignar docente"}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Registrar horario</h3>
          <form onSubmit={manejarHorario}>
            <div className="mb-3">
              <label>Seccion</label>
              <select value={horForm.seccionId} onChange={(e) => setHorForm({ ...horForm, seccionId: e.target.value })}>
                <option value="">Seleccionar</option>
                {secciones.map((o) => (
                  <option key={o.id} value={o.id}>{o.curso_nombre || o.curso} (ID {o.id})</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label>Dia</label>
              <select value={horForm.dia} onChange={(e) => setHorForm({ ...horForm, dia: e.target.value })}>
                {DIAS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label>Hora inicio</label>
                <input type="time" value={horForm.horaInicio} onChange={(e) => setHorForm({ ...horForm, horaInicio: e.target.value })} />
              </div>
              <div>
                <label>Hora fin</label>
                <input type="time" value={horForm.horaFin} onChange={(e) => setHorForm({ ...horForm, horaFin: e.target.value })} />
              </div>
            </div>
            <div className="mb-4">
              <label>Aula</label>
              <input type="text" value={horForm.aula} onChange={(e) => setHorForm({ ...horForm, aula: e.target.value })} placeholder="Ej: A-101" />
            </div>
            <button type="submit" disabled={enviandoHor} className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover disabled:bg-gray-300 disabled:text-gray-500 transition-colors cursor-pointer">
              {enviandoHor ? "Registrando..." : "Registrar horario"}
            </button>
          </form>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Secciones de curso</h3>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">ID</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Curso</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Periodo</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Cupos</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Docentes</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Horarios</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cargando ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">Cargando...</td></tr>
            ) : secciones.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900 font-medium">{o.id}</td>
                <td className="px-4 py-3 text-gray-600">{o.curso_nombre || o.curso}</td>
                <td className="px-4 py-3 text-gray-600">{o.periodo_academico_id}</td>
                <td className="px-4 py-3 text-gray-600">{o.cupos}</td>
                <td className="px-4 py-3">
                  <div className="text-xs text-gray-500 space-y-0.5">
                    {o.docentes?.length > 0 ? o.docentes.map((d, i) => (
                      <span key={i} className="block">{d.docente_nombre} ({d.tipo || "sin tipo"})</span>
                    )) : <span className="text-gray-400">Sin docentes</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs text-gray-500 space-y-0.5">
                    {o.horarios?.length > 0 ? o.horarios.map((h, i) => (
                      <span key={i} className="block">{DIAS[h.dia - 1] || h.dia} {h.hora_inicio?.slice(0, 5)}-{h.hora_fin?.slice(0, 5)}</span>
                    )) : <span className="text-gray-400">Sin horarios</span>}
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
