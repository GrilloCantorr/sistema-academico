from flask import Blueprint
from app.modulos.cursos_docentes import controllers
from app.utils.middlewares import rol_requerido

cursos_docentes_bp = Blueprint('cursos_docentes', __name__)


@cursos_docentes_bp.route('/', methods=['GET'])
def listar_cursos():
    return controllers.listar_cursos()


@cursos_docentes_bp.route('/<int:id>', methods=['GET'])
def obtener_curso(id):
    return controllers.obtener_curso(id)


@cursos_docentes_bp.route('/cursos', methods=['POST'])
@rol_requerido("administrador")
def crear_curso():
    return controllers.crear_curso()


@cursos_docentes_bp.route('/secciones', methods=['POST'])
@rol_requerido("administrador")
def crear_seccion_curso():
    return controllers.crear_seccion_curso()


@cursos_docentes_bp.route('/secciones/<int:seccion_curso_id>/asignaciones', methods=['GET'])
@rol_requerido("administrador")
def asignaciones_seccion(seccion_curso_id):
    return controllers.asignaciones_seccion(seccion_curso_id)


@cursos_docentes_bp.route('/prerequisitos', methods=['GET'])
def listar_prerequisitos():
    return controllers.listar_prerequisitos()


@cursos_docentes_bp.route('/docentes', methods=['GET'])
def listar_docentes():
    return controllers.listar_docentes()


@cursos_docentes_bp.route('/tipos-docentes', methods=['GET'])
def listar_tipos_docentes():
    return controllers.listar_tipos_docentes()


@cursos_docentes_bp.route('/mis-cursos', methods=['GET'])
@rol_requerido("docente")
def mis_cursos_asignados():
    return controllers.mis_cursos_asignados()


@cursos_docentes_bp.route('/carga-academica/periodos-historicos', methods=['GET'])
@rol_requerido("docente")
def periodos_historicos_docente():
    return controllers.periodos_historicos_docente()


@cursos_docentes_bp.route('/secciones/<int:seccion_curso_id>/asignar-docente', methods=['POST'])
@rol_requerido("administrador")
def asignar_docente(seccion_curso_id):
    return controllers.asignar_docente(seccion_curso_id)


@cursos_docentes_bp.route('/secciones/<int:seccion_curso_id>/horario', methods=['POST'])
@rol_requerido("administrador")
def gestionar_horario(seccion_curso_id):
    return controllers.gestionar_horario(seccion_curso_id)


@cursos_docentes_bp.route('/asignaciones-secciones', methods=['GET'])
@rol_requerido("administrador")
def listar_asignaciones_secciones():
    return controllers.listar_asignaciones_secciones()


@cursos_docentes_bp.route('/carga-docente', methods=['GET'])
@rol_requerido("direccion")
def carga_docente():
    return controllers.carga_docente()


@cursos_docentes_bp.route('/secciones/<int:seccion_curso_id>/silabo', methods=['POST'])
@rol_requerido("docente")
def cargar_silabo(seccion_curso_id):
    return controllers.cargar_silabo(seccion_curso_id)


@cursos_docentes_bp.route('/secciones/<int:seccion_curso_id>/silabo', methods=['GET'])
def descargar_silabo(seccion_curso_id):
    return controllers.descargar_silabo(seccion_curso_id)


@cursos_docentes_bp.route('/auditoria/cumplimiento-silabos', methods=['GET'])
@rol_requerido("direccion")
def cumplimiento_silabos():
    return controllers.cumplimiento_silabos()


@cursos_docentes_bp.route('/cumplimiento-plan-estudios', methods=['GET'])
@rol_requerido("direccion")
def evaluar_cumplimiento_plan():
    return controllers.evaluar_cumplimiento_plan()
