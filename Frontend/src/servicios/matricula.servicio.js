import { peticion } from "./api";

export async function solicitarMatricula(seccionesCursoIds) {
  return peticion("/matriculas/", {
    method: "POST",
    body: JSON.stringify({ secciones_curso_ids: seccionesCursoIds }),
  });
}

export async function listarMatriculas() {
  return peticion("/matriculas/");
}

export async function listarPeriodos() {
  return peticion("/matriculas/periodos");
}

export async function obtenerPeriodoActual() {
  return peticion("/matriculas/periodo-actual");
}

export async function obtenerCursosDisponibles() {
  return peticion("/matriculas/cursos-disponibles");
}

export async function listarSecciones() {
  return peticion("/matriculas/secciones");
}

export async function listarEstadosMatricula() {
  return peticion("/matriculas/estados");
}

export async function validarRequisitos(matriculaId) {
  return peticion(`/matriculas/${matriculaId}/validar`, { method: "PUT" });
}

export async function registrarPago(matriculaId) {
  return peticion(`/matriculas/${matriculaId}/pago`, { method: "POST" });
}

export async function generarFichaOficial(matriculaId) {
  return peticion(`/matriculas/${matriculaId}/ficha-oficial`, { method: "POST" });
}

export async function obtenerEstadisticas() {
  return peticion("/matriculas/estadisticas");
}

export function urlDescargarFicha(matriculaId) {
  return `https://should-pound-necessarily-crest.trycloudflare.com/api/matriculas/${matriculaId}/ficha`;
}