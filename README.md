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

## Flujo de trabajo

Cada **reporte** representa un encuentro con una persona asistida. El estado actual de cada persona se determina por su **último reporte**:

1. **Reportar**: El voluntario crea un reporte con la urgencia observada (Baja/Media/Alta/Crítica) y el estado inicial (Pendiente/Atendido/Derivado).
2. **Seguimiento**: En visitas posteriores, se crean nuevos reportes para la misma persona. El dashboard muestra las urgencias activas (personas cuyo último reporte no es "Resuelto").
3. **Resolver**: Cuando la situación se normaliza, se crea un reporte con estado **Resuelto**. La persona desaparece automáticamente del panel de urgencias activas.
4. **Historial**: Todas las visitas quedan registradas y visibles en el detalle de cada persona.

## Funcionalidades principales

- **Reportar Hallazgo**: Captura automática de GPS, búsqueda autocomplete de persona asistida.
- **Dashboard**: Panel con urgencias activas, estadísticas y gráfico de impacto mensual.
- **Historial**: Vista de todos los reportes realizados con enlaces directos al mapa.
- **Gestión de Personas**: ABM completo para registrar a las personas que necesitan ayuda.
- **Mapa**: Visualización geográfica de reportes por fecha.
- **Seguridad**: Sistema de login y registro protegido por JWT.

## Tecnologías utilizadas

- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, Axios.
- **Backend**: Node.js, Express, Sequelize, MariaDB, JWT, Bcrypt.