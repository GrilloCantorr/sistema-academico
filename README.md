# Sistema Académico Integral - Plataforma Web de Gestión Educativa

Esta plataforma es un sistema integral y modular diseñado para digitalizar y optimizar los procesos administrativos, académicos e institucionales en facultades universitarias. La aplicación está construida sobre una arquitectura desacoplada (Frontend/Backend) utilizando React en la interfaz y Python Flask en los servicios del servidor.

---

## Arquitectura y Tecnologías

El sistema se compone de dos módulos independientes:

*   **Frontend (React + Vite):** Interfaz de usuario dinámica y responsiva, estructurada como una Single Page Application (SPA). Utiliza Tailwind CSS para la gestión de estilos con un enfoque corporativo e institucional. Las vistas están completamente protegidas mediante enrutamiento privado basado en roles de usuario.
*   **Backend (Python Flask):** Servicio REST API robusto encargado del procesamiento de la lógica de negocio, transacciones seguras y control de accesos. Emplea Flask-SQLAlchemy como ORM y Flask-JWT-Extended para la autenticación sin estado mediante tokens firmados.
*   **Base de Datos:** Compatible con SQLite (configurado por defecto para entornos de desarrollo y pruebas) o sistemas como MySQL/PostgreSQL mediante variables de entorno.

---

## Módulos Principales del Sistema

1.  **Módulo de Administración y Seguridad:** Acceso restringido por credenciales encriptadas y control de accesos por roles (RBAC). Permite la definición estricta de perfiles (Administrador, Dirección, Docente, Estudiante) y el rastreo inalterable de auditorías.
2.  **Módulo de Matrícula:** Gestión integral desde la solicitud en línea del estudiante (con validación de prerrequisitos) hasta la aprobación, verificación financiera y emisión de la ficha de matrícula oficial.
3.  **Módulo de Cursos y Docentes:** Organización y asignación de carga académica, vinculación de docentes a secciones, gestión de horarios de clase y administración centralizada de sílabos.
4.  **Módulo de Notas y Récord Académico:** Registro asíncrono de calificaciones parciales y finales. Automatiza la consolidación del historial académico, kardex de estudiantes y generación de reportes e indicadores de rendimiento.
5.  **Módulo de Certificados y Trámites:** Flujo digitalizado para la solicitud, autorización y expedición de documentos oficiales en formato PDF, incorporando mecanismos de validación modernos (Firma digital/Código QR).

---

## Guía de Instalación y Despliegue

### Requisitos Mínimos
*   Python 3.10 o superior.
*   Node.js 18.0 o superior.
*   Gestor de base de datos relacional (SQLite incluido por defecto).

---

### Paso 1: Configurar el Servidor (Backend)

1.  Acceda a la carpeta principal del backend:
    ```bash
    cd Backend
    ```
2.  Cree e inicialice el entorno virtual de Python:
    ```bash
    python -m venv venv
    
    # En Windows:
    .\venv\Scripts\Activate.ps1
    # En macOS/Linux:
    source venv/bin/activate
    ```
3.  Instale todas las dependencias requeridas del proyecto:
    ```bash
    pip install -r requirements.txt
    ```
4.  Opcional: Recree la base de datos y siembre los datos de prueba institucionales:
    ```bash
    python reseed.py
    ```
5.  Inicie el servidor web de Flask:
    ```bash
    python run.py
    ```
    *El Backend permanecerá a la escucha de peticiones HTTP en `http://127.0.0.1:5000`.*

---

### Paso 2: Configurar la Interfaz (Frontend)

1.  Abra una segunda ventana de terminal y diríjase al entorno de la interfaz:
    ```bash
    cd Frontend
    ```
2.  Descargue e instale los paquetes de Node:
    ```bash
    npm install
    ```
3.  Inicie el servidor de desarrollo local:
    ```bash
    npm run dev
    ```
    *La plataforma estará disponible para su acceso en el navegador mediante `http://localhost:5173`.*

---

## Credenciales de Acceso (Entorno de Pruebas)

Puede utilizar cualquiera de las siguientes cuentas pre-sembradas para evaluar los distintos niveles de privilegios.
*(Contraseña predeterminada para todos los usuarios: `password123`)*

| Perfil de Rol | Usuario (Ejemplo) | Funciones Disponibles en la Demostración |
| :--- | :--- | :--- |
| **Administrador** | `admin` | Validar matrículas, gestionar carga docente, emitir certificados oficiales y configurar usuarios. |
| **Dirección** | `direccion` | Evaluar indicadores de rendimiento académico, auditar registros de seguridad y visualizar estadísticas globales. |
| **Docente** | `juan.perez` | Registrar calificaciones por sección, adjuntar sílabos y revisar listado de alumnos. |
| **Estudiante** | `20240001` | Solicitar matrícula en línea, consultar récord académico histórico y emitir constancias. |

---

## Solución de Problemas Comunes

*   **Error de permisos en PowerShell (Windows):** Si experimenta errores al intentar activar el entorno virtual (`venv`), ejecute su terminal como Administrador y aplique la siguiente política de ejecución:
    ```powershell
    Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
    ```
*   **Conflictos de Puerto (EADDRINUSE):** Si los puertos `5000` (Backend) o `5173` (Frontend) ya se encuentran ocupados por otro servicio en su sistema, deberá detener dicho servicio o modificar los puertos directamente en `Backend/run.py` o `Frontend/vite.config.js`.

---

## 📁 Archivos Entregables y Documentación

Toda la documentación formal, guías de sustentación, diagramas arquitectónicos y archivos solicitados para la Evaluación Final se encuentran debidamente organizados dentro de la carpeta **`Documentos/`** en la raíz de este repositorio.

Allí encontrará:
*   `Documentacion_Funcionalidades.pdf`
*   `Sistema_Academico_Huaynate Coriñaupa.pptx`
*   `Modelado_Base_Datos.pdf`
*   `Historias_Usuario_Sistema_Academico.xlsx`
*   `EvalFinal (1).pdf`
