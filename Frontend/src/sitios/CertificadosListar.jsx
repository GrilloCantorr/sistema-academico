import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  autorizarCertificado, emitirCertificado, listarSolicitudes, urlDescargarCertificado, verificarCertificado,
} from "../servicios/certificados.servicio";

const ESTADOS = ["todos", "Pendiente", "Autorizado", "Emitido"];

export default function CertificadosListar() {
  const { usuario } = useAuth();
  const [certificados, setCertificados] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [codigo, setCodigo] = useState("");
  const [verificacion, setVerificacion] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [generando, setGenerando] = useState(null);

  useEffect(() => { cargarSolicitudes(); }, []);

  async function cargarSolicitudes() {
    setCargando(true);
    const { data, error } = await listarSolicitudes();
    setCargando(false);
    if (error) { setError(error); return; }
    setCertificados(data?.solicitudes || []);
  }

  async function manejarAutorizar(id) {
    setMensaje(null);
    setError(null);
    const { data, error } = await autorizarCertificado(id);
    if (error) { setError(error); return; }
    setMensaje(data.mensaje);
    cargarSolicitudes();
  }

  async function manejarGenerar(id) {
    setMensaje(null);
    setError(null);
    setGenerando(id);
    const { data, error } = await emitirCertificado(id);
    setGenerando(null);
    if (error) { setError(error); return; }
    setMensaje(data.mensaje);
    cargarSolicitudes();
    descargarPDF(id);
  }

  async function descargarPDF(id) {
    const token = localStorage.getItem("token");
    try {
      const resp = await fetch(urlDescargarCertificado(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) { setError("No se pudo descargar el certificado"); return; }
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `certificado_${id}.pdf`;
      enlace.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Error al descargar el certificado");
    }
  }

  async function manejarVerificacion(e) {
    e.preventDefault();
    setMensaje(null);
    setError(null);
    const { data, error } = await verificarCertificado(codigo);
    if (error) { setVerificacion(null); setError(error); return; }
    setVerificacion(data);
  }

  const filtrados = filtro === "todos" ? certificados : certificados.filter((c) => c.estado === filtro);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Certificados y documentos</h2>
        <p className="text-sm text-gray-500 mt-1">Revisa las solicitudes, autoriza, genera los PDF oficiales y verifica documentos.</p>
      </div>

      {mensaje && <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{mensaje}</div>}
      {error && <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Verificar certificado</h3>
        <form onSubmit={manejarVerificacion}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <label>Codigo de verificacion</label>
              <input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Pega el codigo de verificacion" />
            </div>
            <div>
              <button type="submit" className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors cursor-pointer">Buscar certificado</button>
            </div>
          </div>
        </form>
        {verificacion && (
          <div className={`mt-4 p-4 rounded-lg text-sm ${verificacion.valido ? "bg-green-50" : "bg-red-50"}`}>
            <p><strong>Valido:</strong> {verificacion.valido ? "Si" : "No"}</p>
            <p><strong>Tipo:</strong> {verificacion.tipo}</p>
            <p><strong>Estudiante ID:</strong> {verificacion.estudiante_id}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Solicitudes</h3>
          <div className="flex gap-2">
            {ESTADOS.map((op) => (
              <button key={op} onClick={() => setFiltro(op)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                  filtro === op ? "bg-primary text-white border-primary" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}>
                {op === "todos" ? "Todos" : op}
              </button>
            ))}
          </div>
        </div>

        {cargando ? (
          <p className="text-sm text-gray-500 p-4">Cargando certificados...</p>
        ) : filtrados.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No hay certificados{filtro !== "todos" ? ` en estado "${filtro}"` : ""}.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">#</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Estudiante</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Tipo</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Fecha</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Estado</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtrados.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 font-medium">{c.id}</td>
                  <td className="px-4 py-3 text-gray-600">{c.estudiante_nombre || c.estudiante_id}</td>
                  <td className="px-4 py-3 text-gray-600">{c.tipo}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{c.fecha_creacion || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      c.estado === "Pendiente" ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                      : c.estado === "Autorizado" ? "bg-blue-50 text-blue-700 border-blue-200"
                      : c.estado === "Emitido" ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-gray-50 text-gray-600 border-gray-200"
                    }`}>{c.estado}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {usuario?.rol === "direccion" && c.estado === "Pendiente" && (
                        <button onClick={() => manejarAutorizar(c.id)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer">
                          Autorizar
                        </button>
                      )}
                      {usuario?.rol === "administrador" && c.estado === "Autorizado" && (
                        <button onClick={() => manejarGenerar(c.id)} disabled={generando === c.id}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary-hover disabled:bg-gray-300 disabled:text-gray-500 transition-colors cursor-pointer">
                          {generando === c.id ? "Generando..." : "Generar PDF"}
                        </button>
                      )}
                      {c.estado === "Emitido" && (
                        <button onClick={() => descargarPDF(c.id)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                          Descargar PDF
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {certificados.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Flujo de generacion</h3>
          <div className="flex items-center gap-2 justify-center py-4 flex-wrap">
            {[
              { label: "Solicitado", cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
              { label: "Autorizado", cls: "bg-blue-50 text-blue-700 border-blue-200" },
              { label: "Generado", cls: "bg-green-50 text-green-700 border-green-200" },
            ].map((paso, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={`inline-flex items-center px-4 py-1.5 text-sm font-semibold rounded-full border ${paso.cls}`}>{paso.label}</span>
                {i < 2 && <span className="text-gray-300 text-lg">→</span>}
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-500 mt-1">El estudiante solicita → Direccion autoriza → Administrador genera el PDF oficial con QR</p>
        </div>
      )}
    </div>
  );
}
