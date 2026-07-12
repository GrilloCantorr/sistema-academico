from datetime import time

from app import db
from app.modelos.seccion_curso import SeccionCurso
from app.modelos.seccion_horario import SeccionHorario

AULAS = ["A-101", "A-102", "A-103", "B-201", "B-202", "Lab-001"]

BLOQUES = [
    [(1, time(8, 0), time(10, 0)), (3, time(8, 0), time(10, 0))],
    [(2, time(10, 0), time(12, 0)), (4, time(10, 0), time(12, 0))],
    [(1, time(14, 0), time(16, 0)), (3, time(14, 0), time(16, 0))],
    [(2, time(16, 0), time(18, 0)), (4, time(16, 0), time(18, 0))],
    [(5, time(8, 0), time(10, 0)), (5, time(10, 0), time(12, 0))],
]


def ejecutar():
    secciones = SeccionCurso.query.all()
    if not secciones:
        print("No hay secciones de curso para crear horarios")
        return

    horarios_creados = 0

    for i, seccion in enumerate(secciones):
        bloque = BLOQUES[i % len(BLOQUES)]
        aula = AULAS[i % len(AULAS)]

        for dia, inicio, fin in bloque:
            existe = SeccionHorario.query.filter_by(
                seccion_curso_id=seccion.id, dia=dia,
                hora_inicio=inicio, hora_fin=fin
            ).first()
            if existe:
                if not existe.aula:
                    existe.aula = aula
                    existe.estado = "Activo"
            else:
                horario = SeccionHorario(
                    seccion_curso_id=seccion.id,
                    dia=dia,
                    hora_inicio=inicio,
                    hora_fin=fin,
                    aula=aula,
                    estado="Activo",
                )
                db.session.add(horario)
                horarios_creados += 1

    db.session.commit()
    total = SeccionHorario.query.count()
    print(f"Horarios de seccion creados: {total} ({horarios_creados} nuevos)")
