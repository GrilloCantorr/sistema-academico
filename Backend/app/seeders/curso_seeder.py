from app import db
from app.modelos.curso import Curso


def ejecutar():
    if Curso.query.first():
        print("Cursos ya existen")
        return

    cursos = [
        Curso(nombre="Programacion I", codigo="PROG1", creditos=4, horas_lectivas=4, horas_practicas=2),
        Curso(nombre="Base de Datos I", codigo="BD1", creditos=4, horas_lectivas=3, horas_practicas=2),
        Curso(nombre="Redes de Computadoras", codigo="RED1", creditos=3, horas_lectivas=3, horas_practicas=1),
    ]

    db.session.add_all(cursos)
    db.session.commit()

    print("Cursos creados")