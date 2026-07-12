from app import db
from app.modelos.curso import Curso


class CursoService:

    @staticmethod
    def crear_curso(data):
        nombre = data.get("nombre")
        codigo = data.get("codigo")
        creditos = data.get("creditos")
        horas_lectivas = data.get("horas_lectivas")
        horas_practicas = data.get("horas_practicas")

        if not all([nombre, codigo, creditos]):
            return None, "Faltan campos requeridos: nombre, codigo, creditos"

        if Curso.query.filter_by(codigo=codigo).first():
            return None, "Ya existe un curso con ese código"

        curso = Curso(
            nombre=nombre,
            codigo=codigo,
            creditos=creditos,
            horas_lectivas=horas_lectivas or 0,
            horas_practicas=horas_practicas or 0,
        )
        db.session.add(curso)
        db.session.commit()
        return {"mensaje": "Curso creado correctamente", "curso_id": curso.id}, None

    @staticmethod
    def actualizar_curso(id, data):
        curso = db.session.get(Curso, id)
        if not curso or curso.deleted_at is not None:
            return None, "Curso no encontrado"

        for campo in ["nombre", "codigo", "creditos", "horas_lectivas", "horas_practicas"]:
            if campo in data:
                setattr(curso, campo, data[campo])

        db.session.commit()
        return {"mensaje": "Curso actualizado correctamente"}, None
