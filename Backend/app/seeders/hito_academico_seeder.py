from app import db
from app.modelos.periodo_academico import PeriodoAcademico
from app.modelos.hito_academico import HitoAcademico


def ejecutar():
    if HitoAcademico.query.first():
        print("Hitos academicos ya existen")
        return

    periodo = PeriodoAcademico.query.first()
    if not periodo:
        print("No hay periodo academico para crear hitos")
        return

    from datetime import datetime
    hitos = [
        HitoAcademico(periodo_academico_id=periodo.id, tipo_nota="Parcial 1", fecha_limite=datetime(2026, 4, 30)),
        HitoAcademico(periodo_academico_id=periodo.id, tipo_nota="Parcial 2", fecha_limite=datetime(2026, 6, 15)),
        HitoAcademico(periodo_academico_id=periodo.id, tipo_nota="Practica", fecha_limite=datetime(2026, 6, 30)),
        HitoAcademico(periodo_academico_id=periodo.id, tipo_nota="Final", fecha_limite=datetime(2026, 7, 15)),
    ]
    db.session.add_all(hitos)
    db.session.commit()
    print("Hitos academicos creados")
