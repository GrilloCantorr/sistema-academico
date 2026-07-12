import { useState } from "react";
import { solicitarCertificado } from "../servicios/certificados.servicio";

const TIPOS_CERTIFICADO = [
  "Constancia de estudios",
  "Constancia de matricula",
  "Certificado de notas",
  "Record academico",
  "Constancia de egreso",
];

export default function CertificadosSolicitar() {
  const [tipo, setTipo] = useState(TIPOS_CERTIFICADO[0]);
  const [respuesta, setRespuesta] = useState(null);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setRespuesta(null);
    setError(null);
    setEnviando(true);
    const { data, error } = await solicitarCertificado({ tipo });
    setEnviando(false);
    if (error) { setError(error); return; }
    setRespuesta(data);
    setTipo(TIPOS_CERTIFICADO[0]);
  }

  const esErrorDeuda = error?.codigo === "DEUDA_PENDIENTE";

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Solicitar certificado</h2>
        <p className="text-sm text-gray-500 mt-1">Selecciona el documento que necesitas y genera tu solicitud formal.</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Nueva solicitud</h3>
        <form onSubmit={manejarEnvio}>
          <div className="mb-4">
            <label>Tipo de documento</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} required>
              {TIPOS_CERTIFICADO.map((opcion) => (
                <option key={opcion} value={opcion}>{opcion}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={enviando}
            className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover disabled:bg-gray-300 disabled:text-gray-500 transition-colors cursor-pointer">
            {enviando ? "Enviando..." : "Solicitar"}
          </button>
        </form>
      </div>

      {error && !esErrorDeuda && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
      )}

      {error && esErrorDeuda && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8 border-l-4 border-l-red-600">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Deuda pendiente</h3>
          <p className="text-sm text-gray-700 mb-4">{error.error}</p>
          <div className="bg-red-50 rounded-lg p-4 text-sm">
            <strong className="block mb-2 text-red-800">Pasos para regularizar:</strong>
            <ol className="m-0 pl-5 space-y-1 text-gray-700">
              {error.pasos_pago?.map((paso, i) => (
                <li key={i}>{paso.replace(/^\d+\.\s*/, "")}</li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {respuesta && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8 border-l-4 border-l-green-500">
          <h3 className="text-lg font-semibold text-green-700 mb-4">Solicitud registrada</h3>
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">N° Solicitud</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Tipo</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Estado</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-bold text-gray-900">{respuesta.id}</td>
                <td className="px-4 py-3 text-gray-600">{respuesta.tipo}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">{respuesta.estado}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">{respuesta.fecha_solicitud}</td>
              </tr>
            </tbody>
          </table>
          <div className="bg-green-50 rounded-lg p-4 text-sm">
            <strong className="block mb-2 text-green-800">Pasos siguientes:</strong>
            <ol className="m-0 pl-5 space-y-1 text-gray-700">
              {respuesta.pasos_siguientes?.map((paso, i) => (
                <li key={i}>{paso.replace(/^\d+\.\s*/, "")}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
