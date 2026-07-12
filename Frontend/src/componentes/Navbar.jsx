import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { usuario, cerrarSesion, estaAutenticado } = useAuth();
  const navigate = useNavigate();

  if (!estaAutenticado) return null;

  function manejarCerrarSesion() {
    cerrarSesion();
    navigate("/login");
  }

  return (
    <nav className="flex items-center gap-4 px-8 py-3 bg-white border-b border-gray-200">
      <span className="text-sm text-gray-500 mr-auto">{usuario?.username} ({usuario?.rol})</span>
      <button
        onClick={manejarCerrarSesion}
        className="text-sm text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
      >
        Cerrar sesion
      </button>
    </nav>
  );
}
