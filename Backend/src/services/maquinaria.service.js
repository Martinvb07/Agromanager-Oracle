import { query, insertReturningId, toDate } from '../config/db.js';

const SELECT_FIELDS = `
  id                    AS "id",
  nombre                AS "nombre",
  tipo                  AS "tipo",
  estado                AS "estado",
  ultimo_mantenimiento  AS "ultimoMantenimiento",
  proximo_mantenimiento AS "proximoMantenimiento"
`;

export const maquinariaService = {
  async list(userId) {
    const result = await query(
      `SELECT ${SELECT_FIELDS} FROM maquinaria WHERE usuario_id = :userId ORDER BY id DESC`,
      { userId }
    );
    return result.rows;
  },

  async create(userId, payload) {
    const {
      nombre = null,
      tipo = null,
      estado = 'Operativo',
      ultimoMantenimiento = null,
      proximoMantenimiento = null,
    } = payload || {};

    const id = await insertReturningId(
      `INSERT INTO maquinaria (nombre, tipo, estado, ultimo_mantenimiento, proximo_mantenimiento, usuario_id)
       VALUES (:nombre, :tipo, :estado, :ultimoMantenimiento, :proximoMantenimiento, :userId)
       RETURNING id INTO :outId`,
      {
        nombre,
        tipo,
        estado,
        ultimoMantenimiento: toDate(ultimoMantenimiento),
        proximoMantenimiento: toDate(proximoMantenimiento),
        userId,
      }
    );

    return this.getById(userId, id);
  },

  async update(userId, id, changes) {
    const map = {
      nombre: 'nombre',
      tipo: 'tipo',
      estado: 'estado',
      ultimoMantenimiento: 'ultimo_mantenimiento',
      proximoMantenimiento: 'proximo_mantenimiento',
    };
    const dateKeys = new Set(['ultimoMantenimiento', 'proximoMantenimiento']);

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
      `UPDATE maquinaria SET ${setParts.join(', ')} WHERE usuario_id = :userId AND id = :id`,
      binds
    );

    return this.getById(userId, id);
  },

  async getById(userId, id) {
    const result = await query(
      `SELECT ${SELECT_FIELDS} FROM maquinaria WHERE usuario_id = :userId AND id = :id`,
      { userId, id }
    );
    return result.rows[0] || null;
  },

  async remove(userId, id) {
    const result = await query(
      `DELETE FROM maquinaria WHERE usuario_id = :userId AND id = :id`,
      { userId, id }
    );
    return (result.rowsAffected || 0) > 0;
  },
};
