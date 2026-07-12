from datetime import datetime
from app.modelos.configuracion_ciclo_global import ConfiguracionCicloGlobal

ESTADOS_CICLO = [
    "Planificacion Horaria",
    "Inscripcion de Matricula Abierta",
    "Periodo de Clases Regular",
    "Registro de Notas Parciales",
    "Cierre de Actas",
    "Inactivo/Historico",
]

VENTANAS_POR_PROCESO = {
    "matricula": {
        "estado_requerido": "Inscripcion de Matricula Abierta",
        "campo_fecha_limite": "fecha_cierre_matricula",
    },
    "registro_notas": {
        "estado_requerido": "Registro de Notas Parciales",
        "campo_fecha_limite": "fecha_limite_notas",
    },
    "cierre_actas": {
        "estado_requerido": "Cierre de Actas",
        "campo_fecha_limite": "fecha_cierre_actas",
    },
}


def obtener_configuracion_activa():
    configuracion = ConfiguracionCicloGlobal.query.get(1)
    if not configuracion:
        configuracion = ConfiguracionCicloGlobal(id=1, estado_ciclo=ESTADOS_CICLO[0])
        from app import db
        db.session.add(configuracion)
        db.session.commit()
    return configuracion


def periodo_activo():
    from app.modelos.periodo_academico import PeriodoAcademico

    configuracion = obtener_configuracion_activa()

    if configuracion.periodo_academico_id:
        periodo = PeriodoAcademico.query.get(configuracion.periodo_academico_id)
        if periodo:
            return periodo

    return PeriodoAcademico.query.order_by(PeriodoAcademico.fecha_inicio.desc()).first()


def ventana_permite(proceso):
    configuracion = obtener_configuracion_activa()
    definicion = VENTANAS_POR_PROCESO.get(proceso)

    if not definicion:
        return True

    if configuracion.estado_ciclo != definicion["estado_requerido"]:
        return False

    fecha_limite = getattr(configuracion, definicion["campo_fecha_limite"])
    if fecha_limite and datetime.utcnow() > fecha_limite:
        return False

    return True
