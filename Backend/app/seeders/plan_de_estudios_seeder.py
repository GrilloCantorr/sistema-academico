from app import db
from app.modelos.especialidad import Especialidad
from app.modelos.plan_de_estudios import PlanDeEstudios


def ejecutar():
    if PlanDeEstudios.query.first():
        print("Planes de estudio ya existen")
        return

    especialidades = Especialidad.query.all()
    if not especialidades:
        print("No hay especialidades para crear planes de estudio")
        return

    planes = [
        PlanDeEstudios(especialidad_id=especialidades[0].id, anio_creacion=2024, vigente=True),
        PlanDeEstudios(especialidad_id=especialidades[1].id, anio_creacion=2024, vigente=True),
        PlanDeEstudios(especialidad_id=especialidades[2].id, anio_creacion=2023, vigente=True),
    ]

    db.session.add_all(planes)
    db.session.commit()

    print("Planes de estudio creados")