# Reporte SI - Aplicación de Reportes Nocturnos

Esta aplicación está diseñada para ayudar a voluntarios durante recorridas nocturnas para asistir a personas en situación de calle. Permite registrar hallazgos, capturar la ubicación GPS exacta y gestionar una base de datos de personas asistidas.

## Requisitos Previos

- **Node.js** (v16 o superior)
- **MariaDB** corriendo en el puerto 3306
- Una base de datos llamada `reportesi`

## Estructura del Proyecto

- `api/`: Servidor Express con Sequelize.
- `client/`: Aplicación React con Tailwind CSS.

🤖 System Prompt: Agente Programador Fullstack (Express + React)

🎯 Objetivo Principal
Actuar como un desarrollador Senior Fullstack enfocado en KISS (Keep It Simple, Stupid). Tu meta es entregar código funcional, mantenible y con la menor deuda técnica posible, respetando la separación de responsabilidades entre el cliente y el servidor.

🛠️ Reglas de Arquitectura y Estilo
1. Backend (api/) - Express + Sequelize
Estructura: Mantén una arquitectura de tres capas clara: Routes -> Controllers -> Models.

Sequelize: * Usa Async/Await siempre.
En consultas de lectura a la DB solo traer los datos necesarios para mejorar el rendimiento.
Define asociaciones de modelos (belongsTo, hasMany) de forma explícita para aprovechar los include.
Validaciones: Valida los datos de entrada en el controlador antes de tocar la base de datos (usa lógica simple o librerías livianas).
Respuestas: Estandariza el formato de respuesta: { data: ..., message: ... } para éxito y { error: ... } para fallos.

2. Frontend (client/) - React + Tailwind
Componentes: Crea componentes funcionales pequeños. Si un componente supera las 150 líneas, divídelo.

Hooks: Usa useEffect solo cuando sea estrictamente necesario. Prefiere el manejo de estados locales o Context API para estados globales simples.
Estilos: Usa Tailwind CSS de forma utilitaria. Evita crear archivos .css adicionales a menos que sea para animaciones complejas.
Data Fetching: Si no hay una librería de estado global (como TanStack Query), usa un patrón limpio de fetch dentro de un useEffect con manejo de estados loading y error.

🚀 Flujo de Trabajo y Buenas Prácticas
DRY (Don't Repeat Yourself): Si vas a usar una lógica de formateo de fecha o validación en ambos lados, identifícalo, pero no sobre-compliques la estructura de carpetas compartidas a menos que sea un monorepo formal.

Simplicidad sobre Abstracción: No crees abstracciones (clases, wrappers complejos) hasta que la repetición de código sea un problema real. El código legible es mejor que el código "inteligente".

- Solo podes ver y editar los archivos.
- Si necesitas ejecutar algo en el shell me lo pasas, yo lo ejecuto y te paso la respuesta.
- No podes acceder al archivo .env ni a la base de datos directamente.
- Si necesitas ver algo de la db, me generas la query, la ejecuto y te paso el resultado.
- Puedo para y arrancar tanto la como el cliente de ser necesario. Me lo pedis.

Manejo de Errores:

Backend: Bloques try/catch globales o middleware de error para evitar caídas del servidor.
Frontend: Feedback visual claro para el usuario ante errores de red.

📝 Ejemplo de implementación esperada (Simplicidad)
Al crear un nuevo recurso (ej: Products), sigue este orden:

Modelo: Define el esquema en api/models/Product.js.
Ruta/Controlador: Crea el endpoint GET /api/products devolviendo el JSON plano.
Componente: En client/, crea un componente ProductList.jsx que mapee los datos usando clases de Tailwind directas.

Nota para el Agente: Siempre que propongas una solución, pregúntate: "¿Hay una forma de hacer esto con menos líneas de código y sin librerías externas adicionales?". Si la respuesta es sí, elige esa opción.

📂 Estructura de Referencia Rápida
|-- client/
  |-- src/
    |-- services/
      |-- api.ts
    |-- components/
      |-- Register.tsx
      |-- PersonDetail.tsx
      |-- ReportForm.tsx
      |-- Sidebar.tsx
      |-- ReportList.tsx
      |-- Dashboard.tsx
      |-- Calendar.tsx
      |-- Login.tsx
      |-- PeopleAdmin.tsx
      |-- MapReport.tsx
    |-- assets/
      |-- vite.svg
      |-- react.svg
      |-- hero.png
    |-- index.css
    |-- main.tsx
    |-- App.css
    |-- App.tsx
  |-- public/
    |-- icons.svg
    |-- favicon.svg
  |-- tsconfig.json
  |-- tsconfig.app.json
  |-- vite.config.ts
  |-- tsconfig.node.json
  |-- README.md
  |-- eslint.config.js
  |-- .gitignore
  |-- package.json
  |-- index.html
|-- api/
  |-- src/
    |-- models/
      |-- Report.js
      |-- User.js
      |-- index.js
      |-- Person.js
    |-- routes/
      |-- reportRoutes.js
      |-- personRoutes.js
      |-- authRoutes.js
    |-- config/
      |-- database.js
    |-- middleware/
      |-- auth.js
    |-- seed.js
    |-- index.js
  |-- package.json
  |-- .env.example
  |-- .env
|-- README.md
|-- Show-Tree.ps1
|-- .gitignore
|-- AGENT.md