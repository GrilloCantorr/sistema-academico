from app import db
from app.modelos.curso import Curso
from app.modelos.plan_cursos_semestre import PlanCursosSemestre
from app.modelos.plan_de_estudios import PlanDeEstudios
from app.modelos.semestre import Semestre


def ejecutar():
    if PlanCursosSemestre.query.first():
        print("Plan cursos semestre ya existe")
        return

    planes = PlanDeEstudios.query.all()
    cursos = Curso.query.order_by(Curso.id).all()
    semestres = Semestre.query.order_by(Semestre.id).all()

    if not planes or not cursos or not semestres:
        print("No hay planes, cursos o semestres suficientes para crear plan_cursos_semestre")
        return


    cantidad = min(len(cursos), len(semestres))

    asignaciones = [
        PlanCursosSemestre(
            plan_estudios_id=plan.id,
            semestre_id=semestres[i].id,
            curso_id=cursos[i].id,
        )
        for plan in planes
        for i in range(cantidad)
    ]

    db.session.add_all(asignaciones)
    db.session.commit()

    print(f"Plan cursos semestre creado: {len(asignaciones)} asignaciones para {len(planes)} plan(es)")