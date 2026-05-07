import { query, insertReturningId, toDate } from '../config/db.js';

const SELECT_FIELDS = `
  id          AS "id",
  cultivo     AS "cultivo",
  tipo        AS "tipo",
  severidad   AS "severidad",
  tratamiento AS "tratamiento",
  fecha_detec AS "fechaDetec"
`;

export const plagasService = {
  async list(userId) {
    const result = await query(
      `SELECT ${SELECT_FIELDS}
         FROM plagas
        WHERE usuario_id = :userId
        ORDER BY fecha_detec DESC, id DESC`,
      { userId }
    );
    return result.rows;
  },

  async create(userId, payload) {
    const {
      cultivo = null,
      tipo = null,
      severidad = null,
      tratamiento = null,
      fechaDetec = null,
    } = payload || {};

    const id = await insertReturningId(
      `INSERT INTO plagas (cultivo, tipo, severidad, tratamiento, fecha_detec, usuario_id)
       VALUES (:cultivo, :tipo, :severidad, :tratamiento, :fechaDetec, :userId)
       RETURNING id INTO :outId`,
      { cultivo, tipo, severidad, tratamiento, fechaDetec: toDate(fechaDetec), userId }
    );

    return this.getById(userId, id);
  },

  async update(userId, id, changes) {
    const map = {
      cultivo: 'cultivo',
      tipo: 'tipo',
      severidad: 'severidad',
      tratamiento: 'tratamiento',
      fechaDetec: 'fecha_detec',
    };
    const dateKeys = new Set(['fechaDetec']);

    const setParts = [];
    const binds = { userId, id };

    for (const [key, column] of Object.entries(map)) {
      if (key in changes) {
        setParts.push(`${column} = :${key}`);
        binds[key] = dateKeys.has(key) ? toDate(changes[key]) : changes[key];
      }
    }

    if (!setParts.length) return this.getById(userId, id);

    await query(
      `UPDATE plagas SET ${setParts.join(', ')} WHERE usuario_id = :userId AND id = :id`,
      binds
    );

    return this.getById(userId, id);
  },

  async getById(userId, id) {
    const result = await query(
      `SELECT ${SELECT_FIELDS} FROM plagas WHERE usuario_id = :userId AND id = :id`,
      { userId, id }
    );
    return result.rows[0] || null;
  },

  async remove(userId, id) {
    const result = await query(
      `DELETE FROM plagas WHERE usuario_id = :userId AND id = :id`,
      { userId, id }
    );
    return (result.rowsAffected || 0) > 0;
  },
};
