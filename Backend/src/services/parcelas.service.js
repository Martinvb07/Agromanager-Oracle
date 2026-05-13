import { query, insertReturningId, lowercaseRow } from '../config/db.js';

async function upsertTipoSemilla(nombre) {
  if (!nombre) return null;
  const r = await query(`SELECT id AS "id" FROM tipos_semilla WHERE nombre = :nombre`, { nombre });
  if (r.rows[0]) return r.rows[0].id;
  return insertReturningId(
    `INSERT INTO tipos_semilla (nombre) VALUES (:nombre) RETURNING id INTO :outId`,
    { nombre }
  );
}

const SELECT_FIELDS = `
  p.id              AS "id",
  p.nombre          AS "nombre",
  p.hectareas       AS "hectareas",
  ts.nombre         AS "cultivo",
  e.nombre          AS "estado",
  p.tipo_semilla_id AS "tipoSemillaId",
  p.estado_id       AS "estadoId"
`;

const FROM_JOIN = `
  FROM parcelas p
  LEFT JOIN tipos_semilla ts ON ts.id = p.tipo_semilla_id
  LEFT JOIN estados       e  ON e.id  = p.estado_id
`;

export const parcelasService = {
  async list(userId) {
    const result = await query(
      `SELECT ${SELECT_FIELDS} ${FROM_JOIN}
        WHERE p.usuario_id = :userId
        ORDER BY p.id DESC`,
      { userId }
    );
    return result.rows;
  },

  async create(userId, payload) {
    const {
      nombre = null,
      hectareas = null,
      cultivo = null,
      estado = 'Activa',
    } = payload || {};

    const tipoSemillaId = await upsertTipoSemilla(cultivo);

    const id = await insertReturningId(
      `INSERT INTO parcelas (nombre, hectareas, tipo_semilla_id, estado_id, usuario_id)
       VALUES (:nombre, :hectareas, :tipoSemillaId,
               (SELECT id FROM estados WHERE nombre = :estado AND contexto = 'parcela'),
               :userId)
       RETURNING id INTO :outId`,
      { nombre, hectareas, tipoSemillaId, estado, userId }
    );

    return this.getById(userId, id);
  },

  async getById(userId, id) {
    const result = await query(
      `SELECT ${SELECT_FIELDS} ${FROM_JOIN}
        WHERE p.id = :id AND p.usuario_id = :userId`,
      { id, userId }
    );
    return result.rows[0] ? lowercaseRow(result.rows[0]) : null;
  },

  async update(userId, id, changes) {
    const setParts = [];
    const binds = { userId, id };

    if ('nombre' in changes) {
      setParts.push('nombre = :nombre');
      binds.nombre = changes.nombre;
    }
    if ('hectareas' in changes) {
      setParts.push('hectareas = :hectareas');
      binds.hectareas = changes.hectareas;
    }
    if ('cultivo' in changes) {
      binds.tipoSemillaId = await upsertTipoSemilla(changes.cultivo);
      setParts.push('tipo_semilla_id = :tipoSemillaId');
    }
    if ('estado' in changes) {
      setParts.push(`estado_id = (SELECT id FROM estados WHERE nombre = :estado AND contexto = 'parcela')`);
      binds.estado = changes.estado;
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
