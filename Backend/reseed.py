from sqlalchemy import text
from app import crear_app, db
from app.seeders import ejecutar_todos

app = crear_app()

with app.app_context():
    es_mysql = db.engine.dialect.name == "mysql"

    if es_mysql:
        with db.engine.connect() as conexion:
            conexion.execute(text("SET FOREIGN_KEY_CHECKS=0"))
            conexion.commit()

    db.drop_all()
    db.create_all()

    if es_mysql:
        with db.engine.connect() as conexion:
            conexion.execute(text("SET FOREIGN_KEY_CHECKS=1"))
            conexion.commit()

    print("Base de datos recreada exitosamente.")
    ejecutar_todos()
    print("Listo: Base de datos cargada con todos los datos de prueba necesarios.")
