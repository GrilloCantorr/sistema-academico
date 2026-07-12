import { peticion } from "./api";

export async function listarUsuarios() {
  return peticion("/administracion/usuarios");
}

export async function cambiarRol(usuarioId, rol) {
  return peticion(`/administracion/usuarios/${usuarioId}/rol`, {
    method: "PUT",
    body: JSON.stringify({ rol }),
  });
}

export async function listarAuditorias(queryParams = "") {
  return peticion(`/administracion/auditorias${queryParams ? "?" + queryParams : ""}`);
}

export async function reportesEstrategicos() {
  return peticion("/administracion/reportes-estrategicos");
}

export async function listarFacultades() {
  return peticion("/administracion/facultades");
}

export async function listarEspecialidades() {
  return peticion("/administracion/especialidades");
}

export async function listarPlanesEstudio() {
  return peticion("/administracion/planes-estudio");
}

export async function listarSemestres() {
  return peticion("/administracion/semestres");
}

export async function crearUsuario(datos) {
  return peticion("/administracion/usuarios/crear", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export async function toggleUsuario(usuarioId) {
  return peticion(`/administracion/usuarios/${usuarioId}/toggle`, {
    method: "POST",
  });
}

export async function cambiarPassword(usuarioId, password) {
  return peticion(`/administracion/usuarios/${usuarioId}/password`, {
    method: "PUT",
    body: JSON.stringify({ password }),
  });
}