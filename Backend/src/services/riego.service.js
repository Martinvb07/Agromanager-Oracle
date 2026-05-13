import { query, insertReturningId, toDate } from '../config/db.js';

async function upsertTipoRiego(nombre) {
  if (!nombre) return null;
  const r = await query(`SELECT id AS "id" FROM tipos_riego WHERE nombre = :nombre`, { nombre });
  if (r.rows[0]) return r.rows[0].id;
  return insertReturningId(
    `INSERT INTO tipos_riego (nombre) VALUES (:nombre) RETURNING id INTO :outId`,
    { nombre }
  );
}

const SELECT_FIELDS = `
  r.id            AS "id",
  p.nombre        AS "parcela",
  tr.nombre       AS "tipo",
  r.consumo_agua  AS "consumoAgua",
  r.ultimo_riego  AS "ultimoRiego",
  r.proximo_riego AS "proximoRiego"
`;

const FROM_JOIN = `
  FROM riego r
  LEFT JOIN parcelas    p  ON p.id  = r.parcela_id
  LEFT JOIN tipos_riego tr ON tr.id = r.tipo_id
`;

function shape(row) {
  if (!row) return null;
  return { ...row, parcela: row.parcela || '-' };
}

export const riegoService = {
  async list(userId) {
    const result = await query(
      `SELECT ${SELECT_FIELDS} ${FROM_JOIN}
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

    const tipoId = await upsertTipoRiego(tipo);

    const id = await insertReturningId(
      `INSERT INTO riego (tipo_id, consumo_agua, ultimo_riego, proximo_riego, usuario_id)
       VALUES (:tipoId, :consumoAgua, :ultimoRiego, :proximoRiego, :userId)
       RETURNING id INTO :outId`,
      {
        tipoId, consumoAgua,
        ultimoRiego: toDate(ultimoRiego),
        proximoRiego: toDate(proximoRiego),
        userId,
      }
    );

    return this.getById(userId, id);
  },

  async update(userId, id, changes) {
    const setParts = [];
    const binds = { userId, id };

    if ('consumoAgua' in changes) {
      setParts.push('consumo_agua = :consumoAgua');
      binds.consumoAgua = changes.consumoAgua;
    }
    if ('ultimoRiego' in changes) {
      setParts.push('ultimo_riego = :ultimoRiego');
      binds.ultimoRiego = toDate(changes.ultimoRiego);
    }
    if ('proximoRiego' in changes) {
      setParts.push('proximo_riego = :proximoRiego');
      binds.proximoRiego = toDate(changes.proximoRiego);
    }
    if ('tipo' in changes) {
      binds.tipoId = await upsertTipoRiego(changes.tipo);
      setParts.push('tipo_id = :tipoId');
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
      `SELECT ${SELECT_FIELDS} ${FROM_JOIN}
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

  async parcelasRiegoVencido(userId, diasLimite = 7) {
    const result = await query(
      `SELECT fn_parcelas_riego_vencido(:userId, :dias) AS "count" FROM dual`,
      { userId: Number(userId), dias: Number(diasLimite) }
    );
    return { parcelas_vencidas: result.rows[0]?.count ?? 0, dias_limite: Number(diasLimite) };
  },
};
