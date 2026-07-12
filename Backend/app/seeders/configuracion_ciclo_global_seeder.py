from app import db
from app.modelos.configuracion_ciclo_global import ConfiguracionCicloGlobal
from app.modelos.periodo_academico import PeriodoAcademico


def ejecutar():
    if ConfiguracionCicloGlobal.query.first():
        print("Configuracion de ciclo global ya existe")
        return

    periodo = PeriodoAcademico.query.first()

    config = ConfiguracionCicloGlobal(
        id=1,
        periodo_academico_id=periodo.id if periodo else None,
        estado_ciclo="Inscripcion de Matricula Abierta",
        fecha_cierre_matricula=None,
        fecha_limite_notas=None,
        fecha_cierre_actas=None,
    )
    db.session.add(config)
    db.session.commit()
    print("Configuracion de ciclo global creada")
