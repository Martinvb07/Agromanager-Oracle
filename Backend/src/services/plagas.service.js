import { query, insertReturningId, toDate } from '../config/db.js';

async function upsertTipoSemilla(nombre) {
  if (!nombre) return null;
  const r = await query(`SELECT id AS "id" FROM tipos_semilla WHERE nombre = :nombre`, { nombre });
  if (r.rows[0]) return r.rows[0].id;
  return insertReturningId(
    `INSERT INTO tipos_semilla (nombre) VALUES (:nombre) RETURNING id INTO :outId`,
    { nombre }
  );
}

async function upsertTipoPlaga(tipo, tratamiento) {
  if (!tipo) return null;
  const r = await query(`SELECT id AS "id" FROM tipos_plaga WHERE tipo = :tipo`, { tipo });
  if (r.rows[0]) {
    const id = r.rows[0].id;
    if (tratamiento !== undefined) {
      await query(
        `UPDATE tipos_plaga SET tratamiento = :tratamiento WHERE id = :id`,
        { tratamiento, id }
      );
    }
    return id;
  }
  return insertReturningId(
    `INSERT INTO tipos_plaga (tipo, tratamiento) VALUES (:tipo, :tratamiento) RETURNING id INTO :outId`,
    { tipo, tratamiento: tratamiento ?? null }
  );
}

const SELECT_FIELDS = `
  p.id           AS "id",
  ts.nombre      AS "cultivo",
  tp.tipo        AS "tipo",
  p.severidad    AS "severidad",
  tp.tratamiento AS "tratamiento",
  p.fecha_detec  AS "fechaDetec"
`;

const FROM_JOIN = `
  FROM plagas p
  LEFT JOIN tipos_semilla ts ON ts.id = p.tipo_semilla_id
  LEFT JOIN tipos_plaga   tp ON tp.id = p.tipo_id
`;

export const plagasService = {
  async list(userId) {
    const result = await query(
      `SELECT ${SELECT_FIELDS} ${FROM_JOIN}
        WHERE p.usuario_id = :userId
        ORDER BY p.fecha_detec DESC, p.id DESC`,
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

    const tipoSemillaId = await upsertTipoSemilla(cultivo);
    const tipoId        = await upsertTipoPlaga(tipo, tratamiento);

    const id = await insertReturningId(
      `INSERT INTO plagas (tipo_semilla_id, tipo_id, severidad, fecha_detec, usuario_id)
       VALUES (:tipoSemillaId, :tipoId, :severidad, :fechaDetec, :userId)
       RETURNING id INTO :outId`,
      { tipoSemillaId, tipoId, severidad, fechaDetec: toDate(fechaDetec), userId }
    );

    return this.getById(userId, id);
  },

  async update(userId, id, changes) {
    const needsTipoUpdate = 'tipo' in changes || 'tratamiento' in changes;
    let tipoId;

    if (needsTipoUpdate) {
      const current = await this.getById(userId, id);
      tipoId = await upsertTipoPlaga(
        changes.tipo ?? current?.tipo,
        changes.tratamiento ?? current?.tratamiento
      );
    }

    const setParts = [];
    const binds = { userId, id };

    if (tipoId !== undefined) {
      setParts.push('tipo_id = :tipoId');
      binds.tipoId = tipoId;
    }
    if ('severidad' in changes) {
      setParts.push('severidad = :severidad');
      binds.severidad = changes.severidad;
    }
    if ('fechaDetec' in changes) {
      setParts.push('fecha_detec = :fechaDetec');
      binds.fechaDetec = toDate(changes.fechaDetec);
    }
    if ('cultivo' in changes) {
      binds.tipoSemillaId = await upsertTipoSemilla(changes.cultivo);
      setParts.push('tipo_semilla_id = :tipoSemillaId');
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
      `SELECT ${SELECT_FIELDS} ${FROM_JOIN}
        WHERE p.usuario_id = :userId AND p.id = :id`,
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
