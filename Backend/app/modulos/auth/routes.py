from flask import Blueprint
from app.modulos.auth import controllers
from app.utils.middlewares import rol_requerido

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login():
    return controllers.login()


@auth_bp.route("/registrar", methods=["POST"])
@rol_requerido("administrador")
def registrar():
    return controllers.registrar()