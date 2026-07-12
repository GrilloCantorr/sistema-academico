from app import db
from app.modelos.curso import Curso
from app.modelos.pre_requisito import PreRequisito


def ejecutar():
    if PreRequisito.query.first():
        print("Prerequisitos ya existen")
        return

    cursos = Curso.query.limit(3).all()
    if len(cursos) < 3:
        print("No hay cursos suficientes para crear prerequisitos")
        return

    prerequisitos = [
        PreRequisito(curso_dependiente_id=cursos[1].id, curso_requisito_id=cursos[0].id),
        PreRequisito(curso_dependiente_id=cursos[2].id, curso_requisito_id=cursos[1].id),
    ]

    db.session.add_all(prerequisitos)
    db.session.commit()

    print("Prerequisitos creados")
