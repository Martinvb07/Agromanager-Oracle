<div align="center">

<img src="Frontend/public/Logo AgroManager.png" alt="AgroManager Logo" width="180"/>

# AgroManager Pro

**La plataforma inteligente para la gestión de tu campo, respaldada por la nube de Oracle**

*Organizá tu finca, tomá mejores decisiones y aumentá tu productividad con el apoyo de inteligencia artificial*

---

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Oracle](https://img.shields.io/badge/Oracle_Cloud-F80000?style=for-the-badge&logo=oracle&logoColor=white)](https://www.oracle.com/cloud/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

</div>

---

## ¿Qué es AgroManager Pro?

**AgroManager Pro** es una aplicación web completa diseñada para ayudar a agricultores, dueños de fincas y administradores del campo a llevar el control total de su operación desde cualquier dispositivo con internet.

Esta versión es la fusión de dos proyectos: la solidez de **Oracle Cloud** como motor de base de datos empresarial, con la inteligencia del **asistente agrícola AgroBot** que te acompaña, responde tus preguntas y te da recomendaciones basadas en tus datos reales.

Olvídate de los cuadernos, las hojas de cálculo desordenadas o los apuntes en papel. Con AgroManager Pro tenés todo centralizado en un solo lugar: tus parcelas, tus trabajadores, tu maquinaria, tus finanzas y un asistente que nunca duerme.

---

## ¿Qué podés hacer con AgroManager Pro?

### 🌿 Gestión de Parcelas
Registrá cada lote o parcela de tu campo con su superficie en hectáreas, el cultivo actual, el estado de la tierra y la inversión realizada. Visualizá todo de un vistazo en un panel claro y ordenado, con indicadores de estado en tiempo real.

### 🌱 Siembras e Inversiones
Llevá el historial completo de cada siembra: variedad sembrada, proveedor de semilla, fecha, cantidad y estado del ciclo. Registrá cada inversión asociada a la siembra para calcular con precisión el costo real de producción.

### 👷 Control de Trabajadores
Gestioná cargos, salarios y horas laboradas de cada miembro de tu equipo. El sistema calcula automáticamente cuántas horas trabajó cada persona en el mes, y permite liquidar nóminas de forma ordenada.

### 🚜 Seguimiento de Maquinaria
Controlá el estado de tus tractores, cosechadoras, fumigadoras y demás equipos. Registrá fechas de mantenimiento y recibí alertas cuando se acerque el próximo servicio, antes de que una falla te detenga en plena cosecha.

### 🌾 Campañas Agrícolas
Creá y seguí cada campaña de siembra o cosecha desde el inicio hasta el cierre. Cada campaña incluye:
- **Diario de cosecha** — Registrá el avance diario con hectáreas cortadas, bultos y notas del día
- **Remisiones** — Generá documentos de despacho con datos del conductor, vehículo, placa, origen, destino y valor del flete
- **Balance automático** — El sistema calcula ingresos, egresos y rendimiento por hectárea al instante

### 💧 Planificación de Riego
Organizá los turnos de riego por parcela o siembra, registrá el consumo de agua y mantené un historial para optimizar el uso del recurso hídrico. El bot te avisa cuando un riego está vencido.

### 🐛 Control de Plagas
Registrá incidentes con el tipo de plaga, cultivo afectado, severidad (Baja / Media / Alta) y tratamiento aplicado. El sistema levanta alertas automáticas ante plagas de severidad alta para que puedas actuar a tiempo.

### 🧪 Inventario de Fertilizantes
Controlá el stock de cada fertilizante con su costo y nivel mínimo de reserva. El sistema descuenta automáticamente el inventario cuando registrás una aplicación, y te alerta cuando un producto está agotado.

### 🌱 Inventario de Semillas
Llevá el registro de tus semillas disponibles por tipo, cantidad, proveedor y costo unitario. Siempre sabrás con qué contás antes de planificar la próxima siembra.

### 💰 Finanzas del Campo
Registrá ingresos (ventas, subsidios, préstamos) y egresos (insumos, operación, mantenimiento, personal) con categorías claras. Consultá el balance del mes en tiempo real y tomá decisiones financieras con información real, no estimaciones.

### 📊 Dashboard Inteligente
Un panel de control centralizado con todas las métricas clave de tu finca: parcelas activas, trabajadores, maquinaria, balance del mes, campañas en curso y siembras activas. Todo calculado en tiempo real desde la base de datos Oracle.

### 📄 Reportes en PDF
Exportá resúmenes y reportes de tu operación en formato PDF para presentar, archivar o compartir con socios, contadores o inversores.

---

## 🤖 AgroBot — Tu Asistente Agrícola con IA

AgroBot es el chatbot integrado en la plataforma. No es un bot genérico: conoce tu finca, consulta tus datos reales y combina esa información con conocimiento técnico agrícola para darte respuestas útiles y contextualizadas.

### ¿Qué puede hacer AgroBot?

**Consultar tus datos en tiempo real:**
- "¿Cuántas parcelas tengo activas?"
- "¿Tengo riegos vencidos?"
- "¿Cuál es mi balance este mes?"
- "¿Qué plagas tengo registradas?"
- "¿Qué fertilizantes me están quedando sin stock?"
- "Dame un resumen de mi finca"

**Darte un plan de acción semanal:**
- "¿Qué hago esta semana?"
- "¿Por dónde empiezo hoy?"
- Responde con una lista priorizada según tus alertas reales: riegos vencidos, mantenimientos próximos, plagas urgentes, balance negativo

**Combinar tus datos con consejo técnico agrícola:**
- Cuando preguntás por tus plagas, el bot te muestra cuáles tenés registradas *y además* te explica cómo tratarlas
- Cuando preguntás por riego, combina tu calendario real con recomendaciones por cultivo

**Responder preguntas técnicas agrícolas:**
- Control de plagas específicas (sogata, cogollero, piricularia, roya, pulgones, trips…)
- Fertilización por cultivo: NPK, urea, DAP, KCl, foliar
- Tipos de riego: goteo, aspersión, inundación, surco
- Maquinaria: mantenimiento preventivo de tractores, cosechadoras y fumigadoras
- Cultivos: arroz, maíz, soja, café, caña, palma, yuca, plátano, cacao y más

**Conversar de forma natural:**
- Entiende saludos, preguntas casuales ("¿cómo estás?"), agradecimientos y despedidas
- No distingue mayúsculas ni tildes — escribe como quieras

### ¿Cómo funciona el motor de IA?

AgroBot funciona con tres modos, configurables según disponibilidad:

| Modo | Descripción |
|---|---|
| 🧠 **Heurístico** (por defecto) | Sin necesidad de API externa. Usa knowledge base local, Wikipedia en español y los datos reales de la BD |
| 🟢 **OpenAI** | Conectado a GPT-4o-mini u otro modelo OpenAI para respuestas en lenguaje natural |
| 🔵 **Anthropic Claude** | Conectado a Claude Sonnet para respuestas en lenguaje natural |

El modo heurístico funciona completamente offline (sin costos de API) y es lo suficientemente inteligente para responder la mayoría de preguntas del día a día.

---

## 🗄️ Base de Datos Oracle Cloud con PL/SQL

El corazón del proyecto es **Oracle Autonomous Database**, una base de datos de nivel empresarial en la nube. Más allá de guardar datos, el esquema aprovecha al máximo las capacidades de Oracle con objetos de base de datos que automatizan procesos críticos de la operación.

### Triggers automáticos
El sistema tiene reglas que se ejecutan solas sin intervención del usuario:
- **Descuento de stock de fertilizantes** — Cada vez que se registra una aplicación, el stock se descuenta automáticamente. Si no hay suficiente stock, la operación se rechaza con un mensaje claro
- **Control de estado de fertilizantes** — Cuando el stock baja a cero, el estado cambia a "Agotado" automáticamente. Cuando se repone, vuelve a "Disponible"
- **Validación de fechas en diario de cosecha** — No permite registrar entradas del diario fuera del rango de fechas de la campaña, evitando errores de carga
- **Auditoría de cambios** — Registra automáticamente cuándo fue la última modificación de usuarios, parcelas y trabajadores

### Vistas calculadas
Consultas precalculadas que el sistema usa para mostrar información compleja de forma eficiente:
- **Dashboard general** — Métricas en tiempo real: parcelas activas, trabajadores, balance del mes, campañas en curso
- **Resumen financiero por mes** — Ingresos y egresos agrupados mes a mes para análisis de tendencias
- **Resumen por campaña** — Producción total, hectáreas cosechadas, ingresos, egresos y rendimiento por hectárea calculados automáticamente
- **Alerta de stock bajo** — Lista de fertilizantes cuyo stock está por debajo del mínimo configurado
- **Horas por trabajador** — Total de horas trabajadas y horas del mes actual para cada empleado
- **Resumen de siembras** — Estado, inversión acumulada y uso de fertilizantes por siembra

### Procedimientos almacenados
Operaciones complejas ejecutadas directamente en la base de datos:
- **Aplicación de fertilizantes en lote** — Registra múltiples aplicaciones de una sola vez, validando stock antes de proceder
- **Registro de jornadas laborales** — Carga múltiples días de trabajo de un empleado en una sola operación
- **Cierre de campaña** — Actualiza automáticamente el estado de siembras y parcelas al cerrar una campaña
- **Liquidación de nómina mensual** — Calcula el pago de cada trabajador activo proporcional a sus horas registradas y genera los egresos de nómina
- **Sincronización de stock** — Revisa y corrige el estado de todos los fertilizantes del usuario

### Funciones de cálculo
Cálculos especializados disponibles en toda la base de datos:
- Horas trabajadas por empleado en cualquier rango de fechas
- Balance financiero neto en un período dado
- Rendimiento de una campaña en bultos por hectárea
- Costo total de nómina por mes
- Parcelas con riego vencido hace más de N días
- Fertilizante con mayor consumo en un período

### Tipos de datos propios (Colecciones PL/SQL)
Estructuras de datos personalizadas para operaciones en lote que mejoran el rendimiento al reducir viajes a la base de datos.

---

## ¿Para quién es?

| Perfil | Beneficio principal |
|--------|---------------------|
| 🧑‍🌾 Dueño de finca | Vista general del negocio, control financiero y gestión integral |
| 📋 Administrador | Gestión operativa diaria con automatización de procesos |
| 👨‍💼 Encargado de campo | Registro de trabajadores, maquinaria, campañas y siembras |
| 🎓 Proyecto universitario | Demostración de base de datos Oracle con PL/SQL, IA y arquitectura moderna |

---

## ¿Por qué Oracle Cloud?

A diferencia de una base de datos instalada en una computadora local, **Oracle Autonomous Database** guarda tu información en servidores en la nube con respaldo automático y disponibilidad desde cualquier lugar del mundo.

| Característica | Beneficio |
|---|---|
| ☁️ Almacenamiento en la nube | Tus datos no se pierden si se rompe una computadora |
| 🔒 Encriptación y seguridad | Datos protegidos con estándares empresariales (wallet mTLS) |
| 🌍 Acceso desde cualquier lugar | Consultá tu campo desde el celular, la oficina o el campo |
| 🔄 Respaldo automático | Sin necesidad de hacer copias de seguridad manualmente |
| ⚡ Alto rendimiento | Pool de conexiones optimizado para múltiples usuarios simultáneos |

---

## Tecnologías utilizadas

### 🖥️ Interfaz (Frontend)

| Tecnología | Para qué se usa |
|------------|-----------------|
| ![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=white) | Construcción de la interfaz visual |
| ![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white) | Herramienta de construcción rápida |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?logo=tailwindcss&logoColor=white) | Diseño y estilos visuales |
| ![React Router](https://img.shields.io/badge/React_Router-CA4245?logo=reactrouter&logoColor=white) | Navegación entre páginas |
| ![Lucide](https://img.shields.io/badge/Lucide_Icons-F56565?logoColor=white) | Iconos de la interfaz |
| ![jsPDF](https://img.shields.io/badge/jsPDF-FF0000?logoColor=white) | Exportación de reportes en PDF |
| ![SweetAlert2](https://img.shields.io/badge/SweetAlert2-FF6384?logoColor=white) | Alertas y confirmaciones visuales |

### ⚙️ Servidor (Backend)

| Tecnología | Para qué se usa |
|------------|-----------------|
| ![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white) | Motor que corre el servidor |
| ![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white) | Framework para la API REST |
| ![Oracle](https://img.shields.io/badge/Oracle_DB-F80000?logo=oracle&logoColor=white) | Base de datos en la nube con PL/SQL |
| ![JWT](https://img.shields.io/badge/JWT-000000?logo=jsonwebtokens&logoColor=white) | Seguridad y autenticación de usuarios |
| ![Helmet](https://img.shields.io/badge/Helmet.js-333333?logoColor=white) | Protección de cabeceras HTTP |

### 🤖 Inteligencia Artificial

| Tecnología | Para qué se usa |
|------------|-----------------|
| 🧠 **Motor Heurístico** | IA integrada, sin costo, funciona con knowledge base + Wikipedia |
| ![OpenAI](https://img.shields.io/badge/OpenAI-412991?logo=openai&logoColor=white) | Motor de IA en lenguaje natural (opcional) |
| ![Anthropic](https://img.shields.io/badge/Anthropic_Claude-CC785C?logoColor=white) | Motor de IA alternativo (opcional) |

---

## Vista previa

```
┌──────────────────────────────────────────────────────┐
│  🌾 AgroManager Pro          [Miguel]  [Salir]       │
├───────────┬──────────────────────────────────────────┤
│           │  📊 Dashboard — Mayo 2025                │
│ Parcelas  │  Parcelas activas: 3   Trabajadores: 5   │
│ Siembras  │  Maquinaria: 4    Balance: +$21.4M ✅    │
│ Trabaj.   │                                          │
│ Maquinar. │  🌾 Campañas activas                     │
│ Campañas  │  ┌─────────────┐  ┌─────────────┐        │
│ Plagas    │  │ Arroz 2025-A│  │ Maíz 2025   │        │
│ Riego     │  │ ✅ En curso  │  │ ✅ En curso  │        │
│ Semillas  │  │ 📄 Diario   │  │ 📄 Remis.   │        │
│ Fertil.   │  └─────────────┘  └─────────────┘        │
│ Finanzas  │                                          │
│ Reportes  │  📌 Pendientes: 2 riegos vencidos        │
│           │     1 plaga ALTA · 1 mant. próximo       │
│ 🤖 AgroBot│                                          │
└───────────┴──────────────────────────────────────────┘

  AgroBot: ¡Hola! 👋 Tenés pendientes importantes:
  ⚠️ 2 riego(s) vencido(s): Parcela Norte, Parcela Sur
  🐛 1 plaga ALTA: Sogata en Arroz
  ¿Por cuál empezamos?
```

---

## Estructura del proyecto

```
AgroManager_Oracle/
│
├── 📁 Backend/                  → Servidor Node.js y API REST
│   ├── src/
│   │   ├── routes/              → Endpoints de la API
│   │   │   ├── ai.routes.js     → Chatbot AgroBot (/advice, /chat)
│   │   │   ├── campanas.routes.js
│   │   │   ├── siembras.routes.js
│   │   │   ├── fertilizantes.routes.js
│   │   │   ├── dashboard.routes.js
│   │   │   └── ...demás módulos
│   │   ├── controllers/         → Lógica de cada módulo
│   │   ├── services/
│   │   │   └── ai.service.js    → Motor del chatbot (heurístico + OpenAI + Anthropic)
│   │   ├── middleware/          → Autenticación, errores, async
│   │   ├── data/
│   │   │   └── knowledge.json   → Base de conocimiento agrícola del bot
│   │   └── config/              → Conexión Oracle (pool de conexiones)
│   └── db/
│       └── schema.sql           → DDL completo: tablas, triggers, tipos PL/SQL,
│                                  vistas, procedimientos almacenados y funciones
│
├── 📁 Frontend/                 → Interfaz de usuario React + Vite
│   └── src/
│       ├── views/               → Páginas principales
│       │   ├── CropManagementDashboard.jsx   → Dashboard principal
│       │   ├── CampanaDetail.jsx             → Detalle de campaña
│       │   ├── Login.jsx / Landing.jsx
│       │   └── ...
│       ├── components/
│       │   ├── ChatBot.jsx      → Interfaz del asistente AgroBot
│       │   ├── sections/        → Tablas y grids por módulo
│       │   └── TractorLoader.jsx
│       └── services/
│           ├── api.js           → Comunicación con la API
│           └── reportGenerator.js → Generación de PDF
│
└── 📁 docs/
    └── uml/                     → Diagramas del sistema
```

---

## Roadmap

### ✅ Completado
- [x] Panel de control con métricas en tiempo real (vista `V_DASHBOARD`)
- [x] Gestión de parcelas, trabajadores, maquinaria, plagas, riego, semillas y fertilizantes
- [x] Control financiero (ingresos y egresos) con resumen mensual (`V_RESUMEN_FINANCIERO`)
- [x] Campañas agrícolas con diario de cosecha y remisiones de transporte
- [x] Siembras con historial de inversiones y uso de fertilizantes
- [x] Exportación de reportes en PDF
- [x] Asistente AgroBot con modo heurístico, OpenAI y Anthropic
- [x] Autenticación segura con JWT
- [x] Base de datos Oracle Cloud con PL/SQL (6 triggers, 7 vistas, 5 procedimientos, 6 funciones, 4 tipos)
- [x] Stock de fertilizantes con descuento automático por trigger
- [x] Alertas proactivas: riegos vencidos, mantenimientos próximos, plagas altas, balance negativo
- [x] Plan semanal de acción generado por el bot según datos reales
- [x] Respuestas híbridas: datos de la finca + conocimiento técnico agrícola en una sola respuesta
- [x] Interfaz conversacional natural (saludos, despedidas, confirmaciones variadas)

### 🔜 Próximamente
- [ ] Aplicación móvil nativa
- [ ] Notificaciones push para alertas urgentes
- [ ] Integración con sensores IoT de campo
- [ ] Módulo de proveedores con historial de compras

---

## Documentación

Este proyecto incluye documentación para distintos públicos:

- 📘 **Manual de usuario** — Guía paso a paso de todas las funcionalidades (`MANUAL_USUARIO.md`)
- 📐 **Diagramas UML** — Diagramas de casos de uso, entidad-relación y flujos del sistema (`docs/uml/`)

---

## Licencia

Este proyecto fue desarrollado como trabajo universitario con el objetivo de modernizar y facilitar la gestión agropecuaria mediante tecnología de punta, combinando Oracle Cloud, PL/SQL e inteligencia artificial. Todos los derechos reservados © 2026 — AgroManager Pro.

---

<div align="center">

Hecho con ❤️ para el campo

**[Reportar un problema](https://github.com/Martinvb07/AgroManager-Oracle/issues)** · **[Solicitar una función](https://github.com/Martinvb07/AgroManager-Oracle/issues/new)**

</div>
