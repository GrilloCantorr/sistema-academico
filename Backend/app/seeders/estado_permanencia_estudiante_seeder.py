from app import db
from app.modelos.estado_permanencia_estudiante import EstadoPermanenciaEstudiante


def ejecutar():
    if EstadoPermanenciaEstudiante.query.first():
        print("Estados de permanencia ya existen")
        return

    estados = [
        EstadoPermanenciaEstudiante(nombre="Regular", descripcion="El estudiante avanza normalmente"),
        EstadoPermanenciaEstudiante(nombre="Condicional", descripcion="El estudiante tiene observaciones académicas"),
        EstadoPermanenciaEstudiante(nombre="Egresado", descripcion="El estudiante completó el plan de estudios"),
    ]

    db.session.add_all(estados)
    db.session.commit()

    print("Estados de permanencia creados")