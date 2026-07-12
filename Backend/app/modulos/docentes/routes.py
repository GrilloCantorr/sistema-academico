from flask import Blueprint
from app.modulos.docentes import controllers
from app.utils.middlewares import rol_requerido

docentes_bp = Blueprint("docentes", __name__)


@docentes_bp.route("/", methods=["GET"])
@rol_requerido("administrador", "direccion")
def listar_docentes():
    return controllers.listar_docentes()


@docentes_bp.route("/<int:id>", methods=["GET"])
@rol_requerido("administrador", "direccion")
def obtener_docente(id):
    return controllers.obtener_docente(id)


@docentes_bp.route("/", methods=["POST"])
@rol_requerido("administrador")
def crear_docente():
    return controllers.crear_docente()


@docentes_bp.route("/<int:id>", methods=["PUT"])
@rol_requerido("administrador")
def actualizar_docente(id):
    return controllers.actualizar_docente(id)
