from app import db
from app.modelos.estado_curso import EstadoCurso


def ejecutar():
    if EstadoCurso.query.first():
        print("Estados de curso ya existen")
        return

    estados = [
        EstadoCurso(nombre="Aprobado"),
        EstadoCurso(nombre="Desaprobado"),
        EstadoCurso(nombre="Retirado"),
        EstadoCurso(nombre="Cursando"),
    ]

    db.session.add_all(estados)
    db.session.commit()

    print("Estados de curso creados")