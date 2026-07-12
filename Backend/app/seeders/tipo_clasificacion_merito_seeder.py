from app import db
from app.modelos.tipo_clasificacion_merito import TipoClasificacionMerito


def ejecutar():
    if TipoClasificacionMerito.query.first():
        print("Tipos de clasificacion de merito ya existen")
        return

    tipos = [
        TipoClasificacionMerito(nombre="Bronce", porcentaje_limite=10.00),
        TipoClasificacionMerito(nombre="Plata", porcentaje_limite=25.00),
        TipoClasificacionMerito(nombre="Oro", porcentaje_limite=50.00),
    ]

    db.session.add_all(tipos)
    db.session.commit()

    print("Tipos de clasificacion de merito creados")