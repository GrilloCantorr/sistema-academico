from app import db
from app.modelos.seccion_curso import SeccionCurso


class SeccionCursoService:

    @staticmethod
    def crear_seccion(data):
        periodo_academico_id = data.get("periodo_academico_id")
        curso_id = data.get("curso_id")
        semestre_id = data.get("semestre_id")
        cupos = data.get("cupos", 40)

        if not all([periodo_academico_id, curso_id, semestre_id]):
            return None, "Faltan campos requeridos"

        existe = SeccionCurso.query.filter_by(
            periodo_academico_id=periodo_academico_id,
            curso_id=curso_id,
            semestre_id=semestre_id,
        ).first()
        if existe:
            return None, "Ya existe una seccion para ese curso en el mismo periodo y semestre"

        seccion = SeccionCurso(
            periodo_academico_id=periodo_academico_id,
            curso_id=curso_id,
            semestre_id=semestre_id,
            cupos=cupos,
        )
        db.session.add(seccion)
        db.session.commit()
        return {"mensaje": "Seccion creada", "seccion_id": seccion.id}, None

    @staticmethod
    def actualizar_seccion(id, data):
        seccion = db.session.get(SeccionCurso, id)
        if not seccion:
            return None, "Seccion no encontrada"

        for campo in ["periodo_academico_id", "curso_id", "semestre_id", "cupos"]:
            if campo in data:
                setattr(seccion, campo, data[campo])

        db.session.commit()
        return {"mensaje": "Seccion actualizada"}, None
