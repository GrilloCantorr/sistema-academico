import { useEffect, useState } from "react";
import { cargarSilabo, misCursosAsignados, urlDescargarSilabo } from "../servicios/cursosDocentes.servicio";

export default function CursosMisCursos() {
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);

  useEffect(() => { cargarCursos(); }, []);

  async function cargarCursos() {
    setCargando(true);
    const res = await misCursosAsignados();
    const listaCursos = res.data || [];
    setCursos(listaCursos);
    if (res.error) setError(res.error);
    setCargando(false);

    if (listaCursos.length > 0) {
      setCursoSeleccionado((prev) => {
        if (prev) {
          const actual = listaCursos.find(x => x.seccion_curso_id === prev.seccion_curso_id);
          return actual || listaCursos[0];
        }
        return listaCursos[0];
      });
    }
  }

  async function manejarCargaSilabo(evento) {
    evento.preventDefault();
    if (!cursoSeleccionado || !archivo) { setError("Seleccione un archivo PDF."); return; }
    setMensaje(null);
    setError(null);
    setSubiendo(true);
    const res = await cargarSilabo(Number(cursoSeleccionado.seccion_curso_id), archivo);
    setSubiendo(false);
    if (res.error) { setError(res.error); return; }
    setMensaje("Sílabo cargado y actualizado correctamente.");
    setArchivo(null);
    const fileInput = document.getElementById("silabo-file-input");
    if (fileInput) fileInput.value = "";
    await cargarCursos();
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Mis Asignaturas y Sílabos</h2>
        <p className="text-base text-gray-500 mt-1">Gestión académica de asignaturas asignadas, carga lectiva y carga de sílabos institucionales.</p>
      </div>

      {mensaje && <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{mensaje}</div>}
      {error && <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Columna Izquierda: Cursos Asignados */}
        <div className="w-full lg:w-5/12 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-900">Carga Académica Semestral</h3>
          </div>

          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {cargando ? (
              <p className="text-sm text-gray-500 p-8 text-center">Cargando cursos asignados...</p>
            ) : cursos.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-12">No registra asignaturas en este periodo.</p>
            ) : (
              cursos.map((c, i) => (
                <div 
                  key={i} 
                  onClick={() => setCursoSeleccionado(c)}
                  className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                    cursoSeleccionado?.seccion_curso_id === c.seccion_curso_id 
                      ? "bg-primary-light/40 border-l-4 border-primary font-medium" 
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div>
                    <h4 className="text-base font-bold text-gray-900">{c.nombre_curso || c.curso_nombre}</h4>
                    <p className="text-xs text-gray-500">Horas: {c.horas_semanales || "—"} hrs · Créditos: {c.creditos || "—"} cr.</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      c.estado_silabo === "Silabo Cargado" 
                        ? "bg-green-50 text-green-700 border-green-200" 
                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                    }`}>
                      {c.estado_silabo === "Silabo Cargado" ? "Con Sílabo" : "Pendiente"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Columna Derecha: Control de la Asignatura */}
        <div className="w-full lg:w-7/12">
          {cursoSeleccionado ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
              <div className="mb-6 border-b border-gray-100 pb-6">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Detalle del Curso</span>
                <h3 className="text-2xl font-black text-gray-900">{cursoSeleccionado.nombre_curso || cursoSeleccionado.curso_nombre}</h3>
                <p className="text-sm font-medium text-gray-500 mt-1">Código Oficial: {cursoSeleccionado.codigo_curso || cursoSeleccionado.codigo || "—"} · Sección ID: {cursoSeleccionado.seccion_curso_id}</p>
              </div>

              {/* Ficha Técnica */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-gray-200">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Créditos Oficiales</span>
                  <p className="text-lg font-bold text-gray-900 mt-0.5">{cursoSeleccionado.creditos || "—"} cr.</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-gray-200">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Carga Horaria Semanal</span>
                  <p className="text-lg font-bold text-gray-900 mt-0.5">{cursoSeleccionado.horas_semanales || "—"} hrs</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 sm:col-span-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Horario y Aulas de Clase</span>
                  {cursoSeleccionado.horario?.length > 0 ? (
                    <div className="space-y-1 mt-1 font-semibold text-gray-800 text-sm">
                      {cursoSeleccionado.horario.map((h, j) => (
                        <span key={j} className="block bg-white px-3 py-1.5 rounded border border-gray-200">{h.dia} — {h.hora_inicio} a {h.hora_fin} {h.aula ? `(${h.aula})` : ""}</span>
                      ))}
                    </div>
                  ) : <p className="text-sm text-gray-500 mt-1 font-semibold">Sin horario asignado.</p>}
                </div>
              </div>

              {/* Sección de Sílabo */}
              <div className="border-t border-gray-100 pt-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Sílabo de la Asignatura</h4>
                {cursoSeleccionado.estado_silabo === "Silabo Cargado" ? (
                  <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center justify-between">
                    <div>
                      <p className="text-green-800 font-bold text-sm">Sílabo Activo en Plataforma</p>
                      <p className="text-xs text-green-600 mt-0.5">Los estudiantes ya pueden descargarlo.</p>
                    </div>
                    <a
                      href={urlDescargarSilabo(cursoSeleccionado.seccion_curso_id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer inline-block no-underline"
                    >
                      Descargar PDF
                    </a>
                  </div>
                ) : (
                  <div className="mb-6 p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                    <p className="text-yellow-800 font-bold text-sm">Syllabus Pendiente de Carga</p>
                    <p className="text-xs text-yellow-600 mt-0.5">Por favor suba el documento oficial en formato PDF para los alumnos.</p>
                  </div>
                )}

                {/* Formulario de Carga */}
                <form onSubmit={manejarCargaSilabo} className="bg-slate-50 p-6 rounded-xl border border-gray-200">
                  <label className="block mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Subir o Actualizar Documento (PDF, max 10MB)</label>
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <input 
                      id="silabo-file-input" 
                      type="file" 
                      accept=".pdf" 
                      onChange={(e) => setArchivo(e.target.files[0] || null)} 
                      className="w-full bg-white text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-150 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                    />
                    <button 
                      type="submit" 
                      disabled={!archivo || subiendo}
                      className="w-full sm:w-auto px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover disabled:bg-gray-300 disabled:text-gray-500 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
                    >
                      {subiendo ? "Subiendo..." : "Subir Sílabo"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-350 p-12 text-center">
              <p className="text-gray-500 font-medium">Seleccione una asignatura del listado para ver sus detalles y cargar el sílabo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
