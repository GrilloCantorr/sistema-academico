from app import db
from app.modelos.estado_curso import EstadoCurso
from app.modelos.matricula import Matricula
from app.modelos.matricula_detalle import MatriculaDetalle
from app.modelos.seccion_curso import SeccionCurso
from app.modelos.plan_cursos_semestre import PlanCursosSemestre
from app.modelos.plan_estudiante import PlanEstudiante


def ejecutar():
    if MatriculaDetalle.query.first():
        print("Detalles de matricula ya existen")
        return

    matricula = Matricula.query.first()
    estado_curso = EstadoCurso.query.filter_by(nombre="Aprobado").first()

    if not matricula or not estado_curso:
        print("No hay datos suficientes para crear detalles de matricula")
        return

    plan_estudiante = PlanEstudiante.query.filter_by(
        estudiante_id=matricula.estudiante_id
    ).first()

    if not plan_estudiante:
        print("El estudiante de la matricula no tiene plan de estudios asignado")
        return

    # Se toma el curso del primer semestre del plan del propio estudiante
    # (en vez de "el primero que exista en toda la tabla"), para que el
    # curso que se marca como aprobado sea siempre uno que realmente le
    # corresponde a ese estudiante.
    primer_curso_plan = (
        PlanCursosSemestre.query.filter_by(plan_estudios_id=plan_estudiante.plan_estudios_id)
        .order_by(PlanCursosSemestre.semestre_id)
        .first()
    )

    if not primer_curso_plan:
        print("El plan de estudios del estudiante no tiene cursos asignados")
        return

    seccion = SeccionCurso.query.filter_by(
        curso_id=primer_curso_plan.curso_id,
        semestre_id=primer_curso_plan.semestre_id,
    ).first()

    if not seccion:
        print("No hay seccion de curso para el curso del primer semestre del plan")
        return

    detalle = MatriculaDetalle(
        matricula_id=matricula.id,
        seccion_curso_id=seccion.id,
        nota_final=15.50,
        estado_curso_id=estado_curso.id,
    )

    db.session.add(detalle)
    db.session.commit()

    print(f"Detalles de matricula creados: curso aprobado = {primer_curso_plan.curso.nombre}")