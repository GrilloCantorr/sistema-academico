from app import db


class HitoAcademico(db.Model):
    __tablename__ = "hitos_academicos"

    id = db.Column(db.Integer, primary_key=True)
    periodo_academico_id = db.Column(db.Integer, db.ForeignKey("periodos_academicos.id"), nullable=False)
    tipo_nota = db.Column(db.String(20), nullable=False)
    fecha_limite = db.Column(db.DateTime, nullable=False)

    periodo_academico = db.relationship("PeriodoAcademico", backref="hitos_academicos")