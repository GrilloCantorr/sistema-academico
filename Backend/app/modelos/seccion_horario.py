from app import db


class SeccionHorario(db.Model):
    __tablename__ = "seccion_horarios"

    id = db.Column(db.Integer, primary_key=True)
    seccion_curso_id = db.Column(db.Integer, db.ForeignKey("secciones_curso.id"))
    dia = db.Column(db.Integer)
    hora_inicio = db.Column(db.Time)
    hora_fin = db.Column(db.Time)
    aula = db.Column(db.String(100))
    estado = db.Column(db.String(20), default="Activo")

    seccion_curso = db.relationship("SeccionCurso", backref="horarios")
