import { query, insertReturningId, lowercaseRow, lowercaseRows } from '../config/db.js';

export const parcelasService = {
  async list(userId) {
    const result = await query(
      `SELECT id, nombre, hectareas, cultivo, estado, inversion
         FROM parcelas
        WHERE usuario_id = :userId
        ORDER BY id DESC`,
      { userId }
    );
    return lowercaseRows(result.rows);
  },

  async create(userId, payload) {
    const {
      nombre = null,
      hectareas = null,
      cultivo = null,
      estado = 'Activa',
      inversion = 0,
    } = payload || {};

    const id = await insertReturningId(
      `INSERT INTO parcelas (nombre, hectareas, cultivo, estado, inversion, usuario_id)
       VALUES (:nombre, :hectareas, :cultivo, :estado, :inversion, :userId)
       RETURNING id INTO :outId`,
      { nombre, hectareas, cultivo, estado, inversion, userId }
    );

    return this.getById(userId, id);
  },

  async getById(userId, id) {
    const result = await query(
      `SELECT id, nombre, hectareas, cultivo, estado, inversion
         FROM parcelas
        WHERE id = :id AND usuario_id = :userId`,
      { id, userId }
    );
    return result.rows[0] ? lowercaseRow(result.rows[0]) : null;
  },

  async update(userId, id, changes) {
    const allowed = ['nombre', 'hectareas', 'cultivo', 'estado', 'inversion'];
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
      `UPDATE parcelas SET ${setParts.join(', ')} WHERE usuario_id = :userId AND id = :id`,
      binds
    );

    return this.getById(userId, id);
  },

  async remove(userId, id) {
    const result = await query(
      `DELETE FROM parcelas WHERE usuario_id = :userId AND id = :id`,
      { userId, id }
    );
    return (result.rowsAffected || 0) > 0;
  },
};
