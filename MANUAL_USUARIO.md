# Manual de Usuario — AgroManager
**Sistema Integral de Gestión Agrícola**

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Requisitos para usar el sistema](#2-requisitos-para-usar-el-sistema)
3. [Inicio de sesión](#3-inicio-de-sesión)
4. [Navegación general](#4-navegación-general)
5. [Dashboard — Panel de Control](#5-dashboard--panel-de-control)
6. [Módulo: Parcelas](#6-módulo-parcelas)
7. [Módulo: Personal](#7-módulo-personal)
8. [Módulo: Finanzas](#8-módulo-finanzas)
9. [Módulo: Maquinaria](#9-módulo-maquinaria)
10. [Módulo: Campañas Agrícolas](#10-módulo-campañas-agrícolas)
11. [Módulo: Semillas](#11-módulo-semillas)
12. [Módulo: Plagas](#12-módulo-plagas)
13. [Módulo: Riego](#13-módulo-riego)
14. [Módulo: Fertilizantes](#14-módulo-fertilizantes)
15. [Módulo: Reportes](#15-módulo-reportes)
16. [Perfil de usuario y cierre de sesión](#16-perfil-de-usuario-y-cierre-de-sesión)
17. [Preguntas frecuentes](#17-preguntas-frecuentes)

---

## 1. Introducción

**AgroManager** es un sistema de gestión agrícola diseñado para centralizar y digitalizar la administración de una explotación agrícola. Permite controlar en tiempo real:

- Parcelas y cultivos activos
- Personal y liquidaciones de nómina
- Ingresos y egresos financieros
- Maquinaria y mantenimientos
- Campañas agrícolas con diario de cosecha y remisiones
- Inventario de semillas
- Control de plagas
- Programación de riego
- Aplicaciones de fertilizantes

Toda la información se guarda de forma segura en **Oracle Cloud Database**, lo que garantiza disponibilidad y respaldo de los datos.

---

## 2. Requisitos para usar el sistema

| Elemento | Requisito |
|---|---|
| Navegador | Google Chrome, Firefox, Edge o Safari (versión reciente) |
| Conexión a internet | Requerida para sincronizar con la base de datos |
| Dispositivo | Computador de escritorio, portátil, tablet o celular |
| Credenciales | Usuario y contraseña proporcionados por el administrador |

> **Nota:** El sistema es completamente responsivo. Funciona tanto en computador como en celular.

---

## 3. Inicio de sesión

1. Abra su navegador y escriba la dirección del sistema (ejemplo: `http://localhost:5173` en entorno local, o la URL de producción que le hayan dado).
2. Aparecerá la pantalla de **inicio de sesión**.
3. Ingrese su **correo electrónico** y su **contraseña**.
4. Haga clic en el botón **Ingresar**.

![Pantalla de login](docs/login-placeholder.png)

> Si no recuerda su contraseña, contacte al administrador del sistema.

**Credenciales de ejemplo (entorno de prueba):**

| Campo | Valor |
|---|---|
| Correo | admin@agromanager.com |
| Contraseña | Proporcionada por el administrador |

---

## 4. Navegación general

Al ingresar al sistema verá la interfaz principal dividida en dos áreas:

```
┌─────────────────┬──────────────────────────────────────┐
│   MENÚ LATERAL  │                                      │
│                 │         CONTENIDO PRINCIPAL          │
│  🌱 AgroManager │                                      │
│                 │                                      │
│  📊 Dashboard   │                                      │
│  📍 Parcelas    │                                      │
│  👥 Personal    │                                      │
│  💰 Finanzas    │                                      │
│  🚛 Maquinaria  │                                      │
│  📅 Campañas    │                                      │
│  🌱 Semillas    │                                      │
│  🐛 Plagas      │                                      │
│  💧 Riego       │                                      │
│  🍃 Fertiliz.   │                                      │
│  📄 Reportes    │                                      │
│                 │                                      │
│  👤 Usuario     │                                      │
│  Cerrar sesión  │                                      │
└─────────────────┴──────────────────────────────────────┘
```

### En computador (escritorio)
- El **menú lateral** está siempre visible a la izquierda.
- Haga clic en cualquier opción del menú para cambiar de módulo.
- La opción activa aparece resaltada en color morado.

### En celular o tablet
- El menú lateral se oculta automáticamente.
- Aparece una **barra superior** con el botón ☰ (tres líneas) en la esquina superior izquierda.
- Toque ☰ para abrir el menú lateral como un panel deslizante.
- Toque cualquier opción del menú para navegar. El panel se cerrará automáticamente.
- Toque fuera del menú (zona oscurecida) para cerrarlo sin navegar.

---

## 5. Dashboard — Panel de Control

El Dashboard es la pantalla de inicio. Muestra un resumen rápido del estado actual de la finca.

### Tarjetas de estadísticas

| Tarjeta | Qué muestra |
|---|---|
| **Parcelas Activas** | Número de parcelas en estado "Activa" |
| **Trabajadores** | Total de trabajadores registrados |
| **Ingresos (mes)** | Suma de ingresos del mes actual |
| **Egresos (mes)** | Suma de egresos del mes actual |
| **Maquinarias** | Equipos en estado "Operativo" |

### Últimas Transacciones
Lista los ingresos y egresos más recientes registrados en el sistema.

### Alertas y Notificaciones
Muestra avisos importantes como:
- Maquinaria en mantenimiento pendiente
- Plagas detectadas recientemente
- Riegos programados próximos

### Asistente IA
En la parte inferior del Dashboard encontrará el **Asistente de IA** de AgroManager, que puede responder preguntas sobre gestión agrícola.

---

## 6. Módulo: Parcelas

Gestiona las parcelas o lotes de terreno de la finca.

### Ver parcelas
Al ingresar al módulo verá todas las parcelas registradas en forma de tarjetas, con información de:
- Nombre de la parcela
- Hectáreas
- Inversión registrada
- Cultivo actual
- Estado (Activa / En preparación / Cosechada)

### Registrar una nueva parcela

1. Haga clic en el botón **+ Nueva Parcela** (esquina superior derecha).
2. Complete el formulario:

| Campo | Descripción | Ejemplo |
|---|---|---|
| **Nombre** | Identificador de la parcela | Parcela Norte A |
| **Hectáreas** | Extensión en hectáreas | 12.5 |
| **Cultivo actual** | Qué se está cultivando | Maíz |
| **Estado** | Estado actual del lote | Activa |
| **Inversión inicial** | Monto invertido en COP | 5000000 |

3. Haga clic en **Guardar**.

### Editar una parcela
1. En la tarjeta de la parcela, haga clic en **Editar**.
2. Modifique los campos que necesite.
3. Haga clic en **Guardar**.

### Ver detalles de una parcela
Haga clic en **Ver detalles** para ver toda la información de la parcela en un panel emergente.

### Estados de parcela

| Estado | Significado |
|---|---|
| **Activa** | En producción o con cultivo activo |
| **En preparación** | Lista para sembrar, sin cultivo aún |
| **Cosechada** | Cosecha finalizada |

---

## 7. Módulo: Personal

Administra los trabajadores de la finca y genera liquidaciones.

### Ver trabajadores
Se muestra una tabla con todos los trabajadores y sus datos principales: nombre, cargo, salario, horas trabajadas y estado.

### Agregar un trabajador

1. Haga clic en **+ Agregar Trabajador**.
2. Complete el formulario:

| Campo | Descripción | Ejemplo |
|---|---|---|
| **Nombre** | Nombre completo | Juan Pérez |
| **Cargo** | Rol en la finca | Operario |
| **Salario mensual** | Salario base en COP | 1500000 |
| **Horas trabajadas** | Horas del período | 160 |
| **Estado** | Activo / Inactivo | Activo |

3. Haga clic en **Guardar**.

### Editar un trabajador
1. En la fila del trabajador, haga clic en **Editar**.
2. Modifique los datos y haga clic en **Guardar**.

### Eliminar un trabajador
1. Haga clic en **Eliminar** en la fila del trabajador.
2. Confirme la acción en el diálogo que aparece.

### Calcular liquidación

1. Haga clic en **Liquidar** en la fila del trabajador.
2. El sistema calculará automáticamente:
   - Salario bruto
   - Horas extras (si trabajó más de 160 horas)
   - Deducciones (12% del salario bruto)
   - **Salario neto a pagar**
3. Puede hacer clic en **Registrar en egresos** para guardar automáticamente la liquidación como un egreso en el módulo de Finanzas.

---

## 8. Módulo: Finanzas

Registra y consulta todos los movimientos financieros de la finca.

### Resumen financiero
En la parte superior se muestran tres totales:
- **Total Ingresos** acumulados
- **Total Egresos** acumulados
- **Balance** (Ingresos − Egresos)

### Registrar un ingreso

1. En la sección **Ingresos**, haga clic en **+ Nuevo Ingreso**.
2. Complete el formulario:

| Campo | Descripción | Ejemplo |
|---|---|---|
| **Concepto** | Descripción del ingreso | Venta cosecha maíz |
| **Monto** | Valor en COP | 5000000 |
| **Fecha** | Fecha del ingreso | 2026-05-06 |
| **Tipo** | Clasificación | Venta |

3. Haga clic en **Guardar**.

### Registrar un egreso

1. En la sección **Egresos**, haga clic en **+ Nuevo Egreso**.
2. Complete el formulario:

| Campo | Descripción | Ejemplo |
|---|---|---|
| **Concepto** | Descripción del gasto | Compra fertilizante |
| **Monto** | Valor en COP | 800000 |
| **Fecha** | Fecha del egreso | 2026-05-06 |
| **Tipo** | Clasificación | Insumos |
| **Categoría** | Subcategoría | Fertilizantes |

3. Haga clic en **Guardar**.

> **Consejo:** Los egresos de liquidaciones de personal se registran automáticamente desde el módulo de Personal al hacer clic en "Registrar en egresos".

---

## 9. Módulo: Maquinaria

Controla el inventario de maquinaria y el estado de mantenimientos.

### Registrar un equipo

1. Haga clic en **+ Registrar Maquinaria**.
2. Complete el formulario:

| Campo | Descripción | Ejemplo |
|---|---|---|
| **Nombre** | Nombre del equipo | Tractor Kubota M7151 |
| **Tipo** | Categoría del equipo | Tractor |
| **Estado** | Estado actual | Operativo |
| **Último mantenimiento** | Fecha del último servicio | 2026-01-15 |
| **Próximo mantenimiento** | Fecha del siguiente servicio | 2026-07-15 |

3. Haga clic en **Guardar**.

### Estados de maquinaria

| Estado | Significado |
|---|---|
| **Operativo** | Funcionando correctamente |
| **Mantenimiento** | En revisión o servicio técnico |
| **Fuera de servicio** | Dañado o inactivo indefinidamente |

> **Consejo:** El Dashboard mostrará una alerta cuando algún equipo esté en estado "Mantenimiento".

### Editar o eliminar
Use los botones **Editar** y **Eliminar** dentro de cada tarjeta de maquinaria.

---

## 10. Módulo: Campañas Agrícolas

Las campañas permiten registrar y hacer seguimiento completo de cada ciclo de producción.

### Crear una campaña

1. Haga clic en **+ Nueva Campaña**.
2. Complete los datos:

| Campo | Descripción |
|---|---|
| **Nombre** | Identificador de la campaña |
| **Fecha de inicio** | Inicio del ciclo productivo |
| **Fecha de fin** | Finalización estimada |
| **Hectáreas** | Área total involucrada |
| **Lotes** | Número de lotes |
| **Inversión total** | Inversión proyectada en COP |
| **Gastos operativos** | Costos operativos en COP |
| **Ingreso total** | Ingresos esperados o reales |
| **Rendimiento por ha** | Toneladas por hectárea |
| **Producción total** | Producción total en toneladas |

3. Haga clic en **Guardar**.

### Diario de cosecha y remisiones
Al hacer clic en **Ver / Editar** dentro de una campaña, accederá a la vista detallada donde puede:

- Registrar el **diario de cosecha** diario (hectáreas cortadas, bultos)
- Generar **remisiones de transporte** con datos del conductor, vehículo, origen, destino y firma digital

---

## 11. Módulo: Semillas

Administra el inventario de semillas disponibles en la finca.

### Agregar semillas

1. Haga clic en **+ Agregar Semilla**.
2. Complete el formulario:

| Campo | Descripción | Ejemplo |
|---|---|---|
| **Tipo de semilla** | Variedad o nombre comercial | Maíz Híbrido DK7088 |
| **Cantidad** | Cantidad disponible (kg, unidades) | 500 |
| **Costo** | Valor pagado en COP | 350000 |
| **Proveedor** | Casa comercial proveedora | AgroSemillas SA |

3. Haga clic en **Guardar**.

### Editar o eliminar
Use los botones **Editar** y **Eliminar** en la fila correspondiente.

---

## 12. Módulo: Plagas

Registra y hace seguimiento a las plagas detectadas en los cultivos.

### Registrar una plaga

1. Haga clic en **+ Registrar Plaga**.
2. Complete el formulario:

| Campo | Descripción | Ejemplo |
|---|---|---|
| **Cultivo afectado** | Cultivo donde se detectó | Maíz |
| **Tipo de plaga** | Nombre de la plaga | Cogollero |
| **Severidad** | Nivel de afectación | Medio |
| **Fecha detección** | Cuándo se detectó | 2026-05-06 |
| **Tratamiento** | Medida de control aplicada | Clorpirifos 2L/ha |

3. Haga clic en **Guardar**.

### Niveles de severidad

| Nivel | Descripción |
|---|---|
| **Bajo** | Presencia mínima, vigilancia preventiva |
| **Medio** | Afectación moderada, tratamiento recomendado |
| **Alto** | Afectación grave, acción inmediata requerida |

> **Consejo:** Las plagas activas aparecerán como alertas en el Dashboard.

---

## 13. Módulo: Riego

Programa y registra los eventos de riego de la finca.

### Programar un riego

1. Haga clic en **+ Programar Riego**.
2. Complete el formulario:

| Campo | Descripción | Ejemplo |
|---|---|---|
| **Tipo de riego** | Sistema utilizado | Goteo / Aspersión |
| **Consumo de agua** | Volumen aproximado | 25000 L |
| **Último riego** | Fecha del riego anterior | 2026-05-01 |
| **Próximo riego** | Fecha programada del siguiente | 2026-05-08 |

3. Haga clic en **Guardar**.

> **Consejo:** El Dashboard mostrará una alerta cuando haya un riego programado próximo.

### Editar o eliminar
Use los botones **Editar** y **Eliminar** en la fila correspondiente.

---

## 14. Módulo: Fertilizantes

Lleva el control de las aplicaciones de fertilizantes realizadas.

### Registrar una aplicación

1. Haga clic en **+ Nueva Aplicación**.
2. Complete el formulario:

| Campo | Descripción | Ejemplo |
|---|---|---|
| **Parcela** | Dónde se aplicó | Parcela Norte A |
| **Fertilizante** | Producto aplicado | NPK 15-15-15 |
| **Dosis** | Cantidad aplicada | 2000 kg |
| **Fecha de aplicación** | Cuándo se realizó | 2026-05-06 |
| **Estado** | Estado de la aplicación | Aplicado |

3. Haga clic en **Guardar**.

### Estados de aplicación

| Estado | Significado |
|---|---|
| **Aplicado** | Ya se realizó la aplicación |
| **Programado** | Está pendiente de realizar |
| **Cancelado** | Se canceló la aplicación |

### Editar o eliminar
Use los botones **Editar** y **Eliminar** en la fila correspondiente.

---

## 15. Módulo: Reportes

El módulo de Reportes está diseñado para generar documentos y resúmenes exportables del estado de la finca.

> **Nota:** Este módulo se encuentra en desarrollo activo. Las funcionalidades de exportación estarán disponibles en próximas versiones.

---

## 16. Perfil de usuario y cierre de sesión

### Ver información de perfil

**En computador:**
- En la parte inferior del menú lateral, haga clic sobre su nombre de usuario.
- Se abrirá un panel con su nombre, correo electrónico y rol.

**En celular:**
- Toque el ícono ⚙️ en la barra superior derecha.
- Se abrirá el panel de información de usuario.

### Cerrar sesión

**En computador:**
- En la parte inferior del menú lateral, haga clic en **Cerrar sesión**.

**En celular:**
- Abra el menú lateral tocando ☰.
- En la parte inferior, haga clic en **Cerrar sesión**.

El sistema le pedirá confirmación antes de cerrar la sesión.

---

## 17. Preguntas frecuentes

**¿Qué pasa si ingreso datos incorrectos?**
Puede editar cualquier registro en cualquier momento usando el botón **Editar** correspondiente.

**¿Los datos se guardan automáticamente?**
No. Debe hacer clic en el botón **Guardar** dentro de cada formulario para que los datos queden guardados en la base de datos.

**¿Puedo usar el sistema desde el celular?**
Sí. El sistema está diseñado para funcionar en dispositivos móviles. Use el botón ☰ para abrir el menú de navegación.

**¿Qué significa el error "Error 401"?**
Significa que su sesión expiró. Cierre el navegador y vuelva a iniciar sesión.

**¿Puedo eliminar un registro por error?**
Los registros eliminados no se pueden recuperar directamente. Antes de eliminar, el sistema siempre pide confirmación. Si eliminó algo por error, deberá registrarlo nuevamente.

**¿Quién puede crear nuevos usuarios?**
Solo el usuario con rol **Owner** (propietario) puede crear, editar y desactivar cuentas de usuario desde el panel de administración.

**¿Dónde veo el total de dinero de la finca?**
En el módulo **Finanzas**, en la parte superior aparecen los totales de ingresos, egresos y el balance general.

**¿Cómo sé qué maquinaria necesita mantenimiento?**
El **Dashboard** muestra una alerta automática si hay maquinaria en estado "Mantenimiento". También puede verificarlo directamente en el módulo **Maquinaria**.

---

*AgroManager — Sistema Integral de Gestión Agrícola*
*Versión 0.2.0 — Mayo 2026*
