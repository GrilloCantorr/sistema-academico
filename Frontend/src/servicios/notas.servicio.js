import { peticion } from "./api";

export async function listarNotas(params = "") {
  return peticion(`/notas/${params ? "?" + params : ""}`);
}

export async function obtenerNotasMatricula(matriculaId) {
  return peticion(`/notas/matricula/${matriculaId}`);
}

export async function miHojaDeNotas(semestreId) {
  const query = semestreId ? `?semestre_id=${semestreId}` : "";
  return peticion(`/notas/mi-hoja${query}`);
}

export async function registrarNota(datos) {
  return peticion("/notas/", {
    method: "PUT",
    body: JSON.stringify(datos),
  });
}

export async function misCursosNotas() {
  return peticion("/notas/mis-cursos-notas");
}

export async function listarEstadosCurso() {
  return peticion("/notas/estados");
}

export async function validarActas() {
  return peticion("/notas/validar-actas");
}

export async function cerrarActa(seccionCursoId) {
  return peticion("/notas/cerrar-acta", {
    method: "POST",
    body: JSON.stringify({ seccion_curso_id: seccionCursoId }),
  });
}

export async function indicadoresAcademicos() {
  return peticion("/notas/indicadores");
}
