from flask import jsonify
from flask_jwt_extended import get_jwt_identity, get_jwt, verify_jwt_in_request
from app import db
from app.modelos.usuario import Usuario
from app.modelos.estudiante import Estudiante
from app.modelos.docente import Docente
from app.modelos.curso import Curso
from app.modelos.facultad import Facultad
from app.modelos.especialidad import Especialidad
from app.modelos.matricula import Matricula
from app.modelos.matricula_detalle import MatriculaDetalle
from app.modelos.progreso_estudiante import ProgresoEstudiante
from app.modelos.seccion_curso import SeccionCurso
from app.modelos.seccion_docente import SeccionDocente
from app.modelos.periodo_academico import PeriodoAcademico
from sqlalchemy import func


def obtener_dashboard():
    verify_jwt_in_request()
    usuario_id = get_jwt_identity()
    claims = get_jwt()
    rol = claims.get("rol")

    if rol == "estudiante":
        return jsonify(_dashboard_estudiante(usuario_id))
    elif rol == "docente":
        return jsonify(_dashboard_docente(usuario_id))
    elif rol == "administrador":
        return jsonify(_dashboard_administrador())
    elif rol == "direccion":
        return jsonify(_dashboard_direccion())

    return jsonify({"error": "Rol no válido"}), 403


def _dashboard_estudiante(usuario_id):
    estudiante = Estudiante.query.filter_by(usuario_id=usuario_id).first()
    if not estudiante:
        return {"stats": [], "info": {}, "mensaje": "Perfil de estudiante no encontrado"}

    progreso = ProgresoEstudiante.query.filter_by(estudiante_id=estudiante.id).first()
    especialidad = db.session.get(Especialidad, estudiante.especialidad_id)
    facultad = db.session.get(Facultad, especialidad.facultad_id) if especialidad else None

    periodo_actual = PeriodoAcademico.query.order_by(PeriodoAcademico.id.desc()).first()
    matricula_activa = None
    cursos_actuales = 0
    if periodo_actual:
        matricula_activa = Matricula.query.filter_by(
            estudiante_id=estudiante.id,
            periodo_academico_id=periodo_actual.id
        ).first()

        if matricula_activa:
            cursos_actuales = MatriculaDetalle.query.filter_by(
                matricula_id=matricula_activa.id
            ).count()

    total_cursos = MatriculaDetalle.query.join(Matricula).filter(
        Matricula.estudiante_id == estudiante.id
    ).count()

    return {
        "stats": [
            {
                "icon": "AcademicCap",
                "valor": progreso.creditos_aprobados_acumulados if progreso else 0,
                "etiqueta": "Créditos aprobados",
            },
            {
                "icon": "ChartBar",
                "valor": f"{float(progreso.promedio_ponderado_acumulado):.2f}" if progreso else "0.00",
                "etiqueta": "Promedio ponderado",
            },
            {
                "icon": "BookOpen",
                "valor": cursos_actuales,
                "etiqueta": "Cursos este período",
            },
            {
                "icon": "ClipboardList",
                "valor": total_cursos,
                "etiqueta": "Total cursos llevados",
            },
        ],
        "info": {
            "especialidad": especialidad.nombre if especialidad else "—",
            "facultad": facultad.nombre if facultad else "—",
            "matricula_activa": matricula_activa is not None,
            "estado_matricula": matricula_activa.estado.nombre if matricula_activa else "Sin matrícula",
            "pagado": matricula_activa.pagado if matricula_activa else False,
        },
        "mensaje": None,
    }


