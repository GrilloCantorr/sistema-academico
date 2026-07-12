from datetime import datetime

from app import db
from app.modelos.curso import Curso
from app.modelos.seccion_curso import SeccionCurso
from app.modelos.periodo_academico import PeriodoAcademico
from app.modelos.plan_cursos_semestre import PlanCursosSemestre


def _nombre_periodo_actual():
    fecha = datetime.now()
    semestre = "I" if fecha.month <= 6 else "II"
    return f"{fecha.year}-{semestre}"


def _obtener_o_crear_periodo_actual():
    nombre = _nombre_periodo_actual()
    periodo = PeriodoAcademico.query.filter_by(nombre=nombre).first()
    if periodo:
        return periodo

    fecha = datetime.now()
    if fecha.month <= 6:
        inicio, fin = datetime(fecha.year, 1, 1), datetime(fecha.year, 6, 30)
    else:
        inicio, fin = datetime(fecha.year, 7, 1), datetime(fecha.year, 12, 31)

    periodo = PeriodoAcademico(nombre=nombre, fecha_inicio=inicio, fecha_fin=fin)
    db.session.add(periodo)
    db.session.commit()
    return periodo


def ejecutar():
    if SeccionCurso.query.first():
        print("Secciones de curso ya existen")
        return

    periodo = _obtener_o_crear_periodo_actual()

    combinaciones = PlanCursosSemestre.query.with_entities(
        PlanCursosSemestre.curso_id, PlanCursosSemestre.semestre_id
    ).distinct().all()

    if not combinaciones:
        print("No hay plan_cursos_semestre para crear secciones de curso")
        return

    secciones = [
        SeccionCurso(
            periodo_academico_id=periodo.id,
            curso_id=curso_id,
            semestre_id=semestre_id,
            cupos=40,
        )
        for curso_id, semestre_id in combinaciones
    ]

    db.session.add_all(secciones)
    db.session.commit()

    print(f"Secciones de curso creadas: {len(secciones)} para el periodo {periodo.nombre}")
