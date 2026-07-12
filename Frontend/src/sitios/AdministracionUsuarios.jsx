import { useEffect, useState } from "react";
import {
  cambiarRol, listarUsuarios, crearUsuario, toggleUsuario, cambiarPassword, listarEspecialidades,
} from "../servicios/administracion.servicio";

const ROLES = ["estudiante", "docente", "administrador", "direccion"];

const ESTADO_INICIAL_FORM = {
  username: "", password: "", rol: "estudiante", nombres: "", apellido_paterno: "",
  apellido_materno: "", correo_institucional: "", especialidad_id: "",
};

export default function AdministracionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [selecciones, setSelecciones] = useState({});
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [formulario, setFormulario] = useState(ESTADO_INICIAL_FORM);
  const [creando, setCreando] = useState(false);
  const [especialidades, setEspecialidades] = useState([]);
  const [modalPassword, setModalPassword] = useState(null);
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [cambiandoPass, setCambiandoPass] = useState(false);

  useEffect(() => {
    cargarUsuarios();
    listarEspecialidades().then(r => { if (r.data) setEspecialidades(r.data); });
  }, []);

  async function cargarUsuarios() {
    setCargando(true);
    const { data, error } = await listarUsuarios();
    setCargando(false);
    if (error) { setError(error); return; }
    setUsuarios(data);
    const inicial = {};
    data.forEach((u) => { inicial[u.id] = u.rol; });
    setSelecciones(inicial);
  }

  async function manejarCambio(usuarioId) {
    setMensaje(null); setError(null);
    const { data, error } = await cambiarRol(usuarioId, selecciones[usuarioId]);
    if (error) { setError(error); return; }
    setMensaje(data.mensaje);
    cargarUsuarios();
  }

  async function manejarToggle(usuarioId) {
    setMensaje(null); setError(null);
    const { data, error } = await toggleUsuario(usuarioId);
    if (error) { setError(error); return; }
    setMensaje(data.mensaje);
    cargarUsuarios();
  }

  function abrirModalPassword(usuario) { setModalPassword(usuario); setNuevaPassword(""); }

  async function manejarCambioPassword() {
    if (!nuevaPassword || nuevaPassword.length < 6) { setError("La contrasena debe tener al menos 6 caracteres"); return; }
    setCambiandoPass(true); setError(null);
    const { data, error } = await cambiarPassword(modalPassword.id, nuevaPassword);
    setCambiandoPass(false);
    if (error) { setError(error); return; }
    setMensaje(data.mensaje);
    setModalPassword(null); setNuevaPassword("");
  }

  async function manejarCrear(e) {
    e.preventDefault();
    setCreando(true); setError(null);
    const { data, error } = await crearUsuario(formulario);
    setCreando(false);
    if (error) { setError(error); return; }
    setMensaje(data.mensaje);
    setMostrarModal(false);
    setFormulario(ESTADO_INICIAL_FORM);
    cargarUsuarios();
  }

  function actualizarCampo(campo, valor) { setFormulario((prev) => ({ ...prev, [campo]: valor })); }

  const necesitaPerfil = formulario.rol === "estudiante" || formulario.rol === "docente";
  const filtrados = usuarios.filter((u) =>
    u.username.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.rol.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Usuarios y roles</h2>
          <p className="text-sm text-gray-500 mt-1">Administra el acceso del sistema por perfil de usuario.</p>
        </div>
        <button onClick={() => setMostrarModal(true)}
          className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors cursor-pointer">
          + Nuevo usuario
        </button>
      </div>

      {mensaje && <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{mensaje}</div>}
      {error && <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-200">
          <input type="text" placeholder="Buscar por usuario o rol..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>

        {cargando && <p className="text-sm text-gray-500 p-4">Cargando usuarios...</p>}

        {!cargando && filtrados.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-8">{busqueda ? "No se encontraron usuarios con ese criterio." : "No hay usuarios registrados."}</p>
        )}

        {!cargando && filtrados.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">ID</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Usuario</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Estado</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Rol actual</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Cambiar rol</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtrados.map((usuario) => (
                <tr key={usuario.id} className={`hover:bg-gray-50 ${!usuario.activo ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3 text-gray-900 font-medium">{usuario.id}</td>
                  <td className="px-4 py-3">
                    <span className="text-gray-900">{usuario.username}</span>
                    {usuario.perfil && (
                      <span className="text-xs text-gray-400 block">{usuario.perfil.nombres} {usuario.perfil.apellido_paterno}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      usuario.activo ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
                    }`}>{usuario.activo ? "Activo" : "Inactivo"}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{usuario.rol}</td>
                  <td className="px-4 py-3">
                    <select value={selecciones[usuario.id] || usuario.rol}
                      onChange={(e) => setSelecciones((prev) => ({ ...prev, [usuario.id]: e.target.value }))}>
                      {ROLES.map((rol) => (<option key={rol} value={rol}>{rol}</option>))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      <button onClick={() => manejarCambio(usuario.id)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer">
                        Cambiar rol
                      </button>
                      <button onClick={() => manejarToggle(usuario.id)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                        {usuario.activo ? "Desactivar" : "Activar"}
                      </button>
                      <button onClick={() => abrirModalPassword(usuario)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                        Password
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setMostrarModal(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Nuevo usuario</h3>
            <form onSubmit={manejarCrear}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label>Usuario *</label>
                  <input type="text" required value={formulario.username} onChange={(e) => actualizarCampo("username", e.target.value)} />
                </div>
                <div>
                  <label>Contrasena *</label>
                  <input type="password" required minLength={6} value={formulario.password} onChange={(e) => actualizarCampo("password", e.target.value)} />
                </div>
              </div>
              <div className="mb-4">
                <label>Rol *</label>
                <select value={formulario.rol} onChange={(e) => actualizarCampo("rol", e.target.value)}>
                  {ROLES.map((rol) => (<option key={rol} value={rol}>{rol}</option>))}
                </select>
              </div>
              {necesitaPerfil && (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label>Nombres *</label>
                      <input type="text" required value={formulario.nombres} onChange={(e) => actualizarCampo("nombres", e.target.value)} />
                    </div>
                    <div>
                      <label>Apellido paterno *</label>
                      <input type="text" required value={formulario.apellido_paterno} onChange={(e) => actualizarCampo("apellido_paterno", e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label>Apellido materno *</label>
                      <input type="text" required value={formulario.apellido_materno} onChange={(e) => actualizarCampo("apellido_materno", e.target.value)} />
                    </div>
                    <div>
                      <label>Correo institucional *</label>
                      <input type="email" required value={formulario.correo_institucional} onChange={(e) => actualizarCampo("correo_institucional", e.target.value)} />
                    </div>
                  </div>
                  {formulario.rol === "estudiante" && (
                    <div className="mb-4">
                      <label>Especialidad *</label>
                      <select required value={formulario.especialidad_id} onChange={(e) => actualizarCampo("especialidad_id", e.target.value)}>
                        <option value="">Seleccionar...</option>
                        {especialidades.map((esp) => (<option key={esp.id} value={esp.id}>{esp.nombre}</option>))}
                      </select>
                    </div>
                  )}
                </>
              )}
              <div className="flex gap-3 justify-end mt-6">
                <button type="button" onClick={() => setMostrarModal(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={creando}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary-hover disabled:bg-gray-300 disabled:text-gray-500 transition-colors cursor-pointer">
                  {creando ? "Creando..." : "Crear usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalPassword && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setModalPassword(null)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Cambiar contrasena</h3>
            <p className="text-sm text-gray-500 mb-4">Usuario: <strong>{modalPassword.username}</strong></p>
            <div className="mb-4">
              <label>Nueva contrasena</label>
              <input type="password" minLength={6} value={nuevaPassword} onChange={(e) => setNuevaPassword(e.target.value)} placeholder="Minimo 6 caracteres" />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setModalPassword(null)}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                Cancelar
              </button>
              <button onClick={manejarCambioPassword} disabled={cambiandoPass}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary-hover disabled:bg-gray-300 disabled:text-gray-500 transition-colors cursor-pointer">
                {cambiandoPass ? "Cambiando..." : "Cambiar contrasena"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
