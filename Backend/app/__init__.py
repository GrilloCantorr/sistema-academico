from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt

from app.config import Config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
bcrypt = Bcrypt()


def crear_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)

    from app.modulos.auth.routes import auth_bp
    from app.modulos.matricula.routes import matricula_bp
    from app.modulos.notas.routes import notas_bp
    from app.modulos.cursos_docentes.routes import cursos_docentes_bp
    from app.modulos.administracion.routes import administracion_bp, admin_bp
    from app.modulos.certificados.routes import certificados_bp
    from app.modulos.record_academico.routes import record_academico_bp
    from app.modulos.dashboard.routes import dashboard_bp
    from app.modulos.docentes.routes import docentes_bp
    from app.modulos.cursos.routes import cursos_bp
    from app.modulos.secciones_curso.routes import secciones_curso_bp
    from app.modulos.periodos_academicos.routes import periodos_academicos_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(matricula_bp, url_prefix='/api/matriculas')
    app.register_blueprint(notas_bp, url_prefix='/api/notas')
    app.register_blueprint(cursos_docentes_bp, url_prefix='/api/cursos-docentes')
    app.register_blueprint(administracion_bp, url_prefix='/api/administracion')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(certificados_bp, url_prefix='/api/certificados')
    app.register_blueprint(record_academico_bp, url_prefix='/api/record-academico')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(docentes_bp, url_prefix='/api/docentes')
    app.register_blueprint(cursos_bp, url_prefix='/api/cursos')
    app.register_blueprint(secciones_curso_bp, url_prefix='/api/secciones-curso')
    app.register_blueprint(periodos_academicos_bp, url_prefix='/api/periodos-academicos')

    return app