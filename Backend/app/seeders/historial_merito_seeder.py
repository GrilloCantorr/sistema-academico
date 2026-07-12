from app import db
from app.modelos.especialidad import Especialidad
from app.modelos.estudiante import Estudiante
from app.modelos.historial_merito import HistorialMerito
from app.modelos.periodo_academico import PeriodoAcademico
from app.modelos.semestre import Semestre
from app.modelos.tipo_clasificacion_merito import TipoClasificacionMerito


def ejecutar():
    if HistorialMerito.query.first():
        print("Historial de merito ya existe")
        return

    estudiante = Estudiante.query.first()
    periodo = PeriodoAcademico.query.first()
    semestre = Semestre.query.first()
    especialidad = Especialidad.query.first()
    tipo = TipoClasificacionMerito.query.first()

    if not estudiante or not periodo or not semestre or not especialidad or not tipo:
        print("No hay datos suficientes para crear historial de merito")
        return

    historial = HistorialMerito(
        estudiante_id=estudiante.id,
        periodo_academico_id=periodo.id,
        semestre_id=semestre.id,
        especialidad_id=especialidad.id,
        promedio_ponderado_periodo=15.75,
        creditos_matriculados_periodo=20,
        creditos_aprobados_periodo=18,
        orden_merito=1,
        tipo_clasificacion_id=tipo.id,
    )

    db.session.add(historial)
    db.session.commit()

    print("Historial de merito creado")
