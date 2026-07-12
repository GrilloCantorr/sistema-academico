import { useEffect, useState } from "react";
import { misCursosNotas, registrarNota, listarEstadosCurso } from "../servicios/notas.servicio";

export default function NotasRegistrar() {
  const [cursos, setCursos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [alumnos, setAlumnos] = useState([]);
  const [actaCerrada, setActaCerrada] = useState(false);
  const [notasForm, setNotasForm] = useState({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState({});
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      const [resCursos, resEstados] = await Promise.all([misCursosNotas(), listarEstadosCurso()]);
      setCargando(false);
      if (resCursos.error) { setError(resCursos.error); return; }
      setCursos(resCursos.data || []);
      if (!resEstados.error) setEstados(resEstados.data || []);
    })();
  }, []);

  function seleccionarCurso(ofertaId) {
    setMensaje(null);
    setError(null);
    const curso = cursos.find((c) => c.seccion_curso_id === Number(ofertaId));
    if (!curso) return;
    setCursoSeleccionado(ofertaId);
    setAlumnos(curso.alumnos || []);
    setActaCerrada(curso.acta_cerrada);
    const form = {};
    (curso.alumnos || []).forEach((a) => {
      form[a.matricula_id] = {
        nota_parcial: a.nota_parcial ?? "",
        nota_final: a.nota_final ?? "",
        estado_curso_id: a.estado_curso_id || (estados[0]?.id || ""),
      };
    });
    setNotasForm(form);
  }

  function actualizarNota(matriculaId, campo, valor) {
    setNotasForm((prev) => ({ ...prev, [matriculaId]: { ...prev[matriculaId], [campo]: valor } }));
  }

  async function guardarNota(matriculaId) {
    setGuardando((prev) => ({ ...prev, [matriculaId]: true }));
    setMensaje(null);
    setError(null);
    const f = notasForm[matriculaId];
    const { data, error } = await registrarNota({
      matricula_id: Number(matriculaId),
      seccion_curso_id: Number(cursoSeleccionado),
      nota_parcial: f.nota_parcial === "" ? null : Number(f.nota_parcial),
      nota_final: f.nota_final === "" ? null : Number(f.nota_final),
      estado_curso_id: Number(f.estado_curso_id),
    });
    setGuardando((prev) => ({ ...prev, [matriculaId]: false }));
    if (error) { setError(error); return; }
    setMensaje(`Nota guardada para matricula #${matriculaId}`);
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Registrar notas</h2>
        <p className="text-sm text-gray-500 mt-1">Selecciona un curso y registra las calificaciones de tus estudiantes.</p>
      </div>

      {mensaje && <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{mensaje}</div>}
      {error && <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mis cursos</h3>
        {cargando && <p className="text-sm text-gray-500">Cargando cursos asignados...</p>}
        {!cargando && cursos.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">No tienes cursos asignados en este periodo.</p>
        )}
        {!cargando && cursos.length > 0 && (
          <div>
            <label>Seleccionar curso</label>
            <select value={cursoSeleccionado} onChange={(e) => seleccionarCurso(e.target.value)}>
              <option value="">-- Seleccionar --</option>
              {cursos.map((c) => (
                <option key={c.seccion_curso_id} value={c.seccion_curso_id}>
                  {c.curso_nombre} ({c.alumnos?.length || 0} alumnos)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {actaCerrada && (
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm rounded-lg">
          El acta de este curso esta cerrada. No se pueden modificar notas.
        </div>
      )}

      {cursoSeleccionado && alumnos.length === 0 && !actaCerrada && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <p className="text-sm text-gray-500 text-center py-4">No hay estudiantes matriculados en este curso.</p>
        </div>
      )}

      {cursoSeleccionado && alumnos.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Estudiantes</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Estudiante</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Nota parcial</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Nota final</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Estado</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {alumnos.map((a) => {
                const f = notasForm[a.matricula_id] || {};
                return (
                  <tr key={a.matricula_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900 font-medium">{a.estudiante_nombre}</td>
                    <td className="px-4 py-3">
                      <input type="number" step="0.01" min="0" max="20" className="w-20"
                        value={f.nota_parcial ?? ""}
                        onChange={(e) => actualizarNota(a.matricula_id, "nota_parcial", e.target.value)}
                        disabled={actaCerrada} />
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" step="0.01" min="0" max="20" className="w-20"
                        value={f.nota_final ?? ""}
                        onChange={(e) => actualizarNota(a.matricula_id, "nota_final", e.target.value)}
                        disabled={actaCerrada} />
                    </td>
                    <td className="px-4 py-3">
                      <select className="text-xs"
                        value={f.estado_curso_id ?? ""}
                        onChange={(e) => actualizarNota(a.matricula_id, "estado_curso_id", e.target.value)}
                        disabled={actaCerrada}>
                        {estados.map((e) => (
                          <option key={e.id} value={e.id}>{e.nombre}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => guardarNota(a.matricula_id)}
                        disabled={actaCerrada || guardando[a.matricula_id]}
                        className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover disabled:bg-gray-300 disabled:text-gray-500 transition-colors cursor-pointer">
                        {guardando[a.matricula_id] ? "..." : "Guardar"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
