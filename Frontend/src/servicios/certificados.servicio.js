import { peticion } from "./api";

const URL_BASE = "http://localhost:5000/api";

export async function listarSolicitudes() {
  return peticion("/certificados/bandeja");
}

export async function solicitarCertificado(datos) {
  return peticion("/certificados/solicitar", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export async function autorizarCertificado(certificadoId) {
  return peticion(`/certificados/${certificadoId}/autorizar`, {
    method: "PUT",
  });
}

export async function emitirCertificado(certificadoId) {
  return peticion(`/certificados/${certificadoId}/emitir`, {
    method: "POST",
  });
}

export async function verificarCertificado(codigo) {
  return peticion(`/certificados/verificar/${codigo}`);
}

export function urlQrCertificado(codigo) {
  return `${URL_BASE}/certificados/qr/${codigo}`;
}

export function urlDescargarCertificado(certificadoId) {
  return `${URL_BASE}/certificados/${certificadoId}/descargar`;
}
