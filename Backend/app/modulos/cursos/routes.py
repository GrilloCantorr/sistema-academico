from flask import Blueprint
from app.modulos.cursos import controllers
from app.utils.middlewares import rol_requerido

cursos_bp = Blueprint("cursos", __name__)


@cursos_bp.route("/", methods=["GET"])
def listar_cursos():
    return controllers.listar_cursos()


@cursos_bp.route("/<int:id>", methods=["GET"])
def obtener_curso(id):
    return controllers.obtener_curso(id)


@cursos_bp.route("/", methods=["POST"])
@rol_requerido("administrador")
def crear_curso():
    return controllers.crear_curso()


@cursos_bp.route("/<int:id>", methods=["PUT"])
@rol_requerido("administrador")
def actualizar_curso(id):
    return controllers.actualizar_curso(id)
