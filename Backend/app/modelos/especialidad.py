from app import db


class Especialidad(db.Model):
    __tablename__ = "especialidades"

    id = db.Column(db.Integer, primary_key=True)
    facultad_id = db.Column(db.Integer, db.ForeignKey("facultades.id"))
    nombre = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime)
    modified_at = db.Column(db.DateTime)
    deleted_at = db.Column(db.DateTime)

    facultad = db.relationship("Facultad", backref="especialidades")