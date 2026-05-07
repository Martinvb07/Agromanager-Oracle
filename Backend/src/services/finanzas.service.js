import { query, insertReturningId, toDate } from '../config/db.js';

const ING_FIELDS = `
  id          AS "id",
  concepto    AS "concepto",
  monto       AS "monto",
  fecha       AS "fecha",
  tipo        AS "tipo",
  parcela_id  AS "parcelaId"
`;

const EG_FIELDS = `
  id         AS "id",
  concepto   AS "concepto",
  monto      AS "monto",
  fecha      AS "fecha",
  tipo       AS "tipo",
  categoria  AS "categoria"
`;

export const finanzasService = {
  async listIngresos(userId) {
    const result = await query(
      `SELECT ${ING_FIELDS}
         FROM ingresos
        WHERE usuario_id = :userId
        ORDER BY fecha DESC, id DESC`,
      { userId }
    );
    return result.rows;
  },

  async listEgresos(userId) {
    const result = await query(
      `SELECT ${EG_FIELDS}
         FROM egresos
        WHERE usuario_id = :userId
        ORDER BY fecha DESC, id DESC`,
      { userId }
    );
    return result.rows;
  },

  async createIngreso(userId, payload) {
    const {
      concepto = null,
      monto = 0,
      fecha = null,
      tipo = null,
      parcelaId = null,
    } = payload || {};

    const id = await insertReturningId(
      `INSERT INTO ingresos (concepto, monto, fecha, tipo, parcela_id, usuario_id)
       VALUES (:concepto, :monto, :fecha, :tipo, :parcelaId, :userId)
       RETURNING id INTO :outId`,
      { concepto, monto, fecha: toDate(fecha), tipo, parcelaId, userId }
    );

    const result = await query(
      `SELECT ${ING_FIELDS} FROM ingresos WHERE id = :id AND usuario_id = :userId`,
      { id, userId }
    );
    return result.rows[0] || null;
  },

  async createEgreso(userId, payload) {
    const {
      concepto = null,
      monto = 0,
      fecha = null,
      tipo = null,
      categoria = null,
    } = payload || {};

    const id = await insertReturningId(
      `INSERT INTO egresos (concepto, monto, fecha, tipo, categoria, usuario_id)
       VALUES (:concepto, :monto, :fecha, :tipo, :categoria, :userId)
       RETURNING id INTO :outId`,
      { concepto, monto, fecha: toDate(fecha), tipo, categoria, userId }
    );

    const result = await query(
      `SELECT ${EG_FIELDS} FROM egresos WHERE id = :id AND usuario_id = :userId`,
      { id, userId }
    );
    return result.rows[0] || null;
  },
};
