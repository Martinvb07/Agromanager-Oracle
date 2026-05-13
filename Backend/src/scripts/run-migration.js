import { getPool, closePool } from '../config/db.js';

// Errores que significan "ya está aplicado" → se omiten sin fallar
const SKIP_CODES = new Set([
  1430,  // column already exists
  2275,  // referential constraint already exists
  1408,  // such column list already indexed
  2443,  // constraint does not exist (DROP CONSTRAINT)
  904,   // invalid identifier / column not found (DROP COLUMN)
  2261,  // unique constraint already exists
  955,   // table/view name already used (CREATE TABLE)
  2264,  // constraint name already used
  942,   // table or view does not exist (DROP TABLE)
  4080,  // trigger does not exist (DROP TRIGGER)
]);

const migrations = [

  // ═══════════════════════════════════════════════════════════════════════
  // MIGRACIÓN v1 — parches del esquema original
  // ═══════════════════════════════════════════════════════════════════════

  // ── ingresos: columnas faltantes ───────────────────────────────────────
  `ALTER TABLE ingresos ADD parcela_id NUMBER(10)`,
  `ALTER TABLE ingresos ADD campana_id NUMBER(10)`,
  `ALTER TABLE ingresos ADD CONSTRAINT fk_ingresos_parcela  FOREIGN KEY (parcela_id) REFERENCES parcelas(id)  ON DELETE SET NULL`,
  `ALTER TABLE ingresos ADD CONSTRAINT fk_ingresos_campana  FOREIGN KEY (campana_id) REFERENCES campanas(id)  ON DELETE SET NULL`,
  `ALTER TABLE ingresos ADD CONSTRAINT fk_ingresos_usuario  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)  ON DELETE SET NULL`,

  // ── egresos: columnas faltantes ────────────────────────────────────────
  `ALTER TABLE egresos ADD parcela_id NUMBER(10)`,
  `ALTER TABLE egresos ADD campana_id NUMBER(10)`,
  `ALTER TABLE egresos ADD CONSTRAINT fk_egresos_parcela  FOREIGN KEY (parcela_id) REFERENCES parcelas(id)  ON DELETE SET NULL`,
  `ALTER TABLE egresos ADD CONSTRAINT fk_egresos_campana  FOREIGN KEY (campana_id) REFERENCES campanas(id)  ON DELETE SET NULL`,
  `ALTER TABLE egresos ADD CONSTRAINT fk_egresos_usuario  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)  ON DELETE SET NULL`,

  // ── fertilizantes: quitar columnas de aplicación ───────────────────────
  `ALTER TABLE fertilizantes DROP CONSTRAINT fk_fertilizantes_parcela`,
  `ALTER TABLE fertilizantes DROP COLUMN cantidad`,
  `ALTER TABLE fertilizantes DROP COLUMN fecha_aplicacion`,
  `ALTER TABLE fertilizantes DROP COLUMN parcela_id`,

  // ── plagas: reemplazar tipo+tratamiento por tipo_id (3NF) ──────────────
  `ALTER TABLE plagas ADD tipo_id NUMBER(10)`,
  `ALTER TABLE plagas ADD CONSTRAINT fk_plagas_tipo FOREIGN KEY (tipo_id) REFERENCES tipos_plaga(id) ON DELETE SET NULL`,
  `ALTER TABLE plagas DROP COLUMN tipo`,
  `ALTER TABLE plagas DROP COLUMN tratamiento`,

  // ── remisiones: columnas conductor → conductor_id ──────────────────────
  `ALTER TABLE remisiones ADD conductor_id NUMBER(10)`,
  `ALTER TABLE remisiones ADD CONSTRAINT fk_remisiones_conductor FOREIGN KEY (conductor_id) REFERENCES conductores(id) ON DELETE SET NULL`,
  `ALTER TABLE remisiones DROP COLUMN nombre_conductor`,
  `ALTER TABLE remisiones DROP COLUMN cc_conductor`,
  `ALTER TABLE remisiones DROP COLUMN tel_conductor`,

  // ── índices v1 ─────────────────────────────────────────────────────────
  `CREATE INDEX idx_ingresos_campana      ON ingresos(campana_id)`,
  `CREATE INDEX idx_egresos_parcela       ON egresos(parcela_id)`,
  `CREATE INDEX idx_egresos_campana       ON egresos(campana_id)`,
  `CREATE INDEX idx_remisiones_conductor  ON remisiones(conductor_id)`,
  `CREATE INDEX idx_plagas_tipo_id        ON plagas(tipo_id)`,

  // ── campanas_parcelas: tabla N:M ───────────────────────────────────────
  `CREATE TABLE campanas_parcelas (
    campana_id NUMBER(10) NOT NULL,
    parcela_id NUMBER(10) NOT NULL,
    CONSTRAINT pk_campanas_parcelas PRIMARY KEY (campana_id, parcela_id),
    CONSTRAINT fk_cp_campana FOREIGN KEY (campana_id) REFERENCES campanas(id) ON DELETE CASCADE,
    CONSTRAINT fk_cp_parcela FOREIGN KEY (parcela_id) REFERENCES parcelas(id) ON DELETE CASCADE
  )`,
  `CREATE INDEX idx_campanas_parcelas_p ON campanas_parcelas(parcela_id)`,

  // ── CHECK constraints tipo/categoria ───────────────────────────────────
  `ALTER TABLE ingresos ADD CONSTRAINT chk_ingresos_tipo     CHECK (tipo IN ('Venta', 'Subsidio', 'Préstamo', 'Otro')) ENABLE NOVALIDATE`,
  `ALTER TABLE egresos  ADD CONSTRAINT chk_egresos_tipo      CHECK (tipo IN ('Insumos', 'Operación', 'Mantenimiento', 'Personal', 'Otro')) ENABLE NOVALIDATE`,
  `ALTER TABLE egresos  ADD CONSTRAINT chk_egresos_categoria CHECK (categoria IN ('Fertilizantes', 'Combustible', 'Maquinaria', 'Nómina', 'Transporte', 'Otro') OR categoria IS NULL) ENABLE NOVALIDATE`,

  // ── remisiones: enviado_por_id ─────────────────────────────────────────
  `ALTER TABLE remisiones ADD enviado_por_id NUMBER(10)`,
  `ALTER TABLE remisiones ADD CONSTRAINT fk_remisiones_enviado FOREIGN KEY (enviado_por_id) REFERENCES usuarios(id) ON DELETE SET NULL`,
  `ALTER TABLE remisiones DROP COLUMN enviado_por`,
  `ALTER TABLE remisiones DROP COLUMN enviado_cc`,
  `CREATE INDEX idx_remisiones_enviado ON remisiones(enviado_por_id)`,

  // ═══════════════════════════════════════════════════════════════════════
  // MIGRACIÓN v2.0 — Normalización completa
  // Orden: catálogos → datos iniciales → ADD columnas → DROP columnas viejas
  // ═══════════════════════════════════════════════════════════════════════

  // ── FASE 1A: Tablas de catálogo simples ────────────────────────────────

  `CREATE TABLE roles (
    id          NUMBER(10)    GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    nombre      VARCHAR2(80)  NOT NULL,
    descripcion VARCHAR2(255),
    CONSTRAINT uq_roles_nombre UNIQUE (nombre)
  )`,

  `CREATE TABLE estados (
    id       NUMBER(10)   GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    nombre   VARCHAR2(80) NOT NULL,
    contexto VARCHAR2(80) NOT NULL,
    CONSTRAINT uq_estados UNIQUE (nombre, contexto)
  )`,

  `CREATE TABLE cargos (
    id          NUMBER(10)    GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    nombre      VARCHAR2(120) NOT NULL,
    descripcion VARCHAR2(255),
    CONSTRAINT uq_cargos_nombre UNIQUE (nombre)
  )`,

  `CREATE TABLE tipos_ingreso (
    id          NUMBER(10)    GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    nombre      VARCHAR2(80)  NOT NULL,
    descripcion VARCHAR2(255),
    CONSTRAINT uq_tipos_ingreso UNIQUE (nombre)
  )`,

  `CREATE TABLE tipos_riego (
    id          NUMBER(10)    GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    nombre      VARCHAR2(80)  NOT NULL,
    descripcion VARCHAR2(255),
    CONSTRAINT uq_tipos_riego UNIQUE (nombre)
  )`,

  `CREATE TABLE tipos_semilla (
    id          NUMBER(10)    GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    nombre      VARCHAR2(120) NOT NULL,
    descripcion VARCHAR2(255),
    CONSTRAINT uq_tipos_semilla UNIQUE (nombre)
  )`,

  `CREATE TABLE tipos_maquinaria (
    id          NUMBER(10)    GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    nombre      VARCHAR2(120) NOT NULL,
    descripcion VARCHAR2(255),
    CONSTRAINT uq_tipos_maquinaria UNIQUE (nombre)
  )`,

  `CREATE TABLE estados_maquinaria (
    id          NUMBER(10)    GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    nombre      VARCHAR2(80)  NOT NULL,
    descripcion VARCHAR2(255),
    CONSTRAINT uq_estados_maq UNIQUE (nombre)
  )`,

  `CREATE TABLE ubicaciones (
    id          NUMBER(10)    GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    nombre      VARCHAR2(160) NOT NULL,
    tipo        VARCHAR2(40)  DEFAULT 'Otro' NOT NULL,
    descripcion VARCHAR2(255),
    CONSTRAINT chk_ubicaciones_tipo CHECK (tipo IN ('Finca', 'Planta', 'Bodega', 'Puerto', 'Otro'))
  )`,

  `CREATE TABLE personas (
    id     NUMBER(10)    GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    nombre VARCHAR2(160) NOT NULL,
    cc     VARCHAR2(40),
    tel    VARCHAR2(40),
    tipo   VARCHAR2(40)  DEFAULT 'Otro' NOT NULL,
    CONSTRAINT uq_personas_cc    UNIQUE (cc),
    CONSTRAINT chk_personas_tipo CHECK (tipo IN ('Conductor', 'Propietario', 'Otro'))
  )`,

  // ── FASE 1B: Tablas de entidad nuevas (dependen de catálogos) ──────────

  `CREATE TABLE proveedores (
    id          NUMBER(10)    GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    nombre      VARCHAR2(160) NOT NULL,
    contacto    VARCHAR2(120),
    tel         VARCHAR2(40),
    email       VARCHAR2(160),
    usuario_id  NUMBER(10),
    created_at  TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT fk_proveedores_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
  )`,

  `CREATE TABLE siembras (
    id              NUMBER(10)    GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    parcela_id      NUMBER(10)    NOT NULL,
    tipo_semilla_id NUMBER(10),
    proveedor_id    NUMBER(10),
    fecha_siembra   DATE          NOT NULL,
    cantidad_kg     NUMBER(10,2),
    estado_id       NUMBER(10),
    usuario_id      NUMBER(10),
    created_at      TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT fk_siembras_parcela   FOREIGN KEY (parcela_id)      REFERENCES parcelas(id)      ON DELETE CASCADE,
    CONSTRAINT fk_siembras_semilla   FOREIGN KEY (tipo_semilla_id) REFERENCES tipos_semilla(id) ON DELETE SET NULL,
    CONSTRAINT fk_siembras_proveedor FOREIGN KEY (proveedor_id)    REFERENCES proveedores(id)   ON DELETE SET NULL,
    CONSTRAINT fk_siembras_estado    FOREIGN KEY (estado_id)       REFERENCES estados(id)       ON DELETE SET NULL,
    CONSTRAINT fk_siembras_usuario   FOREIGN KEY (usuario_id)      REFERENCES usuarios(id)      ON DELETE SET NULL
  )`,

  `CREATE TABLE inversiones (
    id          NUMBER(10)    GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    siembra_id  NUMBER(10)    NOT NULL,
    fecha       DATE          NOT NULL,
    descripcion VARCHAR2(255) NOT NULL,
    monto       NUMBER(12,2)  NOT NULL,
    cantidad    NUMBER(10,2),
    usuario_id  NUMBER(10),
    created_at  TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT fk_inversiones_siembra FOREIGN KEY (siembra_id) REFERENCES siembras(id)  ON DELETE CASCADE,
    CONSTRAINT fk_inversiones_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)  ON DELETE SET NULL,
    CONSTRAINT chk_inversiones_monto  CHECK (monto > 0)
  )`,

  `CREATE TABLE horas_laboradas (
    id            NUMBER(10)    GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    trabajador_id NUMBER(10)    NOT NULL,
    fecha         DATE          NOT NULL,
    horas         NUMBER(5,2)   NOT NULL,
    descripcion   VARCHAR2(255),
    usuario_id    NUMBER(10),
    created_at    TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT fk_horas_trabajador FOREIGN KEY (trabajador_id) REFERENCES trabajadores(id) ON DELETE CASCADE,
    CONSTRAINT fk_horas_usuario    FOREIGN KEY (usuario_id)    REFERENCES usuarios(id)     ON DELETE SET NULL,
    CONSTRAINT chk_horas_rango     CHECK (horas > 0 AND horas <= 24)
  )`,

  `CREATE TABLE trabajadores_maquinaria (
    trabajador_id NUMBER(10) NOT NULL,
    maquinaria_id NUMBER(10) NOT NULL,
    fecha_inicio  DATE       NOT NULL,
    fecha_fin     DATE,
    CONSTRAINT pk_trab_maq  PRIMARY KEY (trabajador_id, maquinaria_id, fecha_inicio),
    CONSTRAINT fk_tm_trab   FOREIGN KEY (trabajador_id) REFERENCES trabajadores(id) ON DELETE CASCADE,
    CONSTRAINT fk_tm_maq    FOREIGN KEY (maquinaria_id) REFERENCES maquinaria(id)   ON DELETE CASCADE,
    CONSTRAINT chk_tm_fechas CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio)
  )`,

  // ── FASE 2: Datos iniciales en catálogos (WHERE NOT EXISTS = idempotente) ──

  `INSERT INTO roles (nombre, descripcion) SELECT 'admin',      'Acceso total al sistema'                 FROM dual WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'admin')`,
  `INSERT INTO roles (nombre, descripcion) SELECT 'supervisor', 'Gestión operativa sin configuración'     FROM dual WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'supervisor')`,
  `INSERT INTO roles (nombre, descripcion) SELECT 'operario',   'Registro de actividades de campo'        FROM dual WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'operario')`,

  `INSERT INTO estados (nombre, contexto) SELECT 'Activo',         'usuario'    FROM dual WHERE NOT EXISTS (SELECT 1 FROM estados WHERE nombre = 'Activo'    AND contexto = 'usuario')`,
  `INSERT INTO estados (nombre, contexto) SELECT 'Inactivo',       'usuario'    FROM dual WHERE NOT EXISTS (SELECT 1 FROM estados WHERE nombre = 'Inactivo'  AND contexto = 'usuario')`,
  `INSERT INTO estados (nombre, contexto) SELECT 'Activo',         'trabajador' FROM dual WHERE NOT EXISTS (SELECT 1 FROM estados WHERE nombre = 'Activo'    AND contexto = 'trabajador')`,
  `INSERT INTO estados (nombre, contexto) SELECT 'Inactivo',       'trabajador' FROM dual WHERE NOT EXISTS (SELECT 1 FROM estados WHERE nombre = 'Inactivo'  AND contexto = 'trabajador')`,
  `INSERT INTO estados (nombre, contexto) SELECT 'Suspendido',     'trabajador' FROM dual WHERE NOT EXISTS (SELECT 1 FROM estados WHERE nombre = 'Suspendido' AND contexto = 'trabajador')`,
  `INSERT INTO estados (nombre, contexto) SELECT 'Activa',         'parcela'    FROM dual WHERE NOT EXISTS (SELECT 1 FROM estados WHERE nombre = 'Activa'    AND contexto = 'parcela')`,
  `INSERT INTO estados (nombre, contexto) SELECT 'Inactiva',       'parcela'    FROM dual WHERE NOT EXISTS (SELECT 1 FROM estados WHERE nombre = 'Inactiva'  AND contexto = 'parcela')`,
  `INSERT INTO estados (nombre, contexto) SELECT 'En preparación', 'parcela'    FROM dual WHERE NOT EXISTS (SELECT 1 FROM estados WHERE nombre = 'En preparación' AND contexto = 'parcela')`,
  `INSERT INTO estados (nombre, contexto) SELECT 'Activa',         'siembra'    FROM dual WHERE NOT EXISTS (SELECT 1 FROM estados WHERE nombre = 'Activa'    AND contexto = 'siembra')`,
  `INSERT INTO estados (nombre, contexto) SELECT 'Cosechada',      'siembra'    FROM dual WHERE NOT EXISTS (SELECT 1 FROM estados WHERE nombre = 'Cosechada' AND contexto = 'siembra')`,
  `INSERT INTO estados (nombre, contexto) SELECT 'Perdida',        'siembra'    FROM dual WHERE NOT EXISTS (SELECT 1 FROM estados WHERE nombre = 'Perdida'   AND contexto = 'siembra')`,

  `INSERT INTO estados_maquinaria (nombre) SELECT 'Operativo'          FROM dual WHERE NOT EXISTS (SELECT 1 FROM estados_maquinaria WHERE nombre = 'Operativo')`,
  `INSERT INTO estados_maquinaria (nombre) SELECT 'En mantenimiento'   FROM dual WHERE NOT EXISTS (SELECT 1 FROM estados_maquinaria WHERE nombre = 'En mantenimiento')`,
  `INSERT INTO estados_maquinaria (nombre) SELECT 'Fuera de servicio'  FROM dual WHERE NOT EXISTS (SELECT 1 FROM estados_maquinaria WHERE nombre = 'Fuera de servicio')`,

  `INSERT INTO tipos_ingreso (nombre) SELECT 'Venta'    FROM dual WHERE NOT EXISTS (SELECT 1 FROM tipos_ingreso WHERE nombre = 'Venta')`,
  `INSERT INTO tipos_ingreso (nombre) SELECT 'Subsidio' FROM dual WHERE NOT EXISTS (SELECT 1 FROM tipos_ingreso WHERE nombre = 'Subsidio')`,
  `INSERT INTO tipos_ingreso (nombre) SELECT 'Préstamo' FROM dual WHERE NOT EXISTS (SELECT 1 FROM tipos_ingreso WHERE nombre = 'Préstamo')`,
  `INSERT INTO tipos_ingreso (nombre) SELECT 'Otro'     FROM dual WHERE NOT EXISTS (SELECT 1 FROM tipos_ingreso WHERE nombre = 'Otro')`,

  `INSERT INTO tipos_riego (nombre) SELECT 'Goteo'      FROM dual WHERE NOT EXISTS (SELECT 1 FROM tipos_riego WHERE nombre = 'Goteo')`,
  `INSERT INTO tipos_riego (nombre) SELECT 'Aspersión'  FROM dual WHERE NOT EXISTS (SELECT 1 FROM tipos_riego WHERE nombre = 'Aspersión')`,
  `INSERT INTO tipos_riego (nombre) SELECT 'Gravedad'   FROM dual WHERE NOT EXISTS (SELECT 1 FROM tipos_riego WHERE nombre = 'Gravedad')`,
  `INSERT INTO tipos_riego (nombre) SELECT 'Inundación' FROM dual WHERE NOT EXISTS (SELECT 1 FROM tipos_riego WHERE nombre = 'Inundación')`,

  // ── FASE 3A: usuarios — rol/estado → FKs ──────────────────────────────
  `ALTER TABLE usuarios DROP CONSTRAINT chk_usuarios_rol`,
  `ALTER TABLE usuarios DROP CONSTRAINT chk_usuarios_estado`,
  `ALTER TABLE usuarios ADD rol_id NUMBER(10)`,
  `ALTER TABLE usuarios ADD CONSTRAINT fk_usuarios_rol    FOREIGN KEY (rol_id)    REFERENCES roles(id)   ON DELETE SET NULL`,
  `ALTER TABLE usuarios ADD estado_id NUMBER(10)`,
  `ALTER TABLE usuarios ADD CONSTRAINT fk_usuarios_estado FOREIGN KEY (estado_id) REFERENCES estados(id) ON DELETE SET NULL`,
  `ALTER TABLE usuarios DROP COLUMN rol`,
  `ALTER TABLE usuarios DROP COLUMN estado`,

  // ── FASE 3B: trabajadores — cargo/estado/horas → FKs ──────────────────
  `ALTER TABLE trabajadores DROP CONSTRAINT chk_trabajadores_estado`,
  `ALTER TABLE trabajadores ADD cargo_id NUMBER(10)`,
  `ALTER TABLE trabajadores ADD CONSTRAINT fk_trabajadores_cargo  FOREIGN KEY (cargo_id)  REFERENCES cargos(id)  ON DELETE SET NULL`,
  `ALTER TABLE trabajadores ADD estado_id NUMBER(10)`,
  `ALTER TABLE trabajadores ADD CONSTRAINT fk_trabajadores_estado FOREIGN KEY (estado_id) REFERENCES estados(id) ON DELETE SET NULL`,
  `ALTER TABLE trabajadores DROP COLUMN cargo`,
  `ALTER TABLE trabajadores DROP COLUMN estado`,
  `ALTER TABLE trabajadores DROP COLUMN horas_trabajadas`,

  // ── FASE 3C: parcelas — cultivo/estado/inversion → FKs ────────────────
  `ALTER TABLE parcelas DROP CONSTRAINT chk_parcelas_estado`,
  `ALTER TABLE parcelas ADD tipo_semilla_id NUMBER(10)`,
  `ALTER TABLE parcelas ADD CONSTRAINT fk_parcelas_semilla FOREIGN KEY (tipo_semilla_id) REFERENCES tipos_semilla(id) ON DELETE SET NULL`,
  `ALTER TABLE parcelas ADD estado_id NUMBER(10)`,
  `ALTER TABLE parcelas ADD CONSTRAINT fk_parcelas_estado  FOREIGN KEY (estado_id)       REFERENCES estados(id)       ON DELETE SET NULL`,
  `ALTER TABLE parcelas DROP COLUMN cultivo`,
  `ALTER TABLE parcelas DROP COLUMN estado`,
  `ALTER TABLE parcelas DROP COLUMN inversion`,

  // ── FASE 3D: ingresos — tipo VARCHAR → tipo_id FK ─────────────────────
  `ALTER TABLE ingresos DROP CONSTRAINT chk_ingresos_tipo`,
  `ALTER TABLE ingresos ADD tipo_id NUMBER(10)`,
  `ALTER TABLE ingresos ADD CONSTRAINT fk_ingresos_tipo FOREIGN KEY (tipo_id) REFERENCES tipos_ingreso(id) ON DELETE SET NULL`,
  `ALTER TABLE ingresos DROP COLUMN tipo`,

  // ── FASE 3E: egresos — quitar categoria ───────────────────────────────
  `ALTER TABLE egresos DROP CONSTRAINT chk_egresos_categoria`,
  `ALTER TABLE egresos DROP COLUMN categoria`,

  // ── FASE 3F: maquinaria — tipo/estado → FKs ───────────────────────────
  `ALTER TABLE maquinaria DROP CONSTRAINT chk_maquinaria_estado`,
  `ALTER TABLE maquinaria ADD tipo_id NUMBER(10)`,
  `ALTER TABLE maquinaria ADD CONSTRAINT fk_maquinaria_tipo   FOREIGN KEY (tipo_id)   REFERENCES tipos_maquinaria(id)   ON DELETE SET NULL`,
  `ALTER TABLE maquinaria ADD estado_id NUMBER(10)`,
  `ALTER TABLE maquinaria ADD CONSTRAINT fk_maquinaria_estado FOREIGN KEY (estado_id) REFERENCES estados_maquinaria(id) ON DELETE SET NULL`,
  `ALTER TABLE maquinaria DROP COLUMN tipo`,
  `ALTER TABLE maquinaria DROP COLUMN estado`,

  // ── FASE 3G: semillas — tipo/proveedor → FKs + parcela_id ─────────────
  `ALTER TABLE semillas ADD tipo_semilla_id NUMBER(10)`,
  `ALTER TABLE semillas ADD CONSTRAINT fk_semillas_tipo      FOREIGN KEY (tipo_semilla_id) REFERENCES tipos_semilla(id) ON DELETE SET NULL`,
  `ALTER TABLE semillas ADD proveedor_id NUMBER(10)`,
  `ALTER TABLE semillas ADD CONSTRAINT fk_semillas_proveedor FOREIGN KEY (proveedor_id)    REFERENCES proveedores(id)   ON DELETE SET NULL`,
  `ALTER TABLE semillas ADD parcela_id NUMBER(10)`,
  `ALTER TABLE semillas ADD CONSTRAINT fk_semillas_parcela   FOREIGN KEY (parcela_id)      REFERENCES parcelas(id)      ON DELETE SET NULL`,
  `ALTER TABLE semillas DROP COLUMN tipo`,
  `ALTER TABLE semillas DROP COLUMN proveedor`,

  // ── FASE 3H: riego — tipo → FK + siembra_id ───────────────────────────
  `ALTER TABLE riego ADD tipo_id NUMBER(10)`,
  `ALTER TABLE riego ADD CONSTRAINT fk_riego_tipo    FOREIGN KEY (tipo_id)    REFERENCES tipos_riego(id) ON DELETE SET NULL`,
  `ALTER TABLE riego ADD siembra_id NUMBER(10)`,
  `ALTER TABLE riego ADD CONSTRAINT fk_riego_siembra FOREIGN KEY (siembra_id) REFERENCES siembras(id)   ON DELETE SET NULL`,
  `ALTER TABLE riego DROP COLUMN tipo`,

  // ── FASE 3I: plagas — cultivo VARCHAR → tipo_semilla_id FK ────────────
  `ALTER TABLE plagas ADD tipo_semilla_id NUMBER(10)`,
  `ALTER TABLE plagas ADD CONSTRAINT fk_plagas_semilla FOREIGN KEY (tipo_semilla_id) REFERENCES tipos_semilla(id) ON DELETE SET NULL`,
  `ALTER TABLE plagas DROP COLUMN cultivo`,

  // ── FASE 3J: conductores — persona_id reemplaza cc/nombre/tel ─────────
  `ALTER TABLE conductores ADD persona_id NUMBER(10)`,
  `ALTER TABLE conductores ADD CONSTRAINT fk_conductores_persona FOREIGN KEY (persona_id) REFERENCES personas(id) ON DELETE CASCADE`,
  `ALTER TABLE conductores ADD CONSTRAINT uq_conductores_persona UNIQUE (persona_id)`,
  `ALTER TABLE conductores ADD licencia VARCHAR2(40)`,
  `ALTER TABLE conductores ADD created_at TIMESTAMP DEFAULT SYSTIMESTAMP`,
  `ALTER TABLE conductores DROP CONSTRAINT uq_conductores_cc`,
  `ALTER TABLE conductores DROP COLUMN cc`,
  `ALTER TABLE conductores DROP COLUMN nombre`,
  `ALTER TABLE conductores DROP COLUMN tel`,

  // ── FASE 3K: remisiones — origen/destino VARCHAR → FKs a ubicaciones ──
  `ALTER TABLE remisiones ADD origen_id NUMBER(10)`,
  `ALTER TABLE remisiones ADD CONSTRAINT fk_rem_origen  FOREIGN KEY (origen_id)  REFERENCES ubicaciones(id) ON DELETE SET NULL`,
  `ALTER TABLE remisiones ADD destino_id NUMBER(10)`,
  `ALTER TABLE remisiones ADD CONSTRAINT fk_rem_destino FOREIGN KEY (destino_id) REFERENCES ubicaciones(id) ON DELETE SET NULL`,
  `ALTER TABLE remisiones DROP COLUMN origen`,
  `ALTER TABLE remisiones DROP COLUMN destino`,

  // ── FASE 3L: usos_fertilizante — siembra_id ───────────────────────────
  `ALTER TABLE usos_fertilizante ADD siembra_id NUMBER(10)`,
  `ALTER TABLE usos_fertilizante ADD CONSTRAINT fk_usos_siembra FOREIGN KEY (siembra_id) REFERENCES siembras(id) ON DELETE SET NULL`,

  // ── FASE 4: Índices nuevos ─────────────────────────────────────────────
  `CREATE INDEX idx_usuarios_rol          ON usuarios(rol_id)`,
  `CREATE INDEX idx_usuarios_estado       ON usuarios(estado_id)`,
  `CREATE INDEX idx_proveedores_usuario   ON proveedores(usuario_id)`,
  `CREATE INDEX idx_parcelas_semilla      ON parcelas(tipo_semilla_id)`,
  `CREATE INDEX idx_trabajadores_cargo    ON trabajadores(cargo_id)`,
  `CREATE INDEX idx_horas_trabajador      ON horas_laboradas(trabajador_id, fecha)`,
  `CREATE INDEX idx_horas_usuario         ON horas_laboradas(usuario_id)`,
  `CREATE INDEX idx_ingresos_tipo         ON ingresos(tipo_id)`,
  `CREATE INDEX idx_maquinaria_tipo       ON maquinaria(tipo_id)`,
  `CREATE INDEX idx_maquinaria_estado     ON maquinaria(estado_id)`,
  `CREATE INDEX idx_trab_maq_maquinaria   ON trabajadores_maquinaria(maquinaria_id)`,
  `CREATE INDEX idx_semillas_tipo         ON semillas(tipo_semilla_id)`,
  `CREATE INDEX idx_semillas_parcela      ON semillas(parcela_id)`,
  `CREATE INDEX idx_siembras_parcela      ON siembras(parcela_id, fecha_siembra)`,
  `CREATE INDEX idx_siembras_semilla      ON siembras(tipo_semilla_id)`,
  `CREATE INDEX idx_siembras_usuario      ON siembras(usuario_id)`,
  `CREATE INDEX idx_inversiones_siembra   ON inversiones(siembra_id, fecha)`,
  `CREATE INDEX idx_inversiones_usuario   ON inversiones(usuario_id)`,
  `CREATE INDEX idx_plagas_tipo_semilla   ON plagas(tipo_semilla_id)`,
  `CREATE INDEX idx_riego_siembra         ON riego(siembra_id)`,
  `CREATE INDEX idx_riego_tipo            ON riego(tipo_id)`,
  `CREATE INDEX idx_usos_siembra          ON usos_fertilizante(siembra_id)`,
  `CREATE INDEX idx_conductores_persona   ON conductores(persona_id)`,
  `CREATE INDEX idx_remisiones_origen     ON remisiones(origen_id)`,
  `CREATE INDEX idx_remisiones_destino    ON remisiones(destino_id)`,

  // ── FASE 5: Eliminar tabla cambios ─────────────────────────────────────
  // IMPORTANTE: actualizar/quitar las rutas del backend antes de correr esto
  `DROP TRIGGER trg_alerta_plaga_alta`,
  `DROP TABLE cambios`,

];

async function main() {
  console.log(`Ejecutando ${migrations.length} migraciones...\n`);

  const pool = await getPool();
  const conn = await pool.getConnection();

  let ok = 0, skipped = 0, errors = 0;

  for (const sql of migrations) {
    const preview = sql.slice(0, 80).replace(/\s+/g, ' ');
    try {
      await conn.execute(sql);
      console.log(`  OK    ${preview}`);
      ok++;
    } catch (err) {
      if (SKIP_CODES.has(err.errorNum)) {
        console.log(`  SKIP  ${preview}`);
        skipped++;
      } else {
        console.error(`  ERROR [ORA-${err.errorNum}] ${err.message.split('\n')[0]}`);
        console.error(`        → ${preview}`);
        errors++;
      }
    }
  }

  await conn.close();
  await closePool();

  console.log(`\n=== Resultado ===`);
  console.log(`  OK:      ${ok}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Errores: ${errors}`);

  if (errors > 0) process.exit(1);
}

main().catch(async err => {
  console.error(err);
  try { await closePool(); } catch (_) {}
  process.exit(1);
});
