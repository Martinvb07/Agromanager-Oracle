import { getPool, closePool } from '../config/db.js';

// Errores que significan "ya está aplicado" → se omiten sin fallar
const SKIP_CODES = new Set([
  1430,  // column already exists
  2275,  // referential constraint already exists
  1408,  // such column list already indexed
  2443,  // constraint does not exist (al intentar DROP)
  904,   // invalid identifier (columna no existe al intentar DROP)
  2261,  // unique constraint already exists
  955,   // table/view name already used
  2264,  // constraint name already used
]);

const migrations = [
  // ── ingresos: columnas faltantes del esquema original ──────────────
  `ALTER TABLE ingresos ADD parcela_id NUMBER(10)`,
  `ALTER TABLE ingresos ADD campana_id NUMBER(10)`,
  `ALTER TABLE ingresos ADD CONSTRAINT fk_ingresos_parcela  FOREIGN KEY (parcela_id) REFERENCES parcelas(id)  ON DELETE SET NULL`,
  `ALTER TABLE ingresos ADD CONSTRAINT fk_ingresos_campana  FOREIGN KEY (campana_id) REFERENCES campanas(id)  ON DELETE SET NULL`,
  `ALTER TABLE ingresos ADD CONSTRAINT fk_ingresos_usuario  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)  ON DELETE SET NULL`,

  // ── egresos: columnas faltantes del esquema original ───────────────
  `ALTER TABLE egresos ADD parcela_id NUMBER(10)`,
  `ALTER TABLE egresos ADD campana_id NUMBER(10)`,
  `ALTER TABLE egresos ADD CONSTRAINT fk_egresos_parcela  FOREIGN KEY (parcela_id) REFERENCES parcelas(id)  ON DELETE SET NULL`,
  `ALTER TABLE egresos ADD CONSTRAINT fk_egresos_campana  FOREIGN KEY (campana_id) REFERENCES campanas(id)  ON DELETE SET NULL`,
  `ALTER TABLE egresos ADD CONSTRAINT fk_egresos_usuario  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)  ON DELETE SET NULL`,

  // ── fertilizantes: quitar columnas de aplicación (3NF) ─────────────
  `ALTER TABLE fertilizantes DROP CONSTRAINT fk_fertilizantes_parcela`,
  `ALTER TABLE fertilizantes DROP COLUMN cantidad`,
  `ALTER TABLE fertilizantes DROP COLUMN fecha_aplicacion`,
  `ALTER TABLE fertilizantes DROP COLUMN parcela_id`,

  // ── plagas: reemplazar tipo+tratamiento por tipo_id (3NF) ───────────
  `ALTER TABLE plagas ADD tipo_id NUMBER(10)`,
  `ALTER TABLE plagas ADD CONSTRAINT fk_plagas_tipo FOREIGN KEY (tipo_id) REFERENCES tipos_plaga(id) ON DELETE SET NULL`,
  `ALTER TABLE plagas DROP COLUMN tipo`,
  `ALTER TABLE plagas DROP COLUMN tratamiento`,

  // ── remisiones: reemplazar columnas conductor por conductor_id (3NF) ─
  `ALTER TABLE remisiones ADD conductor_id NUMBER(10)`,
  `ALTER TABLE remisiones ADD CONSTRAINT fk_remisiones_conductor FOREIGN KEY (conductor_id) REFERENCES conductores(id) ON DELETE SET NULL`,
  `ALTER TABLE remisiones DROP COLUMN nombre_conductor`,
  `ALTER TABLE remisiones DROP COLUMN cc_conductor`,
  `ALTER TABLE remisiones DROP COLUMN tel_conductor`,

  // ── índices para las nuevas columnas ───────────────────────────────
  `CREATE INDEX idx_ingresos_campana      ON ingresos(campana_id)`,
  `CREATE INDEX idx_egresos_parcela       ON egresos(parcela_id)`,
  `CREATE INDEX idx_egresos_campana       ON egresos(campana_id)`,
  `CREATE INDEX idx_remisiones_conductor  ON remisiones(conductor_id)`,
  `CREATE INDEX idx_plagas_tipo_id        ON plagas(tipo_id)`,

  // ── campanas_parcelas: tabla N:M ───────────────────────────────────
  `CREATE TABLE campanas_parcelas (campana_id NUMBER(10) NOT NULL, parcela_id NUMBER(10) NOT NULL, CONSTRAINT pk_campanas_parcelas PRIMARY KEY (campana_id, parcela_id), CONSTRAINT fk_cp_campana FOREIGN KEY (campana_id) REFERENCES campanas(id) ON DELETE CASCADE, CONSTRAINT fk_cp_parcela FOREIGN KEY (parcela_id) REFERENCES parcelas(id) ON DELETE CASCADE)`,
  `CREATE INDEX idx_campanas_parcelas_p ON campanas_parcelas(parcela_id)`,

  // ── CHECK constraints tipo/categoria (NOVALIDATE = no valida filas existentes) ─
  `ALTER TABLE ingresos ADD CONSTRAINT chk_ingresos_tipo CHECK (tipo IN ('Venta', 'Subsidio', 'Préstamo', 'Otro')) ENABLE NOVALIDATE`,
  `ALTER TABLE egresos  ADD CONSTRAINT chk_egresos_tipo  CHECK (tipo IN ('Insumos', 'Operación', 'Mantenimiento', 'Personal', 'Otro')) ENABLE NOVALIDATE`,
  `ALTER TABLE egresos  ADD CONSTRAINT chk_egresos_categoria CHECK (categoria IN ('Fertilizantes', 'Combustible', 'Maquinaria', 'Nómina', 'Transporte', 'Otro') OR categoria IS NULL) ENABLE NOVALIDATE`,

  // ── remisiones: enviado_por_id como FK a usuarios ─────────────────
  `ALTER TABLE remisiones ADD enviado_por_id NUMBER(10)`,
  `ALTER TABLE remisiones ADD CONSTRAINT fk_remisiones_enviado FOREIGN KEY (enviado_por_id) REFERENCES usuarios(id) ON DELETE SET NULL`,
  `ALTER TABLE remisiones DROP COLUMN enviado_por`,
  `ALTER TABLE remisiones DROP COLUMN enviado_cc`,
  `CREATE INDEX idx_remisiones_enviado ON remisiones(enviado_por_id)`,
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
