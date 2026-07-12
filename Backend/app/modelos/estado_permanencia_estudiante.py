from app import db


class EstadoPermanenciaEstudiante(db.Model):
    __tablename__ = "estados_permanencia_estudiante"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)
    descripcion = db.Column(db.String(250))