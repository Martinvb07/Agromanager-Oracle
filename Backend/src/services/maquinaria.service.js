import { query, insertReturningId, toDate } from '../config/db.js';

async function upsertTipoMaquinaria(nombre) {
  if (!nombre) return null;
  const r = await query(`SELECT id AS "id" FROM tipos_maquinaria WHERE nombre = :nombre`, { nombre });
  if (r.rows[0]) return r.rows[0].id;
  return insertReturningId(
    `INSERT INTO tipos_maquinaria (nombre) VALUES (:nombre) RETURNING id INTO :outId`,
    { nombre }
  );
}

const SELECT_FIELDS = `
  m.id                    AS "id",
  m.nombre                AS "nombre",
  tm.nombre               AS "tipo",
  em.nombre               AS "estado",
  m.ultimo_mantenimiento  AS "ultimoMantenimiento",
  m.proximo_mantenimiento AS "proximoMantenimiento"
`;

const FROM_JOIN = `
  FROM maquinaria m
  LEFT JOIN tipos_maquinaria   tm ON tm.id = m.tipo_id
  LEFT JOIN estados_maquinaria em ON em.id = m.estado_id
`;

export const maquinariaService = {
  async list(userId) {
    const result = await query(
      `SELECT ${SELECT_FIELDS} ${FROM_JOIN}
        WHERE m.usuario_id = :userId ORDER BY m.id DESC`,
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

    const tipoId = await upsertTipoMaquinaria(tipo);

    const id = await insertReturningId(
      `INSERT INTO maquinaria (nombre, tipo_id, estado_id, ultimo_mantenimiento, proximo_mantenimiento, usuario_id)
       VALUES (:nombre, :tipoId,
               (SELECT id FROM estados_maquinaria WHERE nombre = :estado),
               :ultimoMantenimiento, :proximoMantenimiento, :userId)
       RETURNING id INTO :outId`,
      {
        nombre, tipoId, estado,
        ultimoMantenimiento: toDate(ultimoMantenimiento),
        proximoMantenimiento: toDate(proximoMantenimiento),
        userId,
      }
    );

    return this.getById(userId, id);
  },

  async update(userId, id, changes) {
    const setParts = [];
    const binds = { userId, id };

    if ('nombre' in changes) {
      setParts.push('nombre = :nombre');
      binds.nombre = changes.nombre;
    }
    if ('ultimoMantenimiento' in changes) {
      setParts.push('ultimo_mantenimiento = :ultimoMantenimiento');
      binds.ultimoMantenimiento = toDate(changes.ultimoMantenimiento);
    }
    if ('proximoMantenimiento' in changes) {
      setParts.push('proximo_mantenimiento = :proximoMantenimiento');
      binds.proximoMantenimiento = toDate(changes.proximoMantenimiento);
    }
    if ('tipo' in changes) {
      binds.tipoId = await upsertTipoMaquinaria(changes.tipo);
      setParts.push('tipo_id = :tipoId');
    }
    if ('estado' in changes) {
      setParts.push('estado_id = (SELECT id FROM estados_maquinaria WHERE nombre = :estado)');
      binds.estado = changes.estado;
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
      `SELECT ${SELECT_FIELDS} ${FROM_JOIN}
        WHERE m.usuario_id = :userId AND m.id = :id`,
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
