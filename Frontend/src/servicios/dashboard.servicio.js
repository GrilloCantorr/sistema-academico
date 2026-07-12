import { peticion } from "./api";

export async function obtenerDashboard() {
  return peticion("/dashboard/");
}
