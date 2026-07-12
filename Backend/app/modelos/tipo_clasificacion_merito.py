from app import db


class TipoClasificacionMerito(db.Model):
    __tablename__ = "tipos_clasificaciones_merito"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)
    porcentaje_limite = db.Column(db.Numeric(5, 2), nullable=False)