import { query, insertReturningId, toDate } from '../config/db.js';
import oracledb from 'oracledb';

const ING_FIELDS = `
  i.id         AS "id",
  i.concepto   AS "concepto",
  i.monto      AS "monto",
  i.fecha      AS "fecha",
  ti.nombre    AS "tipo",
  i.parcela_id AS "parcelaId",
  i.campana_id AS "campanaId"
`;

const EG_FIELDS = `
  id         AS "id",
  concepto   AS "concepto",
  monto      AS "monto",
  fecha      AS "fecha",
  tipo       AS "tipo",
  parcela_id AS "parcelaId",
  campana_id AS "campanaId"
`;

export const finanzasService = {
  async listIngresos(userId) {
    const result = await query(
      `SELECT ${ING_FIELDS}
         FROM ingresos i
         LEFT JOIN tipos_ingreso ti ON ti.id = i.tipo_id
        WHERE i.usuario_id = :userId
        ORDER BY i.fecha DESC, i.id DESC`,
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
      `INSERT INTO ingresos (concepto, monto, fecha, tipo_id, parcela_id, campana_id, usuario_id)
       VALUES (:concepto, :monto, :fecha,
               (SELECT id FROM tipos_ingreso WHERE nombre = :tipo),
               :parcelaId, :campanaId, :userId)
       RETURNING id INTO :outId`,
      { concepto, monto, fecha: toDate(fecha), tipo, parcelaId, campanaId, userId }
    );

    const result = await query(
      `SELECT ${ING_FIELDS}
         FROM ingresos i
         LEFT JOIN tipos_ingreso ti ON ti.id = i.tipo_id
        WHERE i.id = :id AND i.usuario_id = :userId`,
      { id, userId }
    );
    return result.rows[0] || null;
  },

  async balancePeriodo(userId, desde, hasta) {
    const result = await query(
      `SELECT fn_balance_periodo(:userId, :desde, :hasta) AS "balance" FROM dual`,
      {
        userId: Number(userId),
        desde: toDate(desde) || new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        hasta: toDate(hasta) || new Date(),
      }
    );
    return { balance: result.rows[0]?.balance ?? 0, desde, hasta };
  },

  async registrarInversiones(userId, siembraId, items) {
    if (!Array.isArray(items) || items.length === 0)
      throw Object.assign(new Error('items debe ser un array no vacío'), { status: 400 });

    const binds = {
      siembraId: Number(siembraId),
      userId: Number(userId),
    };
    const constructors = items.map((item, i) => {
      binds[`fecha${i}`] = toDate(item.fecha) || new Date();
      binds[`monto${i}`] = Number(item.monto);
      binds[`desc${i}`] = item.descripcion ?? null;
      return `t_inversion_item(:fecha${i}, :monto${i}, :desc${i})`;
    });

    await query(
      `BEGIN
         sp_registrar_inversiones(
           :siembraId,
           :userId,
           t_lista_inversiones(${constructors.join(', ')})
         );
       END;`,
      binds
    );
    return { registradas: items.length, siembra_id: Number(siembraId) };
  },

  async createEgreso(userId, payload) {
    const {
      concepto = null,
      monto = 0,
      fecha = null,
      tipo = null,
      parcelaId = null,
      campanaId = null,
    } = payload || {};

    const id = await insertReturningId(
      `INSERT INTO egresos (concepto, monto, fecha, tipo, parcela_id, campana_id, usuario_id)
       VALUES (:concepto, :monto, :fecha, :tipo, :parcelaId, :campanaId, :userId)
       RETURNING id INTO :outId`,
      { concepto, monto, fecha: toDate(fecha), tipo, parcelaId, campanaId, userId }
    );

    const result = await query(
      `SELECT ${EG_FIELDS} FROM egresos WHERE id = :id AND usuario_id = :userId`,
      { id, userId }
    );
    return result.rows[0] || null;
  },
};
