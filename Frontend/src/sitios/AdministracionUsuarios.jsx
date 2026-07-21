import { useEffect, useState } from "react";
import {
  cambiarRol, listarUsuarios, crearUsuario, toggleUsuario, cambiarPassword, listarEspecialidades,
} from "../servicios/administracion.servicio";

const ROLES = ["estudiante", "docente", "administrador", "direccion"];

const ESTADO_INICIAL_FORM = {
  username: "", password: "", rol: "estudiante", nombres: "", apellido_paterno: "",
  apellido_materno: "", correo_institucional: "", especialidad_id: "", dni: "",
};

export default function AdministracionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [selecciones, setSelecciones] = useState({});
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
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
    if (data.length > 0) {
      setUsuarioSeleccionado((prev) => {
        if (prev) {
          const actual = data.find(x => x.id === prev.id);
          return actual || data[0];
        }
        return data[0];
      });
    }
  }

  async function manejarCambio(usuarioId) {
    setMensaje(null); setError(null);
    const { data, error } = await cambiarRol(usuarioId, selecciones[usuarioId]);
    if (error) { setError(error); return; }
    setMensaje(data.mensaje);
    await cargarUsuarios();
  }

  async function manejarToggle(usuarioId) {
    setMensaje(null); setError(null);
    const { data, error } = await toggleUsuario(usuarioId);
    if (error) { setError(error); return; }
    setMensaje(data.mensaje);
    await cargarUsuarios();
  }

  function abrirModalPassword(usuario) { setModalPassword(usuario); setNuevaPassword(""); }

  async function manejarCambioPassword() {
    if (!nuevaPassword || nuevaPassword.length < 6) { setError("La contraseña debe tener al menos 6 caracteres"); return; }
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
      <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Usuarios y Accesos</h2>
          <p className="text-base text-gray-500 mt-1">Control centralizado de cuentas de usuario, perfiles y seguridad de la plataforma.</p>
        </div>
        <button onClick={() => setMostrarModal(true)}
          className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors cursor-pointer shadow-sm">
          + Registrar Nuevo Usuario
        </button>
      </div>

      {mensaje && <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{mensaje}</div>}
      {error && <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Columna Izquierda: Listado de Usuarios */}
        <div className="w-full lg:w-5/12 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50/50">
            <input 
              type="text" 
              placeholder="Buscar por usuario o rol..." 
              value={busqueda} 
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-white text-sm"
            />
          </div>

          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {cargando ? (
              <p className="text-sm text-gray-500 p-8 text-center">Cargando cuentas de usuario...</p>
            ) : filtrados.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-12">No hay resultados para mostrar.</p>
            ) : (
              filtrados.map((u) => (
                <div 
                  key={u.id} 
                  onClick={() => setUsuarioSeleccionado(u)}
                  className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                    usuarioSeleccionado?.id === u.id 
                      ? "bg-primary-light/40 border-l-4 border-primary font-medium" 
                      : "hover:bg-gray-50"
                  } ${!u.activo ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700 uppercase">
                      {u.username.substring(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-gray-900">{u.username}</h4>
                      <p className="text-xs text-gray-500 capitalize">{u.rol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      u.activo ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
                    }`}>
                      {u.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Columna Derecha: Panel de Control del Usuario Seleccionado */}
        <div className="w-full lg:w-7/12">
          {usuarioSeleccionado ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
              <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center font-extrabold text-2xl text-primary uppercase">
                  {usuarioSeleccionado.username.substring(0, 2)}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">{usuarioSeleccionado.username}</h3>
                  <p className="text-sm font-medium text-gray-500">ID Usuario: {usuarioSeleccionado.id}</p>
                </div>
              </div>

              {/* Información de Perfil */}
              <div className="mb-8">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Información del Perfil</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-gray-200">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Nombres y Apellidos</span>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      {usuarioSeleccionado.perfil 
                        ? `${usuarioSeleccionado.perfil.nombres} ${usuarioSeleccionado.perfil.apellido_paterno} ${usuarioSeleccionado.perfil.apellido_materno || ""}` 
                        : "Sin registrar"}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-gray-200">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Correo Electrónico</span>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      {usuarioSeleccionado.perfil?.correo_institucional || "Sin registrar"}
                    </p>
                  </div>
                  {usuarioSeleccionado.rol === "estudiante" && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 sm:col-span-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Especialidad Académica</span>
                      <p className="text-base font-semibold text-gray-900 mt-1">
                        {usuarioSeleccionado.perfil?.especialidad_nombre || "Sin registrar"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Gestión de Roles y Estados */}
              <div className="mb-8 border-t border-gray-100 pt-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Roles y Permisos</h4>
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="w-full sm:w-2/3">
                    <label className="block mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Cambiar Rol del Usuario</label>
                    <select 
                      value={selecciones[usuarioSeleccionado.id] || usuarioSeleccionado.rol}
                      onChange={(e) => setSelecciones((prev) => ({ ...prev, [usuarioSeleccionado.id]: e.target.value }))}
                      className="bg-white border-gray-300 w-full font-medium"
                    >
                      {ROLES.map((rol) => (<option key={rol} value={rol}>{rol}</option>))}
                    </select>
                  </div>
                  <button 
                    onClick={() => manejarCambio(usuarioSeleccionado.id)}
                    className="w-full sm:w-1/3 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm cursor-pointer"
                  >
                    Guardar Rol
                  </button>
                </div>
              </div>

              {/* Acciones de Seguridad */}
              <div className="border-t border-gray-100 pt-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Seguridad y Estado de Cuenta</h4>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => manejarToggle(usuarioSeleccionado.id)}
                    className={`flex-1 px-5 py-2.5 text-sm font-semibold rounded-lg border transition-colors cursor-pointer text-center ${
                      usuarioSeleccionado.activo 
                        ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100" 
                        : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                    }`}
                  >
                    {usuarioSeleccionado.activo ? "Suspender Cuenta" : "Activar Cuenta"}
                  </button>
                  <button 
                    onClick={() => abrirModalPassword(usuarioSeleccionado)}
                    className="flex-1 px-5 py-2.5 text-sm font-semibold rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer text-center"
                  >
                    Restablecer Contraseña
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
              <p className="text-gray-500 font-medium">Seleccione un usuario de la lista de la izquierda para ver su panel de control.</p>
            </div>
          )}
        </div>
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
                  <label>Contraseña *</label>
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
                  <div className="mb-4">
                    <label>DNI *</label>
                    <input type="text" required pattern="[0-9]{8}" title="El DNI debe tener 8 dígitos numéricos" maxLength={8} value={formulario.dni} onChange={(e) => actualizarCampo("dni", e.target.value.replace(/\D/g, ""))} />
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
            <h3 className="text-lg font-bold text-gray-900 mb-2">Cambiar contraseña</h3>
            <p className="text-sm text-gray-500 mb-4">Usuario: <strong>{modalPassword.username}</strong></p>
            <div className="mb-4">
              <label>Nueva contraseña</label>
              <input type="password" minLength={6} value={nuevaPassword} onChange={(e) => setNuevaPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setModalPassword(null)}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                Cancelar
              </button>
              <button onClick={manejarCambioPassword} disabled={cambiandoPass}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary-hover disabled:bg-gray-300 disabled:text-gray-500 transition-colors cursor-pointer">
                {cambiandoPass ? "Cambiando..." : "Cambiar contraseña"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
