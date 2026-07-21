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

  function descargarPDF(id) {
    window.open(urlDescargarCertificado(id), "_blank");
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
      <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Autorización y Emisión de Certificados</h2>
          <p className="text-base text-gray-500 mt-2">Revisión de solicitudes de constancias académicas, firmas oficiales y verificación mediante código QR.</p>
        </div>
        <button
          onClick={() => window.print()}
          type="button"
          className="px-5 py-2.5 bg-white text-gray-750 border border-gray-350 rounded-lg text-sm font-bold hover:bg-gray-50 flex items-center gap-2 cursor-pointer shadow-sm no-print"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          Imprimir Reporte
        </button>
      </div>

      {mensaje && <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{mensaje}</div>}
      {error && <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8 shadow-sm no-print">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Verificar certificado</h3>
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

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-lg font-bold text-gray-900">Solicitudes y Tickets</h3>
          <div className="flex gap-2">
            {ESTADOS.map((op) => (
              <button key={op} onClick={() => setFiltro(op)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                  filtro === op ? "bg-primary text-white border-primary" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}>
                {op === "todos" ? "Todos" : op}
              </button>
            ))}
          </div>
        </div>

        {cargando ? (
          <p className="text-sm text-gray-500 p-8 text-center">Cargando certificados...</p>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-gray-50/50">
            <div className="w-16 h-16 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Bandeja de Trámites Vacía</h3>
            <p className="text-sm text-gray-500 max-w-sm">No se registran certificados{filtro !== "todos" ? ` en estado "${filtro}"` : " solicitados por los estudiantes hasta el momento."}</p>
          </div>
        ) : (
          <table className="w-full text-base">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Ticket</th>
                <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Estudiante</th>
                <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Tipo Documento</th>
                <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Fecha Solicitud</th>
                <th className="text-center px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider w-36">Estado</th>
                <th className="text-center px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider w-44">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filtrados.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-gray-900 font-black"># {c.id}</td>
                  <td className="px-6 py-4 text-gray-900 font-bold">{c.estudiante_nombre || c.estudiante_id}</td>
                  <td className="px-6 py-4 text-gray-800 font-semibold">{c.tipo}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">{c.fecha_creacion || "—"}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                      c.estado === "Pendiente" ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                      : c.estado === "Autorizado" ? "bg-blue-50 text-blue-700 border-blue-200"
                      : c.estado === "Emitido" ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-gray-50 text-gray-600 border-gray-200"
                    }`}>{c.estado}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex gap-2 justify-center flex-wrap">
                      {usuario?.rol === "direccion" && c.estado === "Pendiente" && (
                        <button onClick={() => manejarAutorizar(c.id)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer shadow-sm">
                          Autorizar
                        </button>
                      )}
                      {usuario?.rol === "administrador" && c.estado === "Autorizado" && (
                        <button onClick={() => manejarGenerar(c.id)} disabled={generando === c.id}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary-hover disabled:bg-gray-300 disabled:text-gray-500 transition-colors cursor-pointer shadow-sm">
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
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8 shadow-sm no-print">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Flujo de generación</h3>
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
