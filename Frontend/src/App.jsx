import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./componentes/Layout";
import RutaProtegida from "./rutas/RutaProtegida";
import Login from "./sitios/Login";
import Inicio from "./sitios/Inicio";
import SolicitarMatricula from "./sitios/SolicitarMatricula";
import ListarMatriculas from "./sitios/ListarMatriculas";
import EstadisticasMatricula from "./sitios/EstadisticasMatricula";
import CursosMisCursos from "./sitios/CursosMisCursos";
import CursosAsignar from "./sitios/CursosAsignar";
import CursosCargaDocente from "./sitios/CursosCargaDocente";
import NotasMiHoja from "./sitios/NotasMiHoja";
import NotasRegistrar from "./sitios/NotasRegistrar";
import NotasGestion from "./sitios/NotasGestion";
import RecordMiHistorial from "./sitios/RecordMiHistorial";
import RecordReportes from "./sitios/RecordReportes";
import CertificadosSolicitar from "./sitios/CertificadosSolicitar";
import CertificadosListar from "./sitios/CertificadosListar";
import AdministracionUsuarios from "./sitios/AdministracionUsuarios";
import AdministracionAuditorias from "./sitios/AdministracionAuditorias";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<RutaProtegida><Inicio /></RutaProtegida>} />
        <Route path="/login" element={<Login />} />

        <Route path="/matricula/solicitar" element={<RutaProtegida rolesPermitidos={["estudiante"]}><SolicitarMatricula /></RutaProtegida>} />
        <Route path="/matricula/listar" element={<RutaProtegida rolesPermitidos={["administrador", "direccion"]}><ListarMatriculas /></RutaProtegida>} />
        <Route path="/matricula/estadisticas" element={<RutaProtegida rolesPermitidos={["direccion"]}><EstadisticasMatricula /></RutaProtegida>} />

        <Route path="/cursos-docentes/mis-cursos" element={<RutaProtegida rolesPermitidos={["docente"]}><CursosMisCursos /></RutaProtegida>} />
        <Route path="/cursos-docentes/asignar" element={<RutaProtegida rolesPermitidos={["administrador"]}><CursosAsignar /></RutaProtegida>} />
        <Route path="/cursos-docentes/carga-docente" element={<RutaProtegida rolesPermitidos={["direccion"]}><CursosCargaDocente /></RutaProtegida>} />

        <Route path="/notas/mi-hoja" element={<RutaProtegida rolesPermitidos={["estudiante"]}><NotasMiHoja /></RutaProtegida>} />
        <Route path="/notas/registrar" element={<RutaProtegida rolesPermitidos={["docente"]}><NotasRegistrar /></RutaProtegida>} />
        <Route path="/notas/gestionar" element={<RutaProtegida rolesPermitidos={["administrador", "direccion"]}><NotasGestion /></RutaProtegida>} />

        <Route path="/record-academico/mi-historial" element={<RutaProtegida rolesPermitidos={["estudiante"]}><RecordMiHistorial /></RutaProtegida>} />
        <Route path="/record-academico/reportes" element={<RutaProtegida rolesPermitidos={["administrador", "direccion"]}><RecordReportes /></RutaProtegida>} />

        <Route path="/certificados/solicitar" element={<RutaProtegida rolesPermitidos={["estudiante"]}><CertificadosSolicitar /></RutaProtegida>} />
        <Route path="/certificados/listar" element={<RutaProtegida rolesPermitidos={["administrador", "direccion"]}><CertificadosListar /></RutaProtegida>} />

        <Route path="/administracion/usuarios" element={<RutaProtegida rolesPermitidos={["administrador"]}><AdministracionUsuarios /></RutaProtegida>} />
        <Route path="/administracion/auditorias" element={<RutaProtegida rolesPermitidos={["direccion"]}><AdministracionAuditorias /></RutaProtegida>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
