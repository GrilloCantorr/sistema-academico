from app import db
from app.modelos.estado_permanencia_estudiante import EstadoPermanenciaEstudiante
from app.modelos.estudiante import Estudiante
from app.modelos.progreso_estudiante import ProgresoEstudiante


def ejecutar():
    if ProgresoEstudiante.query.first():
        print("Progreso de estudiante ya existe")
        return

    estudiante = Estudiante.query.first()
    estado = EstadoPermanenciaEstudiante.query.filter_by(nombre="Regular").first()

    if not estudiante or not estado:
        print("No hay estudiante o estado de permanencia para crear progreso")
        return

    progreso = ProgresoEstudiante(
        estudiante_id=estudiante.id,
        estado_permanencia_id=estado.id,
        creditos_aprobados_acumulados=18,
        promedio_ponderado_acumulado=15.80,
    )

    db.session.add(progreso)
    db.session.commit()

    print("Progreso de estudiante creado")
