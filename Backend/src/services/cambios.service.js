import oracledb from 'oracledb';
import { query, insertReturningId } from '../config/db.js';

// Las descripciones se guardan como CLOB. Pedimos que se devuelvan como string
// para no tener que streamear el LOB en cada lectura.
const FETCH_OPTIONS = {
  fetchInfo: { DESCRIPCION: { type: oracledb.STRING } },
};

const SELECT_FIELDS = `
  c.id          AS "id",
  c.titulo      AS "titulo",
  c.descripcion AS "descripcion",
  c.tipo        AS "tipo",
  c.created_at  AS "created_at",
  u.nombre      AS "creado_por"
`;

export async function listCambios(limit) {
  let sql = `SELECT ${SELECT_FIELDS}
               FROM cambios c
               LEFT JOIN usuarios u ON c.creado_por = u.id
              ORDER BY c.created_at DESC`;
  const binds = {};

  if (Number.isFinite(limit) && limit > 0) {
    sql += ' FETCH FIRST :limit ROWS ONLY';
    binds.limit = limit;
  }

  const result = await query(sql, binds, FETCH_OPTIONS);
  return result.rows;
}

export async function createCambio({ titulo, descripcion, tipo, userId }) {
  const id = await insertReturningId(
    `INSERT INTO cambios (titulo, descripcion, tipo, creado_por)
     VALUES (:titulo, :descripcion, :tipo, :creadoPor)
     RETURNING id INTO :outId`,
    {
      titulo,
      descripcion,
      tipo: (tipo || 'novedad').toString().trim(),
      creadoPor: userId || null,
    }
  );

  const result = await query(
    `SELECT ${SELECT_FIELDS}
       FROM cambios c
       LEFT JOIN usuarios u ON c.creado_por = u.id
      WHERE c.id = :id`,
    { id },
    FETCH_OPTIONS
  );

  return result.rows[0] || null;
}
