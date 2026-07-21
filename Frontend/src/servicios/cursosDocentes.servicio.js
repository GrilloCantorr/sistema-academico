import { peticion, URL_BASE } from "./api";

export async function listarCursos() {
  return peticion("/cursos-docentes/");
}

export async function obtenerCurso(id) {
  return peticion(`/cursos-docentes/${id}`);
}

export async function listarPrerequisitos() {
  return peticion("/cursos-docentes/prerequisitos");
}

export async function listarDocentes() {
  return peticion("/cursos-docentes/docentes");
}

export async function listarAsignacionesSecciones() {
  return peticion("/cursos-docentes/asignaciones-secciones");
}

export async function listarTiposDocentes() {
  return peticion("/cursos-docentes/tipos-docentes");
}

export async function misCursosAsignados() {
  return peticion("/cursos-docentes/mis-cursos");
}

export async function asignarDocente(seccionCursoId, datos) {
  return peticion(`/cursos-docentes/secciones/${seccionCursoId}/asignar-docente`, {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export async function gestionarHorario(seccionCursoId, datos) {
  return peticion(`/cursos-docentes/secciones/${seccionCursoId}/horario`, {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export async function cargaDocente(queryParams = "") {
  return peticion(`/cursos-docentes/carga-docente${queryParams ? "?" + queryParams : ""}`);
}

export async function cargarSilabo(seccionCursoId, archivo) {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("archivo", archivo);

  try {
    const respuesta = await fetch(`${URL_BASE}/cursos-docentes/secciones/${seccionCursoId}/silabo`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const datos = await respuesta.json().catch(() => null);

    if (!respuesta.ok) {
      return { data: null, error: datos?.error || datos?.mensaje || "Ocurrió un error" };
    }

    return { data: datos, error: null };
  } catch {
    return { data: null, error: "No se pudo conectar con el servidor" };
  }
}

export async function evaluarCumplimientoPlan(periodoAcademicoId) {
  return peticion(`/cursos-docentes/cumplimiento-plan-estudios?periodo_academico_id=${periodoAcademicoId}`);
}

export function urlDescargarSilabo(seccionCursoId) {
  return `${URL_BASE}/cursos-docentes/secciones/${seccionCursoId}/silabo`;
}