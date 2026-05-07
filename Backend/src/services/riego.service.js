import { query, insertReturningId, toDate } from '../config/db.js';

const SELECT_FIELDS = `
  r.id            AS "id",
  p.nombre        AS "parcela",
  r.tipo          AS "tipo",
  r.consumo_agua  AS "consumoAgua",
  r.ultimo_riego  AS "ultimoRiego",
  r.proximo_riego AS "proximoRiego"
`;

function shape(row) {
  if (!row) return null;
  return { ...row, parcela: row.parcela || '-' };
}

export const riegoService = {
  async list(userId) {
    const result = await query(
      `SELECT ${SELECT_FIELDS}
         FROM riego r
         LEFT JOIN parcelas p ON r.parcela_id = p.id
        WHERE r.usuario_id = :userId
        ORDER BY r.proximo_riego DESC NULLS LAST, r.id DESC`,
      { userId }
    );
    return result.rows.map(shape);
  },

  async create(userId, payload) {
    const {
      tipo = null,
      consumoAgua = null,
      ultimoRiego = null,
      proximoRiego = null,
    } = payload || {};

    const id = await insertReturningId(
      `INSERT INTO riego (tipo, consumo_agua, ultimo_riego, proximo_riego, usuario_id)
       VALUES (:tipo, :consumoAgua, :ultimoRiego, :proximoRiego, :userId)
       RETURNING id INTO :outId`,
      {
        tipo,
        consumoAgua,
        ultimoRiego: toDate(ultimoRiego),
        proximoRiego: toDate(proximoRiego),
        userId,
      }
    );

    return this.getById(userId, id);
  },

  async update(userId, id, changes) {
    const map = {
      tipo: 'tipo',
      consumoAgua: 'consumo_agua',
      ultimoRiego: 'ultimo_riego',
      proximoRiego: 'proximo_riego',
    };
    const dateKeys = new Set(['ultimoRiego', 'proximoRiego']);

    const setParts = [];
    const binds = { userId, id };

    for (const [key, column] of Object.entries(map)) {
      if (key in changes) {
        setParts.push(`${column} = :${key}`);
        binds[key] = dateKeys.has(key) ? toDate(changes[key]) : (changes[key] || null);
      }
    }

    if (!setParts.length) return this.getById(userId, id);

    await query(
      `UPDATE riego SET ${setParts.join(', ')} WHERE usuario_id = :userId AND id = :id`,
      binds
    );

    return this.getById(userId, id);
  },

  async getById(userId, id) {
    const result = await query(
      `SELECT ${SELECT_FIELDS}
         FROM riego r
         LEFT JOIN parcelas p ON r.parcela_id = p.id
        WHERE r.usuario_id = :userId AND r.id = :id`,
      { userId, id }
    );
    return shape(result.rows[0]);
  },

  async remove(userId, id) {
    const result = await query(
      `DELETE FROM riego WHERE usuario_id = :userId AND id = :id`,
      { userId, id }
    );
    return (result.rowsAffected || 0) > 0;
  },
};
