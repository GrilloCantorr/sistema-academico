from flask import Blueprint
from app.modulos.periodos_academicos import controllers
from app.utils.middlewares import rol_requerido

periodos_academicos_bp = Blueprint("periodos_academicos", __name__)


@periodos_academicos_bp.route("/", methods=["GET"])
def listar_periodos():
    return controllers.listar_periodos()


@periodos_academicos_bp.route("/<int:id>", methods=["GET"])
def obtener_periodo(id):
    return controllers.obtener_periodo(id)


@periodos_academicos_bp.route("/", methods=["POST"])
@rol_requerido("administrador")
def crear_periodo():
    return controllers.crear_periodo()


@periodos_academicos_bp.route("/<int:id>", methods=["PUT"])
@rol_requerido("administrador")
def actualizar_periodo(id):
    return controllers.actualizar_periodo(id)
