import { query, insertReturningId } from '../config/db.js';

async function upsertCargo(nombre) {
  if (!nombre) return null;
  const r = await query(`SELECT id AS "id" FROM cargos WHERE nombre = :nombre`, { nombre });
  if (r.rows[0]) return r.rows[0].id;
  return insertReturningId(
    `INSERT INTO cargos (nombre) VALUES (:nombre) RETURNING id INTO :outId`,
    { nombre }
  );
}

const SELECT_FIELDS = `
  t.id      AS "id",
  t.nombre  AS "nombre",
  c.nombre  AS "cargo",
  t.salario AS "salario",
  e.nombre  AS "estado"
`;

const FROM_JOIN = `
  FROM trabajadores t
  LEFT JOIN cargos  c ON c.id = t.cargo_id
  LEFT JOIN estados e ON e.id = t.estado_id
`;

export const trabajadoresService = {
  async list(userId) {
    const result = await query(
      `SELECT ${SELECT_FIELDS} ${FROM_JOIN}
        WHERE t.usuario_id = :userId
        ORDER BY t.id DESC`,
      { userId }
    );
    return result.rows;
  },

  async create(userId, payload) {
    const {
      nombre = null,
      cargo = null,
      salario = 0,
      estado = 'Activo',
    } = payload || {};

    const cargoId = await upsertCargo(cargo);

    const id = await insertReturningId(
      `INSERT INTO trabajadores (nombre, cargo_id, salario, estado_id, usuario_id)
       VALUES (:nombre, :cargoId, :salario,
               (SELECT id FROM estados WHERE nombre = :estado AND contexto = 'trabajador'),
               :userId)
       RETURNING id INTO :outId`,
      { nombre, cargoId, salario, estado, userId }
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
    if ('salario' in changes) {
      setParts.push('salario = :salario');
      binds.salario = changes.salario;
    }
    if ('cargo' in changes) {
      binds.cargoId = await upsertCargo(changes.cargo);
      setParts.push('cargo_id = :cargoId');
    }
    if ('estado' in changes) {
      setParts.push(`estado_id = (SELECT id FROM estados WHERE nombre = :estado AND contexto = 'trabajador')`);
      binds.estado = changes.estado;
    }

    if (!setParts.length) return this.getById(userId, id);

    await query(
      `UPDATE trabajadores SET ${setParts.join(', ')} WHERE usuario_id = :userId AND id = :id`,
      binds
    );

    return this.getById(userId, id);
  },

  async getById(userId, id) {
    const result = await query(
      `SELECT ${SELECT_FIELDS} ${FROM_JOIN}
        WHERE t.usuario_id = :userId AND t.id = :id`,
      { userId, id }
    );
    return result.rows[0] || null;
  },

  async remove(userId, id) {
    const result = await query(
      `DELETE FROM trabajadores WHERE usuario_id = :userId AND id = :id`,
      { userId, id }
    );
    return (result.rowsAffected || 0) > 0;
  },
};
