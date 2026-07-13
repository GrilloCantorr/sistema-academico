import { useEffect, useState } from "react";
import { misCursosNotas, registrarNota, listarEstadosCurso } from "../servicios/notas.servicio";

export default function NotasRegistrar() {
  const [cursos, setCursos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [actaCerrada, setActaCerrada] = useState(false);
  const [notasForm, setNotasForm] = useState({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState({});
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setCargando(true);
      const [resCursos, resEstados] = await Promise.all([misCursosNotas(), listarEstadosCurso()]);
      const listaCursos = resCursos.data || [];
      setCursos(listaCursos);
      if (!resEstados.error) setEstados(resEstados.data || []);
      if (resCursos.error) setError(resCursos.error);
      setCargando(false);

      if (listaCursos.length > 0) {
        seleccionarCursoPorObjeto(listaCursos[0], resEstados.data || []);
      }
    })();
  }, []);

  function seleccionarCursoPorObjeto(curso, listaEstados = estados) {
    setMensaje(null);
    setError(null);
    setCursoSeleccionado(curso);
    setAlumnos(curso.alumnos || []);
    setActaCerrada(curso.acta_cerrada);
    
    const form = {};
    (curso.alumnos || []).forEach((a) => {
      form[a.matricula_id] = {
        nota_parcial: a.nota_parcial ?? "",
        nota_final: a.nota_final ?? "",
        estado_curso_id: a.estado_curso_id || (listaEstados[0]?.id || ""),
      };
    });
    setNotasForm(form);
  }

  function actualizarNota(matriculaId, campo, valor) {
    setNotasForm((prev) => ({ ...prev, [matriculaId]: { ...prev[matriculaId], [campo]: valor } }));
  }

  async function guardarNota(matriculaId) {
    if (!cursoSeleccionado) return;
    setGuardando((prev) => ({ ...prev, [matriculaId]: true }));
    setMensaje(null);
    setError(null);
    const f = notasForm[matriculaId];
    const { error } = await registrarNota({
      matricula_id: Number(matriculaId),
      seccion_curso_id: Number(cursoSeleccionado.seccion_curso_id),
      nota_parcial: f.nota_parcial === "" ? null : Number(f.nota_parcial),
      nota_final: f.nota_final === "" ? null : Number(f.nota_final),
      estado_curso_id: Number(f.estado_curso_id),
    });
    setGuardando((prev) => ({ ...prev, [matriculaId]: false }));
    if (error) { setError(error); return; }
    setMensaje("Calificación guardada y consolidada con éxito.");
    
    // Recargar datos locales del curso
    const res = await misCursosNotas();
    if (!res.error) {
      const listaCursos = res.data || [];
      setCursos(listaCursos);
      const cursoActualizado = listaCursos.find(x => x.seccion_curso_id === cursoSeleccionado.seccion_curso_id);
      if (cursoActualizado) {
        setAlumnos(cursoActualizado.alumnos || []);
      }
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Registro de Calificaciones</h2>
        <p className="text-base text-gray-500 mt-1">Ingreso de calificaciones parciales y finales correspondientes a las asignaturas en curso.</p>
      </div>

      {mensaje && <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{mensaje}</div>}
      {error && <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Columna Izquierda: Cursos a Cargo */}
        <div className="w-full lg:w-5/12 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-900">Mis Asignaturas</h3>
          </div>

          <div className="divide-y divide-gray-200">
            {cargando ? (
              <p className="text-sm text-gray-500 p-8 text-center">Cargando asignaturas...</p>
            ) : cursos.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-12">No registra cursos asignados para evaluar.</p>
            ) : (
              cursos.map((c, i) => (
                <div 
                  key={i} 
                  onClick={() => seleccionarCursoPorObjeto(c)}
                  className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                    cursoSeleccionado?.seccion_curso_id === c.seccion_curso_id 
                      ? "bg-primary-light/40 border-l-4 border-primary font-medium" 
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div>
                    <h4 className="text-base font-bold text-gray-900">{c.curso_nombre}</h4>
                    <p className="text-xs text-gray-500">Matriculados: {c.alumnos?.length || 0} alumnos</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      c.acta_cerrada 
                        ? "bg-red-50 text-red-700 border-red-200" 
                        : "bg-green-50 text-green-700 border-green-200"
                    }`}>
                      {c.acta_cerrada ? "Cerrada" : "Abierta"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Columna Derecha: Hoja de Evaluación */}
        <div className="w-full lg:w-7/12">
          {cursoSeleccionado ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-100 bg-white">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Planilla del Curso</span>
                <h3 className="text-2xl font-black text-gray-900">{cursoSeleccionado.curso_nombre}</h3>
                <p className="text-sm font-medium text-gray-500 mt-1">Alumnos Inscritos: {alumnos.length} · Estado Acta: {actaCerrada ? "Bloqueada (Cerrada)" : "Habilitada (Abierta)"}</p>
              </div>

              {actaCerrada && (
                <div className="mx-8 mt-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm font-medium rounded-xl">
                  ⚠ El acta de calificaciones para este curso ha sido CERRADA por el Administrador. No se admiten modificaciones académicas.
                </div>
              )}

              {alumnos.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No hay estudiantes matriculados en esta sección.
                </div>
              ) : (
                <div className="p-6">
                  <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                    <table className="w-full text-base">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Estudiante</th>
                          <th className="text-center px-4 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider w-28">Nota Parcial</th>
                          <th className="text-center px-4 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider w-28">Nota Final</th>
                          <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Resultado</th>
                          <th className="px-6 py-4"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {alumnos.map((a) => {
                          const f = notasForm[a.matricula_id] || {};
                          return (
                            <tr key={a.matricula_id} className="hover:bg-gray-50/50">
                              <td className="px-6 py-4 font-semibold text-gray-900">{a.estudiante_nombre}</td>
                              <td className="px-4 py-4 text-center">
                                <input 
                                  type="number" 
                                  step="0.1" 
                                  min="0" 
                                  max="20" 
                                  className="w-20 text-center font-bold"
                                  value={f.nota_parcial ?? ""}
                                  onChange={(e) => actualizarNota(a.matricula_id, "nota_parcial", e.target.value)}
                                  disabled={actaCerrada} 
                                />
                              </td>
                              <td className="px-4 py-4 text-center">
                                <input 
                                  type="number" 
                                  step="0.1" 
                                  min="0" 
                                  max="20" 
                                  className="w-20 text-center font-bold"
                                  value={f.nota_final ?? ""}
                                  onChange={(e) => actualizarNota(a.matricula_id, "nota_final", e.target.value)}
                                  disabled={actaCerrada} 
                                />
                              </td>
                              <td className="px-6 py-4">
                                <select 
                                  className="text-sm bg-white border-gray-300 w-full"
                                  value={f.estado_curso_id ?? ""}
                                  onChange={(e) => actualizarNota(a.matricula_id, "estado_curso_id", e.target.value)}
                                  disabled={actaCerrada}
                                >
                                  {estados.map((est) => (
                                    <option key={est.id} value={est.id}>{est.nombre}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button 
                                  onClick={() => guardarNota(a.matricula_id)}
                                  disabled={actaCerrada || guardando[a.matricula_id]}
                                  className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-hover disabled:bg-gray-300 disabled:text-gray-500 transition-colors shadow-sm cursor-pointer"
                                >
                                  {guardando[a.matricula_id] ? "..." : "Guardar"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-350 p-12 text-center">
              <p className="text-gray-500 font-medium">Seleccione un curso del listado de la izquierda para registrar calificaciones.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
