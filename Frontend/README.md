<div align="center">

# AgroManager Pro — Frontend

**Interfaz web de gestión agrícola construida con React 19 + Vite**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![React Router](https://img.shields.io/badge/React_Router-7-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)](https://reactrouter.com/)

</div>

---

## ¿Qué es esta parte?

El Frontend es la interfaz visual de AgroManager Pro. Es lo que el usuario ve y usa: el panel de control, los formularios, los reportes y el chatbot. Se conecta al Backend a través de una API REST y muestra toda la información de la finca en tiempo real.

Es una aplicación web moderna de página única (SPA) que funciona desde el navegador sin recargas.

---

## Páginas y pantallas

### 🏠 Landing Page — Página de inicio pública
La primera pantalla que ve cualquier visitante. Incluye:
- Carrusel de imágenes del sistema
- Presentación de las funcionalidades principales
- Estadísticas del producto
- Historial de novedades y mejoras recientes del sistema
- Acceso al login

### 🔐 Login — Inicio de sesión
Formulario de autenticación con email y contraseña. Una vez autenticado, el sistema redirige automáticamente según el rol del usuario (administrador o propietario). Incluye una animación de tractor durante la carga.

### 📊 Panel de Administración — Dashboard principal
El corazón de la aplicación. Desde aquí se accede a todos los módulos de gestión a través de un sidebar lateral:

| Módulo | Qué hace |
|--------|----------|
| **Dashboard** | Resumen general: parcelas activas, balance del mes, maquinaria, campañas y alertas importantes |
| **Parcelas** | Grid visual de todos los lotes con estado, cultivo y superficie |
| **Trabajadores** | Tabla de personal con control de salarios y liquidación de nómina |
| **Finanzas** | Registro y visualización de ingresos y egresos con totales por mes |
| **Maquinaria** | Inventario de equipos con fechas de mantenimiento y estado operativo |
| **Campañas** | Listado de campañas de cosecha con acceso al detalle de cada una |
| **Semillas** | Inventario de semillas por tipo y proveedor |
| **Plagas** | Registro de incidentes con nivel de severidad y tratamiento aplicado |
| **Riego** | Programación de turnos de riego y consumo de agua por parcela |
| **Fertilizantes** | Registro de aplicaciones y stock disponible por producto |
| **Reportes** | Exportación de información en PDF |
| **🤖 AgroBot** | Chatbot integrado en el dashboard para consultas rápidas |

### 🌾 Detalle de Campaña
Pantalla completa dedicada a una campaña de cosecha específica. Incluye:
- **Resumen financiero**: inversión, ingresos y rendimiento por hectárea calculados automáticamente
- **Diario de cosecha**: registro día a día de hectáreas cortadas y bultos producidos
- **Remisiones de transporte**: formulario para documentar cada despacho con datos del conductor, vehículo, placa, origen, destino y valor del flete
- **Firma digital**: espacio para capturar firmas del conductor y del propietario
- **Exportación a PDF**: genera el documento de remisión listo para imprimir o compartir

### 👤 Panel del Propietario
Pantalla exclusiva para el rol de propietario. Permite:
- Ver y registrar los usuarios del sistema
- Publicar novedades, mejoras y correcciones que aparecen en la Landing Page

### 📋 Cambios
Feed público con el historial de actualizaciones del sistema, filtrable por tipo: Novedad, Mejora o Corrección.

---

## 🤖 AgroBot — Panel de chat

En la esquina inferior derecha de la pantalla hay un botón circular verde fijo. Al hacer clic se abre un panel de chat completo (380×540 px) con animación de entrada. En móviles ocupa toda la pantalla.

El panel tiene tres zonas:
- **Cabecera verde** con el nombre AgroBot, el subtítulo "Asistente agrícola" y el botón de cerrar
- **Área de mensajes** con los globos de conversación — los mensajes del usuario en azul/morado a la derecha, las respuestas del bot en blanco a la izquierda, cada uno con su ícono
- **Barra de entrada** con campo de texto y botón de enviar

Otras características:
- Indicador de escritura animado (tres puntos) mientras el bot procesa
- Envío con la tecla **Enter**, nueva línea con **Shift + Enter**
- Las respuestas del bot renderizan texto en negrita
- Los últimos 20 mensajes se envían con cada pregunta para mantener el contexto

---

## Tecnologías utilizadas

| Tecnología | Para qué se usa |
|------------|-----------------|
| **React 19** | Construcción de toda la interfaz de usuario |
| **Vite** | Herramienta de construcción y servidor de desarrollo rápido |
| **Tailwind CSS 4** | Sistema de estilos utilitarios para el diseño visual |
| **React Router 7** | Navegación entre páginas sin recarga |
| **Lucide React** | Iconos modernos usados en toda la interfaz |
| **jsPDF** | Generación de documentos PDF desde el navegador |
| **SweetAlert2** | Modales de confirmación y alertas visuales amigables |

---

## Estructura de carpetas

```
Frontend/
├── public/
│   ├── Logo AgroManager.png        → Logotipo de la plataforma
│   └── hero/                       → Imágenes del carrusel en Landing
│
└── src/
    ├── App.jsx                     → Definición de todas las rutas
    ├── main.jsx                    → Punto de entrada de la app
    │
    ├── views/                      → Páginas completas
    │   ├── Landing.jsx             → Homepage pública
    │   ├── Login.jsx               → Inicio de sesión
    │   ├── CropManagementDashboard.jsx  → Panel principal del admin
    │   ├── CampanaDetail.jsx       → Detalle de campaña + diario + remisiones
    │   ├── OwnerDashboard.jsx      → Panel del propietario
    │   └── Cambios.jsx             → Historial de cambios del sistema
    │
    ├── components/
    │   ├── ChatBot.jsx             → Chatbot flotante AgroBot
    │   ├── TractorLoader.jsx       → Animación de carga
    │   ├── AiAssistantCard.jsx     → Chat embebido en el dashboard
    │   └── sections/              → Secciones del panel de admin
    │       ├── Navigation.jsx
    │       ├── DashboardOverview.jsx
    │       ├── ParcelasGrid.jsx
    │       ├── TrabajadoresTable.jsx
    │       ├── FinanzasView.jsx
    │       ├── MaquinariaGrid.jsx
    │       ├── CampanasTable.jsx
    │       ├── SemillasTable.jsx
    │       ├── SiembrasTable.jsx
    │       ├── PlagasGrid.jsx
    │       ├── RiegoTable.jsx
    │       ├── FertilizantesTable.jsx
    │       └── ReportesGrid.jsx
    │
    ├── services/
    │   ├── api.js                  → Todas las llamadas a la API del Backend
    │   └── reportGenerator.js      → Lógica de generación de PDF
    │
    └── styles/                    → CSS complementario por página
        ├── admin.css
        ├── Landing.css
        ├── Login.css
        ├── ChatBot.css
        └── ...
```

---

## Rutas de la aplicación

| Ruta | Pantalla | Acceso |
|------|----------|--------|
| `/` | Landing — homepage pública | Todos |
| `/login` | Formulario de inicio de sesión | Todos |
| `/admin` | Panel principal de gestión | Solo admin |
| `/admin/campanas/:id` | Detalle de campaña específica | Solo admin |
| `/owner` | Panel del propietario | Solo propietario |
| `/cambios` | Historial de cambios | Todos |
