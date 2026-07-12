import { peticion } from "./api";

export async function iniciarSesion(username, password) {
  return peticion("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function registrarEstudiante(datosEstudiante) {
  return peticion("/auth/registrar", {
    method: "POST",
    body: JSON.stringify(datosEstudiante),
  });
}