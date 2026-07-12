import { useEffect, useState, useCallback } from "react";
import { listarAuditorias, reportesEstrategicos } from "../servicios/administracion.servicio";

const LIMPIAR_FILTROS = { accion: "", entidad: "", fecha_desde: "", fecha_hasta: "" };

export default function AdministracionAuditorias() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [paginas, setPaginas] = useState(1);
  const [filtros, setFiltros] = useState(LIMPIAR_FILTROS);
  const [opcionesFiltro, setOpcionesFiltro] = useState({ acciones: [], entidades: [] });
  const [reportes, setReportes] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async (pag = 1) => {
    setCargando(true); setError(null);
    const params = new URLSearchParams();
    params.set("page", pag);
    if (filtros.accion) params.set("accion", filtros.accion);
    if (filtros.entidad) params.set("entidad", filtros.entidad);
    if (filtros.fecha_desde) params.set("fecha_desde", filtros.fecha_desde);
    if (filtros.fecha_hasta) params.set("fecha_hasta", filtros.fecha_hasta);
    const [resAud, resRep] = await Promise.all([listarAuditorias(params.toString()), reportesEstrategicos()]);
    setCargando(false);
    if (resAud.error) { setError(resAud.error); return; }
    setItems(resAud.data.items || []);
    setTotal(resAud.data.total || 0);
    setPagina(resAud.data.page || 1);
    setPaginas(resAud.data.pages || 1);
    if (resAud.data.filtros) setOpcionesFiltro(resAud.data.filtros);
    if (!resRep.error) setReportes(resRep.data);
  }, [filtros]);

  useEffect(() => { cargar(1); }, [cargar]);

  const manejarExportar = async () => {
    try {
      const token = localStorage.getItem("token");
      const respuesta = await fetch("http://127.0.0.1:5000/api/administracion/auditorias/exportar", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!respuesta.ok) throw new Error("Error al descargar");
      const blob = await respuesta.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "reporte_auditoria.txt";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      alert("No se pudo exportar el reporte.");
    }
  };

  function cambiarFiltro(campo, valor) { setFiltros((p) => ({ ...p, [campo]: valor })); }
  function limpiarFiltros() { setFiltros(LIMPIAR_FILTROS); }

  const traducirAccion = (accion) => {
    const mapa = {
      creacion_usuario: "Creacion", desactivacion_usuario: "Desactivacion",
      activacion_usuario: "Activacion", cambio_password: "Cambio password", cambio_de_rol: "Cambio de rol",
    };
    return mapa[accion] || accion;
  };

  const formatearFecha = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("es-PE", { timeZone: "UTC" });
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Auditorias y reportes estrategicos</h2>
          <p className="text-sm text-gray-500 mt-1">Consulta los eventos de administracion y el resumen institucional.</p>
        </div>
        <button 
          onClick={manejarExportar}
          className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          Exportar Logs (.txt)
        </button>
      </div>

      {error && <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

      {reportes && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen estrategico</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">{reportes.poblacion.total_estudiantes}</div>
              <div className="text-xs text-gray-500 mt-1">Estudiantes</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">{reportes.poblacion.total_docentes}</div>
              <div className="text-xs text-gray-500 mt-1">Docentes</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">{reportes.matricula.total_solicitudes}</div>
              <div className="text-xs text-gray-500 mt-1">Matriculas</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">{reportes.matricula.confirmadas}</div>
              <div className="text-xs text-gray-500 mt-1">Confirmadas</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">{reportes.academico.promedio_institucional ?? "—"}</div>
              <div className="text-xs text-gray-500 mt-1">Promedio institucional</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">{reportes.certificados.emitidos}</div>
              <div className="text-xs text-gray-500 mt-1">Cert. emitidos</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">{reportes.certificados.pendientes}</div>
              <div className="text-xs text-gray-500 mt-1">Cert. pendientes</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Auditorias {!cargando && <span className="font-normal text-sm text-gray-500">({total} registros)</span>}</h3>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
            <div>
              <label>Accion</label>
              <select value={filtros.accion} onChange={(e) => cambiarFiltro("accion", e.target.value)}>
                <option value="">Todas</option>
                {(opcionesFiltro.acciones || []).map((a) => (<option key={a} value={a}>{traducirAccion(a)}</option>))}
              </select>
            </div>
            <div>
              <label>Entidad</label>
              <select value={filtros.entidad} onChange={(e) => cambiarFiltro("entidad", e.target.value)}>
                <option value="">Todas</option>
                {(opcionesFiltro.entidades || []).map((e) => (<option key={e} value={e}>{e}</option>))}
              </select>
            </div>
            <div>
              <label>Desde</label>
              <input type="date" value={filtros.fecha_desde} onChange={(e) => cambiarFiltro("fecha_desde", e.target.value)} />
            </div>
            <div>
              <label>Hasta</label>
              <input type="date" value={filtros.fecha_hasta} onChange={(e) => cambiarFiltro("fecha_hasta", e.target.value)} />
            </div>
            <div>
              <button onClick={limpiarFiltros}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {cargando && <p className="text-sm text-gray-500 p-4">Cargando auditorias...</p>}

        {!cargando && items.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-8">No se encontraron registros de auditoria con los filtros seleccionados.</p>
        )}

        {!cargando && items.length > 0 && (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">ID</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Usuario</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Accion</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Entidad</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Detalle</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900 font-medium">{a.id}</td>
                    <td className="px-4 py-3">
                      <span className="text-gray-900">{a.usuario_username}</span>
                      <span className="text-xs text-gray-400 block">ID: {a.usuario_id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">{traducirAccion(a.accion)}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{a.entidad ? `${a.entidad}#${a.entidad_id}` : "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{a.detalle}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatearFecha(a.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {paginas > 1 && (
              <div className="flex items-center justify-center gap-3 py-4 border-t border-gray-200">
                <button onClick={() => cargar(pagina - 1)} disabled={pagina <= 1}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer">
                  Anterior
                </button>
                <span className="text-xs text-gray-500">Pagina {pagina} de {paginas}</span>
                <button onClick={() => cargar(pagina + 1)} disabled={pagina >= paginas}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer">
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
