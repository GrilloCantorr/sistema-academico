from app import db
from app.modelos.estado_matricula import EstadoMatricula


def ejecutar():
    if EstadoMatricula.query.first():
        print("Estados de matricula ya existen")
        return

    estados = [
        EstadoMatricula(nombre="Pendiente"),
        EstadoMatricula(nombre="Validado"),
        EstadoMatricula(nombre="Matriculado"),
        EstadoMatricula(nombre="Retirado"),
        EstadoMatricula(nombre="Anulado"),
    ]
    db.session.add_all(estados)
    db.session.commit()
    print("Estados de matricula creados")