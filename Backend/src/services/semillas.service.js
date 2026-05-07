import { query, insertReturningId, lowercaseRow, lowercaseRows } from '../config/db.js';

export const semillasService = {
  async list(userId) {
    const result = await query(
      `SELECT id, tipo, cantidad, proveedor, costo
         FROM semillas
        WHERE usuario_id = :userId
        ORDER BY id DESC`,
      { userId }
    );
    return lowercaseRows(result.rows);
  },

  async create(userId, payload) {
    const {
      tipo = null,
      cantidad = null,
      proveedor = null,
      costo = 0,
    } = payload || {};

    const id = await insertReturningId(
      `INSERT INTO semillas (tipo, cantidad, proveedor, costo, usuario_id)
       VALUES (:tipo, :cantidad, :proveedor, :costo, :userId)
       RETURNING id INTO :outId`,
      { tipo, cantidad, proveedor, costo, userId }
    );

    return this.getById(userId, id);
  },

  async update(userId, id, changes) {
    const allowed = ['tipo', 'cantidad', 'proveedor', 'costo'];
    const setParts = [];
    const binds = { userId, id };

    for (const key of allowed) {
      if (key in changes) {
        setParts.push(`${key} = :${key}`);
        binds[key] = changes[key];
      }
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
      `SELECT id, tipo, cantidad, proveedor, costo
         FROM semillas
        WHERE usuario_id = :userId AND id = :id`,
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
