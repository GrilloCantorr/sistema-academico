import { useEffect, useState } from "react";
import { cargarSilabo, misCursosAsignados, urlDescargarSilabo } from "../servicios/cursosDocentes.servicio";

export default function CursosMisCursos() {
  const [cursos, setCursos] = useState([]);
  const [seccionSeleccionada, setSeccionSeleccionada] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { cargarCursos(); }, []);

  async function cargarCursos() {
    const res = await misCursosAsignados();
    if (!res.error) setCursos(res.data || []);
    if (res.error) setError(res.error);
  }

  async function manejarCargaSilabo(evento) {
    evento.preventDefault();
    if (!seccionSeleccionada || !archivo) { setError("Selecciona un curso y un archivo PDF."); return; }
    setMensaje(null);
    setError(null);
    const res = await cargarSilabo(Number(seccionSeleccionada), archivo);
    if (res.error) { setError(res.error); return; }
    setMensaje("Silabo cargado correctamente.");
    setArchivo(null);
    document.getElementById("silabo-file-input") && (document.getElementById("silabo-file-input").value = "");
    cargarCursos();
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Subir silabo</h2>
        <p className="text-sm text-gray-500 mt-1">Carga el silabo de tus cursos asignados (formato PDF, max 10 MB).</p>
      </div>

      {mensaje && <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{mensaje}</div>}
      {error && <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <form onSubmit={manejarCargaSilabo} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label>Curso</label>
            <select value={seccionSeleccionada} onChange={(e) => setSeccionSeleccionada(e.target.value)}>
              <option value="">Seleccionar curso</option>
              {cursos.map((c) => (
                <option key={c.seccion_curso_id} value={c.seccion_curso_id}>
                  {c.nombre_curso || c.curso_nombre} {c.estado_silabo ? "(" + c.estado_silabo + ")" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Archivo PDF</label>
            <input id="silabo-file-input" type="file" accept=".pdf" onChange={(e) => setArchivo(e.target.files[0] || null)} className="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100" />
          </div>
          <button type="submit" disabled={!seccionSeleccionada || !archivo} className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors cursor-pointer">
            Subir silabo
          </button>
        </form>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Cursos asignados</h3>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Curso</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Codigo</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Creditos</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Horas</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Silabo</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Horario</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cursos.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">No tienes cursos asignados.</td></tr>
            ) : cursos.map((c, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900 font-medium">{c.nombre_curso || c.curso_nombre}</td>
                <td className="px-4 py-3 text-gray-600">{c.codigo_curso || c.codigo || "-"}</td>
                <td className="px-4 py-3 text-gray-600">{c.creditos || "-"}</td>
                <td className="px-4 py-3 text-gray-600">{c.horas_semanales || "-"}</td>
                <td className="px-4 py-3">
                  {c.estado_silabo === "Silabo Cargado" ? (
                    <a
                      href={urlDescargarSilabo(c.seccion_curso_id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-hover text-sm font-medium"
                    >
                      Descargar
                    </a>
                  ) : (
                    <span className="text-yellow-600 text-xs font-medium bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-200">
                      {c.estado_silabo || "Pendiente"}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {c.horario?.length > 0 ? (
                    <div className="text-xs text-gray-500 space-y-0.5">
                      {c.horario.map((h, j) => (
                        <span key={j} className="block">{h.dia} {h.hora_inicio}-{h.hora_fin} {h.aula ? "(" + h.aula + ")" : ""}</span>
                      ))}
                    </div>
                  ) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
