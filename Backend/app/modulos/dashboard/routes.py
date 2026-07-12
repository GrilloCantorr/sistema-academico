from flask import Blueprint
from app.modulos.dashboard import controllers

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/", methods=["GET"])
def obtener_dashboard():
    return controllers.obtener_dashboard()
