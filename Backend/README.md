<div align="center">

# AgroManager Pro — Backend

**API REST y motor de base de datos Oracle para la plataforma de gestión agrícola**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Oracle](https://img.shields.io/badge/Oracle_Cloud-F80000?style=for-the-badge&logo=oracle&logoColor=white)](https://www.oracle.com/cloud/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

</div>

---

## ¿Qué es esta parte?

El Backend es el servidor que da vida a toda la plataforma. Recibe las peticiones del Frontend, las procesa, consulta la base de datos Oracle Cloud y devuelve la información. También contiene el motor del asistente AgroBot y toda la lógica de negocio del sistema.

---

## Módulos de la API

El servidor expone una API REST organizada por módulos. Cada módulo maneja un dominio específico de la operación agrícola:

### 🔐 Autenticación
Registro y verificación de identidad de los usuarios. Genera un token seguro (JWT) que el Frontend usa en cada petición para confirmar quién es el usuario y qué puede hacer.

### 🌿 Parcelas
Gestión completa de los lotes o parcelas de la finca: consulta, creación, edición y eliminación. Cada parcela lleva registro de su superficie, cultivo actual y estado.

### 🌱 Siembras
Control del ciclo de siembra: qué variedad se sembró, en qué parcela, cuándo y con qué proveedor. Incluye el registro de inversiones por siembra para calcular el costo real de producción.

### 👷 Trabajadores
Gestión del personal: cargos, salarios y horas laboradas. El módulo incluye el cálculo automático de liquidaciones de nómina proporcionales a las horas trabajadas en el mes.

### 🚜 Maquinaria
Inventario y seguimiento de equipos agrícolas. Registra el tipo de maquinaria, su estado operativo y las fechas de mantenimiento para evitar paros inesperados.

### 🌾 Campañas
Seguimiento de campañas de cosecha de principio a fin. Incluye sub-módulos para:
- **Diario de cosecha**: registro diario de avance (hectáreas cortadas, bultos producidos)
- **Remisiones**: documentos de despacho con datos del conductor, vehículo, ruta, carga y valor del flete

### 🐛 Plagas
Registro de incidentes fitosanitarios con el tipo de plaga, cultivo afectado, nivel de severidad y tratamiento aplicado.

### 💧 Riego
Programación de riegos por parcela o siembra, con historial de fechas y consumo de agua.

### 🧪 Fertilizantes
Control de inventario de productos fertilizantes y registro de cada aplicación. El sistema descuenta el stock automáticamente y alerta cuando un producto se agota.

### 🌱 Semillas
Inventario de semillas disponibles por tipo, cantidad y proveedor.

### 💰 Finanzas
Registro de ingresos (ventas, subsidios) y egresos (insumos, operación, mantenimiento, personal) con resumen mensual automático.

### 📊 Dashboard
Cálculo y entrega de los indicadores clave del panel de control: parcelas activas, trabajadores, balance del mes, campañas en curso y siembras activas.

### 📋 Cambios
Gestión del historial de novedades y actualizaciones del sistema que se muestra en la Landing Page.

### 👤 Usuarios / Propietario
Administración de usuarios del sistema y gestión de roles (admin / propietario).

### 🤖 IA — AgroBot
El módulo más complejo. Expone dos endpoints:
- **`/advice`** — Genera recomendaciones basadas en el contexto del panel (alertas, estadísticas)
- **`/chat`** — Chat conversacional con memoria de historial

---

## 🤖 El Motor de AgroBot

El servicio de IA (`ai.service.js`) contiene toda la inteligencia del chatbot. Su arquitectura permite funcionar en tres modos:

### Modo Heurístico (sin costo, por defecto)
El bot no necesita ninguna API externa. Funciona con tres fuentes:

- **Base de conocimiento local** (`knowledge.json`): información técnica agrícola sobre plagas específicas (sogata, cogollero, piricularia, roya…), tipos de riego, fertilización NPK por cultivo, mantenimiento de maquinaria y más
- **Wikipedia en español**: cuando el bot no encuentra la respuesta en su base de conocimiento, consulta Wikipedia automáticamente con un sistema de caché de 1 hora
- **Datos reales de Oracle**: antes de responder, el bot consulta la base de datos para obtener el contexto real del usuario — sus parcelas, plagas, riegos, finanzas, maquinaria, trabajadores, fertilizantes y semillas

El bot combina las tres fuentes en una sola respuesta: muestra los datos reales del usuario y al mismo tiempo da el consejo técnico relacionado.

### Modo OpenAI / Anthropic (opcional)
Si se configura una clave de API, el bot usa un modelo de lenguaje externo (GPT-4o-mini o Claude Sonnet) para respuestas en lenguaje natural completo.

### Capacidades del bot en cualquier modo
- Detecta si la pregunta es sobre datos del usuario o conocimiento técnico general
- Genera un **plan de acción semanal** priorizado según las alertas reales: riegos vencidos, plagas urgentes, mantenimientos próximos, balance negativo
- Recuerda el contexto de mensajes anteriores para resolver referencias implícitas
- Responde de forma natural a saludos, despedidas, agradecimientos y preguntas casuales
- Acepta texto con o sin tildes, mayúsculas o minúsculas

---

## Base de Datos Oracle — Lo que hay detrás

El esquema de base de datos (`db/schema.sql`) va mucho más allá de tablas simples. Aprovecha las capacidades avanzadas de Oracle con objetos que automatizan la operación:

### Tablas (20)
Organizadas en capas: catálogos de referencia (roles, estados, tipos de semilla, tipos de plaga, tipos de riego, tipos de maquinaria), entidades principales (usuarios, parcelas, trabajadores, maquinaria, proveedores) y tablas transaccionales (ingresos, egresos, campañas, siembras, riegos, plagas, fertilizantes, remisiones).

### Triggers (6)
Reglas automáticas que se ejecutan sin intervención del usuario:
- Descuento de stock al registrar una aplicación de fertilizante — si no hay suficiente, rechaza la operación
- Cambio automático de estado entre "Disponible" y "Agotado" según el stock
- Validación de fechas en el diario de cosecha — no permite registros fuera del rango de la campaña
- Auditoría de cambios en usuarios, parcelas y trabajadores

### Vistas (7)
Consultas precalculadas que el Backend usa para mostrar datos complejos eficientemente:
- Dashboard general con todos los KPIs del usuario
- Resumen financiero agrupado por mes
- Resumen por campaña con producción total y rendimiento en bultos/hectárea
- Alerta de fertilizantes con stock por debajo del mínimo
- Horas trabajadas por empleado (total y mes actual)
- Siembras con inversión acumulada y uso de fertilizantes
- Maquinaria con detalle de tipo, estado y operadores activos

### Procedimientos almacenados (5)
Operaciones complejas ejecutadas directamente en la base de datos:
- Aplicación de fertilizantes en lote (valida stock antes de proceder)
- Registro de jornadas laborales en lote con `FORALL`
- Cierre completo de una campaña (actualiza estados de siembras y parcelas automáticamente)
- Liquidación de nómina mensual proporcional a horas trabajadas
- Sincronización del estado del stock de todos los fertilizantes del usuario

### Funciones (6)
Cálculos especializados reutilizables en toda la base de datos:
- Horas trabajadas por empleado en cualquier rango de fechas
- Balance financiero neto en un período
- Rendimiento de campaña en bultos por hectárea cosechada
- Costo total de nómina de un mes
- Cantidad de parcelas con riego vencido hace más de N días
- Fertilizante con mayor consumo en un período

### Tipos y colecciones PL/SQL (4)
Estructuras de datos propias que permiten pasar listas de registros a los procedimientos en una sola operación, mejorando el rendimiento.

---

## Seguridad

- Autenticación mediante **JWT** en cada petición protegida
- Contraseñas almacenadas con **bcrypt** — nunca en texto plano
- Cabeceras HTTP protegidas con **Helmet**
- CORS configurado para aceptar solo orígenes autorizados
- Conexión a Oracle mediante **wallet mTLS** — estándar de Oracle Autonomous Database

---

## Estructura de carpetas

```
Backend/
├── src/
│   ├── app.js                  → Configuración del servidor Express
│   ├── server.js               → Punto de entrada, inicializa el pool Oracle
│   │
│   ├── config/
│   │   ├── db.js               → Pool de conexiones Oracle
│   │   └── env.js              → Variables de entorno
│   │
│   ├── routes/                 → Un archivo por módulo de la API
│   │   ├── ai.routes.js        → /ai/advice y /ai/chat (AgroBot)
│   │   ├── auth.routes.js
│   │   ├── parcelas.routes.js
│   │   ├── siembras.routes.js
│   │   ├── campanas.routes.js
│   │   ├── fertilizantes.routes.js
│   │   ├── dashboard.routes.js
│   │   └── ...demás módulos
│   │
│   ├── controllers/            → Reciben la petición y delegan al service
│   ├── services/               → Lógica de negocio y consultas Oracle
│   │   └── ai.service.js       → Motor completo del chatbot
│   │
│   ├── middleware/
│   │   ├── requireAuth.js      → Valida JWT en rutas protegidas
│   │   ├── asyncHandler.js     → Manejo de errores async
│   │   └── errorHandler.js     → Respuesta de error centralizada
│   │
│   └── data/
│       └── knowledge.json      → Base de conocimiento agrícola del bot
│
└── db/
    └── schema.sql              → DDL completo: tablas, índices, triggers,
                                  vistas, tipos PL/SQL, procedimientos y funciones
```
