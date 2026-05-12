import { query, insertReturningId, toDate } from '../config/db.js';

const ING_FIELDS = `
  id          AS "id",
  concepto    AS "concepto",
  monto       AS "monto",
  fecha       AS "fecha",
  tipo        AS "tipo",
  parcela_id  AS "parcelaId",
  campana_id  AS "campanaId"
`;

const EG_FIELDS = `
  id         AS "id",
  concepto   AS "concepto",
  monto      AS "monto",
  fecha      AS "fecha",
  tipo       AS "tipo",
  categoria  AS "categoria",
  parcela_id AS "parcelaId",
  campana_id AS "campanaId"
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
      campanaId = null,
    } = payload || {};

    const id = await insertReturningId(
      `INSERT INTO ingresos (concepto, monto, fecha, tipo, parcela_id, campana_id, usuario_id)
       VALUES (:concepto, :monto, :fecha, :tipo, :parcelaId, :campanaId, :userId)
       RETURNING id INTO :outId`,
      { concepto, monto, fecha: toDate(fecha), tipo, parcelaId, campanaId, userId }
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
      parcelaId = null,
      campanaId = null,
    } = payload || {};

    const id = await insertReturningId(
      `INSERT INTO egresos (concepto, monto, fecha, tipo, categoria, parcela_id, campana_id, usuario_id)
       VALUES (:concepto, :monto, :fecha, :tipo, :categoria, :parcelaId, :campanaId, :userId)
       RETURNING id INTO :outId`,
      { concepto, monto, fecha: toDate(fecha), tipo, categoria, parcelaId, campanaId, userId }
    );

    const result = await query(
      `SELECT ${EG_FIELDS} FROM egresos WHERE id = :id AND usuario_id = :userId`,
      { id, userId }
    );
    return result.rows[0] || null;
  },
};