def _dashboard_docente(usuario_id):
    docente = Docente.query.filter_by(usuario_id=usuario_id, deleted_at=None).first()
    if not docente:
        return {"stats": [], "cursos": [], "mensaje": "Perfil de docente no encontrado"}

    periodo_actual = PeriodoAcademico.query.order_by(PeriodoAcademico.id.desc()).first()

    asignaciones = []
    creditos_totales = 0
    if periodo_actual:
        asignaciones = (
            db.session.query(SeccionCurso)
            .join(SeccionDocente)
            .filter(
                SeccionDocente.docente_id == docente.id,
                SeccionCurso.periodo_academico_id == periodo_actual.id,
            )
            .all()
        )

        for seccion in asignaciones:
            curso = db.session.get(Curso, seccion.curso_id)
            if curso:
                creditos_totales += (curso.creditos or 0)

    total_estudiantes = (
        db.session.query(func.count(MatriculaDetalle.matricula_id))
        .join(SeccionCurso, SeccionCurso.id == MatriculaDetalle.seccion_curso_id)
        .join(SeccionDocente)
        .filter(
            SeccionDocente.docente_id == docente.id,
            SeccionCurso.id == SeccionDocente.seccion_curso_id,
        )
        .scalar()
        or 0
    )

    cursos_data = []
    for seccion in asignaciones:
        curso = db.session.get(Curso, seccion.curso_id)
        if curso:
            count = (
                MatriculaDetalle.query.filter_by(seccion_curso_id=seccion.id).count()
            )
            cursos_data.append({
                "nombre": curso.nombre,
                "codigo": curso.codigo,
                "creditos": curso.creditos,
                "estudiantes": count,
            })

    return {
        "stats": [
            {
                "icon": "BookOpen",
                "valor": len(asignaciones),
                "etiqueta": "Cursos este período",
            },
            {
                "icon": "AcademicCap",
                "valor": creditos_totales,
                "etiqueta": "Créditos asignados",
            },
            {
                "icon": "Users",
                "valor": total_estudiantes,
                "etiqueta": "Total estudiantes",
            },
        ],
        "cursos": cursos_data,
        "mensaje": None,
    }


def _dashboard_administrador():
    total_estudiantes = Estudiante.query.filter(Estudiante.deleted_at.is_(None)).count()
    total_docentes = Docente.query.filter(Docente.deleted_at.is_(None)).count()
    total_cursos = Curso.query.filter(Curso.deleted_at.is_(None)).count()
    total_matriculas = Matricula.query.filter(Matricula.deleted_at.is_(None)).count()
    periodo_actual = PeriodoAcademico.query.order_by(PeriodoAcademico.id.desc()).first()

    matriculas_periodo = 0
    if periodo_actual:
        matriculas_periodo = Matricula.query.filter(
            Matricula.periodo_academico_id == periodo_actual.id,
            Matricula.deleted_at.is_(None),
        ).count()

    return {
        "stats": [
            {
                "icon": "Users",
                "valor": total_estudiantes,
                "etiqueta": "Estudiantes",
            },
            {
                "icon": "Briefcase",
                "valor": total_docentes,
                "etiqueta": "Docentes",
            },
            {
                "icon": "BookOpen",
                "valor": total_cursos,
                "etiqueta": "Cursos",
            },
            {
                "icon": "ClipboardList",
                "valor": matriculas_periodo,
                "etiqueta": "Matrículas período actual",
            },
        ],
        "info": {
            "periodo_actual": periodo_actual.nombre if periodo_actual else "—",
            "total_matriculas_historicas": total_matriculas,
        },
        "mensaje": None,
    }


def _dashboard_direccion():
    total_estudiantes = Estudiante.query.filter(Estudiante.deleted_at.is_(None)).count()
    total_docentes = Docente.query.filter(Docente.deleted_at.is_(None)).count()
    total_cursos = Curso.query.filter(Curso.deleted_at.is_(None)).count()
    total_facultades = Facultad.query.count()
    total_especialidades = Especialidad.query.count()
    total_matriculas = Matricula.query.filter(Matricula.deleted_at.is_(None)).count()
    periodo_actual = PeriodoAcademico.query.order_by(PeriodoAcademico.id.desc()).first()

    matriculas_periodo = 0
    if periodo_actual:
        matriculas_periodo = Matricula.query.filter(
            Matricula.periodo_academico_id == periodo_actual.id,
            Matricula.deleted_at.is_(None),
        ).count()

    return {
        "stats": [
            {
                "icon": "Users",
                "valor": total_estudiantes,
                "etiqueta": "Estudiantes",
            },
            {
                "icon": "Briefcase",
                "valor": total_docentes,
                "etiqueta": "Docentes",
            },
            {
                "icon": "BookOpen",
                "valor": total_cursos,
                "etiqueta": "Cursos",
            },
            {
                "icon": "AcademicCap",
                "valor": total_facultades,
                "etiqueta": "Facultades",
            },
            {
                "icon": "ClipboardList",
                "valor": total_especialidades,
                "etiqueta": "Especialidades",
            },
            {
                "icon": "ChartBar",
                "valor": matriculas_periodo,
                "etiqueta": "Matrículas período actual",
            },
        ],
        "info": {
            "periodo_actual": periodo_actual.nombre if periodo_actual else "—",
            "total_matriculas_historicas": total_matriculas,
        },
        "mensaje": None,
    }
