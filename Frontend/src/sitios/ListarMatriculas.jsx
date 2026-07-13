import { useState, useEffect } from "react";
import { 
  listarMatriculas, 
  listarEstadosMatricula, 
  validarRequisitos, 
  registrarPago, 
  generarFichaOficial 
} from "../servicios/matricula.servicio";

export default function ListarMatriculas() {
  const [matriculas, setMatriculas] = useState([]);
  const [estados, setEstados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [matriculaSeleccionada, setMatriculaSeleccionada] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => { cargarDatos(); }, []);

  async function cargarDatos() {
    setCargando(true);
    const [res, resEst] = await Promise.all([listarMatriculas(), listarEstadosMatricula()]);
    const lista = res.data?.matriculas || res.data || [];
    setMatriculas(lista);
    if (!resEst.error) setEstados(resEst.data || []);
    if (res.error) setError(res.error);
    setCargando(false);

    if (lista.length > 0) {
      setMatriculaSeleccionada((prev) => {
        if (prev) {
          const actual = lista.find(x => x.id === prev.id);
          return actual || lista[0];
        }
        return lista[0];
      });
    }
  }

  function nombreEstado(id) {
    return estados.find((e) => e.id === id || e.estado_id === id)?.nombre || `Estado ${id}`;
  }

  async function manejarValidar(id) {
    setMensaje(null); setError(null);
    const { error } = await validarRequisitos(id);
    if (error) { setError(error); return; }
    setMensaje("Matrícula validada correctamente.");
    await cargarDatos();
  }

  async function manejarPago(id) {
    setMensaje(null); setError(null);
    const { error } = await registrarPago(id);
    if (error) { setError(error); return; }
    setMensaje("Pago de matrícula registrado correctamente.");
    await cargarDatos();
  }

  async function manejarFicha(id) {
    setMensaje(null); setError(null);
    const { error } = await generarFichaOficial(id);
    if (error) { setError(error); return; }
    setMensaje("Ficha de matrícula oficial generada y aprobada.");
    await cargarDatos();
  }

  const filtradas = matriculas.filter((m) =>
    (m.estudiante_nombre || m.estudiante || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Control de Matrículas</h2>
        <p className="text-base text-gray-500 mt-1">Revisión de requisitos, validación de pagos y emisión de fichas oficiales de matrícula.</p>
      </div>

      {mensaje && <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{mensaje}</div>}
      {error && <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Columna Izquierda: Solicitudes de Matrícula */}
        <div className="w-full lg:w-5/12 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50/50">
            <input 
              type="text" 
              placeholder="Buscar estudiante..." 
              value={busqueda} 
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-white text-sm"
            />
          </div>

          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {cargando ? (
              <p className="text-sm text-gray-500 p-8 text-center">Cargando solicitudes...</p>
            ) : filtradas.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-12">No hay matrículas encontradas.</p>
            ) : (
              filtradas.map((m) => (
                <div 
                  key={m.id} 
                  onClick={() => setMatriculaSeleccionada(m)}
                  className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                    matriculaSeleccionada?.id === m.id 
                      ? "bg-primary-light/40 border-l-4 border-primary font-medium" 
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div>
                    <h4 className="text-base font-bold text-gray-900">{m.estudiante_nombre || m.estudiante}</h4>
                    <p className="text-xs text-gray-500">Semestre: {m.semestre_codigo || m.semestre?.codigo || "—"}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-blue-50 text-blue-700 border-blue-150">
                      {nombreEstado(m.estado_id || m.estado?.id)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Columna Derecha: Detalle de Matrícula Seleccionada */}
        <div className="w-full lg:w-7/12">
          {matriculaSeleccionada ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
              <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-6">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center font-extrabold text-xl text-primary uppercase">
                  {(matriculaSeleccionada.estudiante_nombre || "M").substring(0, 2)}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">{matriculaSeleccionada.estudiante_nombre || matriculaSeleccionada.estudiante}</h3>
                  <p className="text-sm font-medium text-gray-500">ID Solicitud de Matrícula: {matriculaSeleccionada.id}</p>
                </div>
              </div>

              {/* Ficha de Información */}
              <div className="mb-8">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Información de la Matrícula</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-gray-200">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Periodo Académico</span>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      {matriculaSeleccionada.periodo_nombre || matriculaSeleccionada.periodo?.nombre || "—"}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-gray-200">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Semestre de Ingreso</span>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      {matriculaSeleccionada.semestre_codigo || matriculaSeleccionada.semestre?.codigo || "—"}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-gray-200">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Estado Administrativo</span>
                    <p className="text-base font-bold text-primary mt-1">
                      {nombreEstado(matriculaSeleccionada.estado_id || matriculaSeleccionada.estado?.id)}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-gray-200">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Derecho de Pago</span>
                    <p className={`text-base font-bold mt-1 ${matriculaSeleccionada.pagado ? "text-green-600" : "text-red-600"}`}>
                      {matriculaSeleccionada.pagado ? "Cancelado" : "Pendiente de Pago"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botones de Control Académico y Pago */}
              <div className="border-t border-gray-100 pt-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Acciones de Verificación</h4>
                <div className="flex flex-col gap-3">
                  {(matriculaSeleccionada.estado_id === 1 || matriculaSeleccionada.estado?.id === 1) && (
                    <button 
                      onClick={() => manejarValidar(matriculaSeleccionada.id)}
                      className="w-full px-5 py-3 bg-primary text-white text-base font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm cursor-pointer text-center"
                    >
                      Validar Requisitos Académicos y Aprobar Matrícula
                    </button>
                  )}

                  {(matriculaSeleccionada.estado_id === 2 || matriculaSeleccionada.estado?.id === 2) && !matriculaSeleccionada.pagado && (
                    <button 
                      onClick={() => manejarPago(matriculaSeleccionada.id)}
                      className="w-full px-5 py-3 bg-green-600 text-white text-base font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm cursor-pointer text-center"
                    >
                      Registrar y Confirmar Recibo de Pago
                    </button>
                  )}

                  {matriculaSeleccionada.pagado && matriculaSeleccionada.estado_id !== 3 && matriculaSeleccionada.estado?.id !== 3 && (
                    <button 
                      onClick={() => manejarFicha(matriculaSeleccionada.id)}
                      className="w-full px-5 py-3 bg-primary text-white text-base font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm cursor-pointer text-center"
                    >
                      Generar Ficha Oficial de Matrícula (Completar Proceso)
                    </button>
                  )}

                  {(matriculaSeleccionada.estado_id === 3 || matriculaSeleccionada.estado?.id === 3) && (
                    <div className="w-full p-4 text-center rounded-xl bg-green-50 border border-green-200 text-green-700 font-bold text-base">
                      Matrícula Completada y Documento Emitido Exitosamente
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
              <p className="text-gray-500 font-medium">Seleccione una matrícula de la lista de la izquierda para ver su panel de control.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
