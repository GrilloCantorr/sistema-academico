from app import db
from app.modelos.docente import Docente
from app.modelos.seccion_curso import SeccionCurso
from app.modelos.seccion_docente import SeccionDocente
from app.modelos.tipo_docente import TipoDocente


def ejecutar():
    secciones = SeccionCurso.query.all()
    docentes = Docente.query.all()
    tipo_docente = TipoDocente.query.first()

    if not secciones or not docentes:
        print("No hay datos suficientes para asignar docente a seccion de curso")
        return

    creadas = 0
    for i, seccion in enumerate(secciones):
        for j, docente in enumerate(docentes):
            if (i + j) % len(docentes) == 0:
                existe = SeccionDocente.query.filter_by(
                    seccion_curso_id=seccion.id,
                    docente_id=docente.id,
                ).first()
                if not existe:
                    asignacion = SeccionDocente(
                        seccion_curso_id=seccion.id,
                        docente_id=docente.id,
                        tipo_docente_id=tipo_docente.id if tipo_docente else None,
                        horas_asignadas=4,
                    )
                    db.session.add(asignacion)
                    creadas += 1

    db.session.commit()
    total = SeccionDocente.query.count()
    print(f"Asignaciones de seccion a docentes creadas: {total} ({creadas} nuevas)")
