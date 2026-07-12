from flask import Blueprint
from app.modulos.secciones_curso import controllers
from app.utils.middlewares import rol_requerido

secciones_curso_bp = Blueprint("secciones_curso", __name__)


@secciones_curso_bp.route("/", methods=["GET"])
def listar_secciones():
    return controllers.listar_secciones()


@secciones_curso_bp.route("/<int:id>", methods=["GET"])
def obtener_seccion(id):
    return controllers.obtener_seccion(id)


@secciones_curso_bp.route("/", methods=["POST"])
@rol_requerido("administrador")
def crear_seccion():
    return controllers.crear_seccion()


@secciones_curso_bp.route("/<int:id>", methods=["PUT"])
@rol_requerido("administrador")
def actualizar_seccion(id):
    return controllers.actualizar_seccion(id)
