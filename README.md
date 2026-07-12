# Portal Académico Minerva - Plataforma Web de Gestión Educativa

Esta plataforma es un sistema integral y modular diseñado para digitalizar y optimizar los procesos administrativos, académicos e institucionales en facultades universitarias. La aplicación está construida sobre una arquitectura desacoplada (Frontend/Backend) utilizando React en la interfaz y Python Flask en los servicios del servidor.

---

## 🛠️ Arquitectura y Tecnologías

El sistema se compone de dos componentes independientes:

*   **Frontend (React + Vite):** Interface de usuario dinámica y responsiva. Utiliza Tailwind CSS v4 para la gestión de estilos y un enfoque temático corporativo basado en tonos azul cobalto y pizarra. Las vistas están completamente protegidas mediante rutas privadas basadas en roles de usuario.
*   **Backend (Python Flask):** Servicio REST API robusto encargado del procesamiento de negocio, transacciones seguras de base de datos y control de accesos. Utiliza Flask-SQLAlchemy como ORM y Flask-JWT-Extended para la autenticación sin estado mediante tokens firmados.
*   **Base de datos:** Compatible con SQLite (por defecto en modo de desarrollo) o MySQL/PostgreSQL configurando la variable de entorno correspondiente.

---

## 📦 Módulos Principales del Sistema

1.  **Módulo de Autenticación y Seguridad:** Acceso restringido por credenciales cifradas (Bcrypt) y gestión de tokens JWT con expiración controlada.
2.  **Módulo de Matrícula:** Flujo completo desde la solicitud en línea por parte del estudiante (validando cruce de horarios y pre-requisitos curriculares) hasta la aprobación e inspección financiera del personal administrativo.
3.  **Módulo de Cursos y Docentes:** Control de asignaciones de materias, gestión de horarios por sección e ingresos y cierres de actas académicas.
4.  **Módulo de Calificaciones:** Llenado asíncrono de notas parciales por parte del docente con cálculo automático de promedios ponderados y visualización instantánea para los estudiantes.
5.  **Módulo de Certificados y Trámites:** Flujo digitalizado de expedición de constancias de estudio e historial académico en formato PDF oficial.
6.  **Panel de Auditorías:** Rastreo inalterable de operaciones críticas, almacenando autoría, marcas de tiempo y metadatos del sistema para seguridad institucional.

---

## 🚀 Guía de Instalación y Despliegue

### Requisitos Mínimos
*   Python 3.10 o superior.
*   Node.js 18.0 o superior.
*   Gestor de base de datos (SQLite se crea automáticamente, opcional MySQL/Docker).

---

### 💻 Paso 1: Configurar el Servidor (Backend)

1.  Accede a la carpeta de backend:
    ```bash
    cd Backend
    ```
2.  Crea e inicializa tu entorno virtual:
    ```bash
    python -m venv venv
    # En Windows:
    .\venv\Scripts\Activate.ps1
    # En macOS/Linux:
    source venv/bin/activate
    ```
3.  Instala todas las dependencias del ecosistema de Flask:
    ```bash
    pip install -r requirements.txt
    ```
4.  Configura tus variables de entorno creando un archivo `.env` dentro de `Backend/`:
    ```env
    # Servidor SQLite local para desarrollo rápido (Recomendado):
    DATABASE_URL=sqlite:///app.db
    SECRET_KEY=cambiar_este_valor_super_secreto
    ```
5.  *(Opcional)* Recrea la base de datos limpia y siembra las tablas con datos de prueba semilla:
    ```bash
    python fresh.py
    ```
    *Nota: Escribe 'si' cuando el prompt lo solicite para proceder con la limpieza.*

6.  Inicia el servidor Flask:
    ```bash
    python run.py
    ```
    *El Backend quedará escuchando peticiones en `http://127.0.0.1:5000`.*

---

### 🎨 Paso 2: Configurar la Interfaz (Frontend)

1.  Abre una terminal paralela y dirígete al módulo web:
    ```bash
    cd Frontend
    ```
2.  Instala los paquetes necesarios de Node:
    ```bash
    npm install
    ```
3.  Corre el servidor de desarrollo local de Vite:
    ```bash
    npm run dev
    ```
    *La interfaz de usuario estará lista en su navegador en `http://localhost:5173`.*

---

## 👥 Credenciales de Prueba Presembradas

Puedes utilizar cualquiera de las siguientes cuentas para explorar las interfaces según sus privilegios específicos (Contraseña general: `123456`):

| Rol | Usuario | Propósito en la Demostración |
| :--- | :--- | :--- |
| **Administrador** | `admin_prueba` | Crear cursos, aprobar matrículas, emitir certificados y gestionar usuarios. |
| **Dirección** | `direccion_prueba` | Monitorear estadísticas globales, auditar logs de seguridad y revisar actas. |
| **Docente** | `docente1_prueba` | Llenar notas en su sección asignada y bloquear actas de evaluación. |
| **Estudiante** | `estudiante1_prueba` | Solicitar matrícula de asignaturas, ver récord académico y pedir certificados. |

---

## 📝 Solución de Problemas Comunes (Troubleshooting)

*   **Error de ejecución de scripts en PowerShell:** Si al activar el entorno virtual (`venv`) en Windows obtienes un error de permisos, abre PowerShell como Administrador y ejecuta por única vez:
    ```powershell
    Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
    ```
*   **Colisión de Puertos (EADDRINUSE):** Si el puerto `5000` (Backend) o `5173` (Frontend) ya está en uso por otro servicio de tu máquina, puedes reconfigurarlos en `Backend/run.py` o `Frontend/vite.config.js` respectivamente.
