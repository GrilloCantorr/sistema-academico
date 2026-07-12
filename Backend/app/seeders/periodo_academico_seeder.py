from datetime import datetime

from app import db
from app.modelos.periodo_academico import PeriodoAcademico


def ejecutar():
    if PeriodoAcademico.query.first():
        print("Periodos academicos ya existen")
        return

    periodos = [
        PeriodoAcademico(
            nombre="2025-I",
            fecha_inicio=datetime(2025, 3, 1),
            fecha_fin=datetime(2025, 7, 31),
            dias_limite_pago=15,
        ),
        PeriodoAcademico(
            nombre="2025-II",
            fecha_inicio=datetime(2025, 8, 1),
            fecha_fin=datetime(2025, 12, 20),
            dias_limite_pago=15,
        ),
        PeriodoAcademico(
            nombre="2026-I",
            fecha_inicio=datetime(2026, 3, 1),
            fecha_fin=datetime(2026, 7, 31),
            dias_limite_pago=15,
        ),
    ]

    db.session.add_all(periodos)
    db.session.commit()

    print("Periodos academicos creados")