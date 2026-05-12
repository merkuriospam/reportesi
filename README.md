# Reporte SI - Aplicación de Reportes Nocturnos

Esta aplicación está diseñada para ayudar a voluntarios durante recorridas nocturnas para asistir a personas en situación de calle. Permite registrar hallazgos, capturar la ubicación GPS exacta y gestionar una base de datos de personas asistidas.

## Requisitos Previos

- **Node.js** (v16 o superior)
- **MariaDB** corriendo en el puerto 3306
- Una base de datos llamada `reportesi`

## Estructura del Proyecto

- `api/`: Servidor Express con Sequelize.
- `client/`: Aplicación React con Tailwind CSS.

## Configuración y Ejecución

### 1. Preparar la Base de Datos

En tu cliente de MariaDB:
```sql
CREATE DATABASE reportesi;
```

### 2. Configurar el Backend

```bash
cd api
npm install
# Opcional: Ajusta el archivo .env si tu MariaDB tiene contraseña
npm run seed  # Esto crea las tablas y un usuario admin inicial
npm start
```

**Usuario inicial:**
- **Usuario:** `admin`
- **Contraseña:** `password123`

### 3. Configurar el Frontend

```bash
cd client
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

## Funcionalidades principales

- **Reportar Hallazgo**: Captura automática de GPS y selección de persona asistida.
- **Historial**: Vista de todos los reportes realizados con enlaces directos a Google Maps.
- **Gestión de Personas**: ABM completo para registrar a las personas que necesitan ayuda.
- **Seguridad**: Sistema de login y registro protegido por JWT.

## Tecnologías utilizadas

- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, Axios.
- **Backend**: Node.js, Express, Sequelize, MariaDB, JWT, Bcrypt.

  Session   Revisar AGENT.md
  Continue  opencode -s ses_1edf76031ffemMXWNkpHqwUctg