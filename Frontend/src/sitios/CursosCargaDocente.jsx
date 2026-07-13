import { useEffect, useState, useCallback } from "react";
import { cargaDocente, evaluarCumplimientoPlan } from "../servicios/cursosDocentes.servicio";
import { listarFacultades } from "../servicios/administracion.servicio";
import { listarPeriodos } from "../servicios/matricula.servicio";

export default function CursosCargaDocente() {
  const [items, setItems] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [filtroFacultad, setFiltroFacultad] = useState("");
  const [filtroPeriodo, setFiltroPeriodo] = useState("");
  const [cumplimiento, setCumplimiento] = useState([]);
  const [periodoCumplimiento, setPeriodoCumplimiento] = useState("");
  const [cargando, setCargando] = useState(true);
  const [expandido, setExpandido] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    const params = new URLSearchParams();
    if (filtroFacultad) params.set("especialidad_id", filtroFacultad);
    if (filtroPeriodo) params.set("periodo_academico_id", filtroPeriodo);
    const [res, resFac, resPer] = await Promise.all([
      cargaDocente("?" + params.toString()),
      listarFacultades(),
      listarPeriodos(),
    ]);
    if (!res.error) { setItems(res.data?.items || res.data || []); }
    if (res.error) setError(res.error);
    if (!resFac.error) setFacultades(resFac.data || []);
    if (!resPer.error) setPeriodos(resPer.data || []);
    setCargando(false);
  }, [filtroFacultad, filtroPeriodo]);

  useEffect(() => { cargar(); }, [cargar]);

  async function manejarCumplimiento(e) {
    e.preventDefault();
    if (!periodoCumplimiento) { setError("Selecciona un periodo."); return; }
    setError(null);
    const res = await evaluarCumplimientoPlan(Number(periodoCumplimiento));
    if (res.error) { setError(res.error); return; }
    setCumplimiento(res.data || []);
    setMensaje("Reporte de cumplimiento cargado.");
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Cumplimiento Docente</h2>
        <p className="text-base text-gray-500 mt-2">Monitoreo y evaluación de la carga horaria semanal y cumplimiento del plan de estudios.</p>
      </div>

      {mensaje && <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{mensaje}</div>}
      {error && <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block mb-2 text-xs font-bold text-gray-500 uppercase tracking-widest">Facultad / Especialidad</label>
            <select value={filtroFacultad} onChange={(e) => setFiltroFacultad(e.target.value)}>
              <option value="">Todas</option>
              {facultades.map((f) => (
                <option key={f.id} value={f.id}>{f.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 text-xs font-bold text-gray-500 uppercase tracking-widest">Periodo Académico</label>
            <select value={filtroPeriodo} onChange={(e) => setFiltroPeriodo(e.target.value)}>
              <option value="">Todos</option>
              {periodos.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Cumplimiento de Plan de Estudios</h3>
        <form onSubmit={manejarCumplimiento} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <label className="block mb-2 text-xs font-bold text-gray-500 uppercase tracking-widest">Seleccionar Periodo</label>
            <select value={periodoCumplimiento} onChange={(e) => setPeriodoCumplimiento(e.target.value)}>
              <option value="">Seleccionar</option>
              {periodos.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm cursor-pointer">
            Generar Reporte
          </button>
        </form>

        {cumplimiento.length > 0 && (
          <div className="mt-8 overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-base">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Curso</th>
                  <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Plan</th>
                  <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Semestre</th>
                  <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Tiene Oferta</th>
                  <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Docentes</th>
                  <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Cupos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cumplimiento.map((c, i) => (
                  <tr key={i} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-gray-900 font-semibold">{c.curso_nombre}</td>
                    <td className="px-6 py-4 text-gray-600">{c.plan_estudios_id}</td>
                    <td className="px-6 py-4 text-gray-600">{c.semestre_id}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        c.tiene_oferta_este_periodo 
                          ? "bg-green-50 text-green-700 border-green-200" 
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}>
                        {c.tiene_oferta_este_periodo ? "Sí" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{c.docentes_asignados}</td>
                    <td className="px-6 py-4 text-gray-600 font-bold">{c.cupos ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-4">Carga Horaria Semanal por Docente</h3>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-base">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Docente</th>
              <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Horas Semanales</th>
              <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Categoría de Carga</th>
              <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Cursos Asignados</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cargando ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">Cargando datos horaria...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">No hay registros de carga.</td></tr>
            ) : items.map((doc, i) => (
              <tr key={i} className="hover:bg-gray-50/50">
                <td className="px-6 py-4">
                  <span className="text-gray-900 font-bold block">{doc.nombres} {doc.apellido_paterno}</span>
                  <span className="text-xs text-gray-400 block mt-0.5">{doc.especialidad || ""}</span>
                </td>
                <td className="px-6 py-4 text-gray-900 font-extrabold text-lg">{doc.total_horas_semanales || doc.horas_semanales} hrs</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                    doc.categoria === "Carga Regular" ? "bg-green-50 text-green-700 border-green-200"
                    : doc.categoria === "Sobrecarga Laboral" ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-yellow-50 text-yellow-700 border-yellow-200"
                  }`}>
                    {doc.categoria}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs text-gray-500 space-y-1 font-medium">
                    {(doc.detalle_cursos || doc.cursos || []).map((cu, j) => (
                      <span key={j} className="block bg-gray-50 px-2.5 py-1 rounded border border-gray-200/60 inline-block mr-1.5 mb-1.5">{cu.curso_nombre} ({cu.horas_asignadas} hrs)</span>
                    ))}
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
