import { peticion, URL_BASE } from "./api";

export async function obtenerRecord(estudianteId) {
  return peticion(`/record-academico/${estudianteId}`);
}

export async function miHistorial() {
  return peticion("/record-academico/mi-historial");
}

export async function obtenerProgreso(estudianteId) {
  return peticion(`/record-academico/progreso/${estudianteId}`);
}

export async function listarTiposClasificacion() {
  return peticion("/record-academico/tipos-clasificacion");
}

export async function listarEstadosPermanencia() {
  return peticion("/record-academico/estados-permanencia");
}

export async function reportesConsolidados() {
  return peticion("/record-academico/reportes");
}

export async function desempenoPorCohorte() {
  return peticion("/record-academico/desempeno-cohorte");
}

export async function buscarEstudiantes(query) {
  return peticion(`/record-academico/buscar-estudiantes?q=${encodeURIComponent(query)}`);
}

export async function kardexEstudiante(estudianteId) {
  return peticion(`/record-academico/kardex/${estudianteId}`);
}

export function urlKardexPdf(estudianteId) {
  const token = localStorage.getItem("token");
  return `${URL_BASE}/record-academico/kardex/${estudianteId}/pdf?jwt=${token}`;
}