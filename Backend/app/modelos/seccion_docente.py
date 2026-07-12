from app import db


class SeccionDocente(db.Model):
    __tablename__ = "seccion_docentes"

    id = db.Column(db.Integer, primary_key=True)
    seccion_curso_id = db.Column(db.Integer, db.ForeignKey("secciones_curso.id"))
    docente_id = db.Column(db.Integer, db.ForeignKey("docentes.id"))
    tipo_docente_id = db.Column(db.Integer, db.ForeignKey("tipos_docentes.id"))
    horas_asignadas = db.Column(db.SmallInteger)

    seccion_curso = db.relationship("SeccionCurso", backref="docentes_asignados")
    docente = db.relationship("Docente", backref="secciones_asignadas")
    tipo_docente = db.relationship("TipoDocente", backref="asignaciones")
