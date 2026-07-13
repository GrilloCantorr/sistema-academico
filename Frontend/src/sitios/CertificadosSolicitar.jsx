import { useState } from "react";
import { solicitarCertificado } from "../servicios/certificados.servicio";

const TIPOS_CERTIFICADO = [
  { value: "Constancia de estudios", label: "Constancia de estudios" },
  { value: "Constancia de matricula", label: "Constancia de matrícula" },
  { value: "Certificado de notas", label: "Certificado de notas" },
  { value: "Record academico", label: "Récord académico" },
  { value: "Constancia de egreso", label: "Constancia de egreso" },
];

export default function CertificadosSolicitar() {
  const [tipo, setTipo] = useState(TIPOS_CERTIFICADO[0].value);
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
    setTipo(TIPOS_CERTIFICADO[0].value);
  }

  const esErrorDeuda = error?.codigo === "DEUDA_PENDIENTE";

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Trámite y Solicitud de Certificados</h2>
        <p className="text-base text-gray-500 mt-1">Plataforma digital para la solicitud formal de constancias de estudio, matrícula, egreso y récords meritocráticos.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Nueva Solicitud de Documento</h3>
        <form onSubmit={manejarEnvio} className="flex flex-col sm:flex-row gap-6 items-end">
          <div className="w-full sm:flex-1">
            <label className="block mb-2 text-xs font-bold text-gray-500 uppercase tracking-widest">Tipo de Certificado / Constancia</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} required className="bg-white border-gray-300 w-full font-semibold">
              {TIPOS_CERTIFICADO.map((op) => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={enviando}
            className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover disabled:bg-gray-300 disabled:text-gray-500 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            {enviando ? "Procesando..." : "Generar Solicitud"}
          </button>
        </form>
      </div>

      {error && !esErrorDeuda && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 font-semibold text-sm rounded-xl shadow-sm">⚠ {error}</div>
      )}

      {error && esErrorDeuda && (
        <div className="bg-white rounded-xl border border-gray-250 p-8 mb-8 border-l-4 border-l-red-600 shadow-sm">
          <h3 className="text-lg font-bold text-red-700 mb-2 flex items-center gap-2">⚠ Restricción por Deuda Pendiente</h3>
          <p className="text-sm text-gray-700 mb-4 font-medium">{error.error || "Debe regularizar sus pagos para solicitar este documento."}</p>
          <div className="bg-red-50/50 rounded-xl p-6 border border-red-200">
            <strong className="block mb-3 text-red-800 text-sm font-bold uppercase tracking-wider">Pasos para Regularización de Pagos:</strong>
            <ol className="m-0 pl-5 space-y-2 text-gray-750 text-sm font-medium">
              {error.pasos_pago?.map((paso, i) => (
                <li key={i}>{paso.replace(/^\d+\.\s*/, "")}</li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {respuesta && (
        <div className="bg-white rounded-xl border border-gray-250 p-8 mb-8 border-l-4 border-l-green-500 shadow-sm">
          <h3 className="text-lg font-bold text-green-700 mb-4">✓ Solicitud de Trámite Registrada</h3>
          <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm mb-6">
            <table className="w-full text-base">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">N° Trámite</th>
                  <th className="text-left px-6 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">Documento</th>
                  <th className="text-center px-6 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider w-36">Estado</th>
                  <th className="text-left px-6 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">Fecha Solicitud</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-black text-gray-900"># {respuesta.id}</td>
                  <td className="px-6 py-4 text-gray-800 font-bold">{respuesta.tipo}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200">{respuesta.estado}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">{respuesta.fecha_solicitud}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bg-green-50/50 rounded-xl p-6 border border-green-200">
            <strong className="block mb-3 text-green-800 text-sm font-bold uppercase tracking-wider font-extrabold">Pasos Siguientes para el Trámite:</strong>
            <ol className="m-0 pl-5 space-y-2 text-gray-750 text-sm font-medium">
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
