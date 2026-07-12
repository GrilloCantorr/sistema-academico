from app import db, bcrypt
from app.modelos.usuario import Usuario


def ejecutar():
    MIN_DOCENTES = 5
    MIN_ESTUDIANTES = 5

    docentes_existentes = Usuario.query.filter_by(rol="docente").count()
    if docentes_existentes < MIN_DOCENTES:
        nuevos = []
        for i in range(docentes_existentes + 1, MIN_DOCENTES + 1):
            nuevos.append(Usuario(
                username=f"docente{i}_prueba",
                password=bcrypt.generate_password_hash("123456").decode("utf-8"),
                rol="docente",
            ))
        db.session.add_all(nuevos)
        print(f"Usuarios docentes creados: {len(nuevos)}")

    estudiantes_existentes = Usuario.query.filter_by(rol="estudiante").count()
    if estudiantes_existentes < MIN_ESTUDIANTES:
        nuevos = []
        for i in range(estudiantes_existentes + 1, MIN_ESTUDIANTES + 1):
            nuevos.append(Usuario(
                username=f"estudiante{i}_prueba",
                password=bcrypt.generate_password_hash("123456").decode("utf-8"),
                rol="estudiante",
            ))
        db.session.add_all(nuevos)
        print(f"Usuarios estudiantes creados: {len(nuevos)}")

    db.session.commit()

    admin_count = Usuario.query.filter_by(rol="administrador").count()
    if admin_count == 0:
        db.session.add(Usuario(
            username="admin_prueba",
            password=bcrypt.generate_password_hash("123456").decode("utf-8"),
            rol="administrador",
        ))
        db.session.commit()
        print("Usuario admin creado")

    direccion_count = Usuario.query.filter_by(rol="direccion").count()
    if direccion_count == 0:
        db.session.add(Usuario(
            username="direccion_prueba",
            password=bcrypt.generate_password_hash("123456").decode("utf-8"),
            rol="direccion",
        ))
        db.session.commit()
        print("Usuario direccion creado")

    print("Usuarios creados")
