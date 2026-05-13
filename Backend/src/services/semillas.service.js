import { query, insertReturningId, lowercaseRow } from '../config/db.js';

async function upsertTipoSemilla(nombre) {
  if (!nombre) return null;
  const r = await query(`SELECT id AS "id" FROM tipos_semilla WHERE nombre = :nombre`, { nombre });
  if (r.rows[0]) return r.rows[0].id;
  return insertReturningId(
    `INSERT INTO tipos_semilla (nombre) VALUES (:nombre) RETURNING id INTO :outId`,
    { nombre }
  );
}

async function upsertProveedor(nombre, userId) {
  if (!nombre) return null;
  const r = await query(`SELECT id AS "id" FROM proveedores WHERE nombre = :nombre`, { nombre });
  if (r.rows[0]) return r.rows[0].id;
  return insertReturningId(
    `INSERT INTO proveedores (nombre, usuario_id) VALUES (:nombre, :userId) RETURNING id INTO :outId`,
    { nombre, userId }
  );
}

const SELECT_FIELDS = `
  s.id              AS "id",
  ts.nombre         AS "tipo",
  s.cantidad        AS "cantidad",
  pr.nombre         AS "proveedor",
  s.costo           AS "costo",
  s.tipo_semilla_id AS "tipoSemillaId",
  s.proveedor_id    AS "proveedorId",
  s.parcela_id      AS "parcelaId"
`;

const FROM_JOIN = `
  FROM semillas s
  LEFT JOIN tipos_semilla ts ON ts.id = s.tipo_semilla_id
  LEFT JOIN proveedores   pr ON pr.id = s.proveedor_id
`;

export const semillasService = {
  async list(userId) {
    const result = await query(
      `SELECT ${SELECT_FIELDS} ${FROM_JOIN}
        WHERE s.usuario_id = :userId
        ORDER BY s.id DESC`,
      { userId }
    );
    return result.rows;
  },

  async create(userId, payload) {
    const {
      tipo = null,
      cantidad = null,
      proveedor = null,
      costo = 0,
    } = payload || {};

    const tipoSemillaId = await upsertTipoSemilla(tipo);
    const proveedorId   = await upsertProveedor(proveedor, userId);

    const id = await insertReturningId(
      `INSERT INTO semillas (tipo_semilla_id, cantidad, proveedor_id, costo, usuario_id)
       VALUES (:tipoSemillaId, :cantidad, :proveedorId, :costo, :userId)
       RETURNING id INTO :outId`,
      { tipoSemillaId, cantidad, proveedorId, costo, userId }
    );

    return this.getById(userId, id);
  },

  async update(userId, id, changes) {
    const setParts = [];
    const binds = { userId, id };

    if ('cantidad' in changes) {
      setParts.push('cantidad = :cantidad');
      binds.cantidad = changes.cantidad;
    }
    if ('costo' in changes) {
      setParts.push('costo = :costo');
      binds.costo = changes.costo;
    }
    if ('tipo' in changes) {
      binds.tipoSemillaId = await upsertTipoSemilla(changes.tipo);
      setParts.push('tipo_semilla_id = :tipoSemillaId');
    }
    if ('proveedor' in changes) {
      binds.proveedorId = await upsertProveedor(changes.proveedor, userId);
      setParts.push('proveedor_id = :proveedorId');
    }

    if (!setParts.length) return this.getById(userId, id);

    await query(
      `UPDATE semillas SET ${setParts.join(', ')} WHERE usuario_id = :userId AND id = :id`,
      binds
    );

    return this.getById(userId, id);
  },

  async getById(userId, id) {
    const result = await query(
      `SELECT ${SELECT_FIELDS} ${FROM_JOIN}
        WHERE s.usuario_id = :userId AND s.id = :id`,
      { userId, id }
    );
    return result.rows[0] ? lowercaseRow(result.rows[0]) : null;
  },

  async remove(userId, id) {
    const result = await query(
      `DELETE FROM semillas WHERE usuario_id = :userId AND id = :id`,
      { userId, id }
    );
    return (result.rowsAffected || 0) > 0;
  },
};
