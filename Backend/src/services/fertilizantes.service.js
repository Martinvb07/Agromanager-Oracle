import { query, insertReturningId, toDate } from '../config/db.js';

const FIELDS = `
  id               AS "id",
  nombre           AS "fertilizante",
  cantidad         AS "dosis",
  fecha_aplicacion AS "fecha",
  estado           AS "estado",
  parcela_nombre   AS "parcela",
  costo            AS "costo"
`;

export const fertilizantesService = {
  async list(userId) {
    const result = await query(
      `SELECT ${FIELDS}
         FROM fertilizantes
        WHERE usuario_id = :userId
        ORDER BY fecha_aplicacion DESC NULLS LAST, id DESC`,
      { userId }
    );
    return result.rows;
  },

  async create(userId, payload) {
    const {
      fertilizante = null,
      dosis = null,
      fecha = null,
      estado = 'Aplicado',
      parcela = null,
      costo = 0,
    } = payload || {};

    const id = await insertReturningId(
      `INSERT INTO fertilizantes
         (nombre, cantidad, fecha_aplicacion, estado, parcela_nombre, costo, usuario_id)
       VALUES (:fertilizante, :dosis, :fecha, :estado, :parcela, :costo, :userId)
       RETURNING id INTO :outId`,
      { fertilizante, dosis, fecha: toDate(fecha), estado, parcela, costo, userId }
    );

    return this.getById(userId, id);
  },

  async update(userId, id, changes) {
    const map = {
      fertilizante: 'nombre',
      dosis: 'cantidad',
      fecha: 'fecha_aplicacion',
      estado: 'estado',
      parcela: 'parcela_nombre',
      costo: 'costo',
    };
    const dateKeys = new Set(['fecha']);

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
      `UPDATE fertilizantes SET ${setParts.join(', ')}
        WHERE usuario_id = :userId AND id = :id`,
      binds
    );

    return this.getById(userId, id);
  },

  async getById(userId, id) {
    const result = await query(
      `SELECT ${FIELDS}
         FROM fertilizantes
        WHERE usuario_id = :userId AND id = :id`,
      { userId, id }
    );
    return result.rows[0] || null;
  },

  async remove(userId, id) {
    const result = await query(
      `DELETE FROM fertilizantes WHERE usuario_id = :userId AND id = :id`,
      { userId, id }
    );
    return (result.rowsAffected || 0) > 0;
  },
};
