from app import db


class MatriculaDetalle(db.Model):
    __tablename__ = "matricula_detalle"

    matricula_id = db.Column(
        db.Integer, db.ForeignKey("matriculas.id"), primary_key=True
    )
    seccion_curso_id = db.Column(
        db.Integer, db.ForeignKey("secciones_curso.id"), primary_key=True
    )
    nota_parcial = db.Column(db.Numeric(4, 2))
    nota_parcial2 = db.Column(db.Numeric(4, 2))
    nota_practica = db.Column(db.Numeric(4, 2))
    nota_final = db.Column(db.Numeric(4, 2))
    estado_curso_id = db.Column(
        db.Integer, db.ForeignKey("estados_cursos.id"), nullable=False
    )

    matricula = db.relationship("Matricula", backref="detalle")
    seccion_curso = db.relationship("SeccionCurso", backref="matriculados")
    estado_curso = db.relationship("EstadoCurso", backref="detalles")
