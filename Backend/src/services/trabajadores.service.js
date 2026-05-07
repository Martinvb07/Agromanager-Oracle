import { query, insertReturningId } from '../config/db.js';

const SELECT_FIELDS = `
  id            AS "id",
  nombre        AS "nombre",
  cargo         AS "cargo",
  salario       AS "salario",
  horas_trabajadas AS "horasTrabajadas",
  estado        AS "estado"
`;

export const trabajadoresService = {
  async list(userId) {
    const result = await query(
      `SELECT ${SELECT_FIELDS} FROM trabajadores WHERE usuario_id = :userId ORDER BY id DESC`,
      { userId }
    );
    return result.rows;
  },

  async create(userId, payload) {
    const {
      nombre = null,
      cargo = null,
      salario = 0,
      horasTrabajadas = 0,
      estado = 'Activo',
    } = payload || {};

    const id = await insertReturningId(
      `INSERT INTO trabajadores (nombre, cargo, salario, horas_trabajadas, estado, usuario_id)
       VALUES (:nombre, :cargo, :salario, :horasTrabajadas, :estado, :userId)
       RETURNING id INTO :outId`,
      { nombre, cargo, salario, horasTrabajadas, estado, userId }
    );

    return this.getById(userId, id);
  },

  async update(userId, id, changes) {
    const map = {
      nombre: 'nombre',
      cargo: 'cargo',
      salario: 'salario',
      horasTrabajadas: 'horas_trabajadas',
      estado: 'estado',
    };

    const setParts = [];
    const binds = { userId, id };

    for (const [key, column] of Object.entries(map)) {
      if (key in changes) {
        setParts.push(`${column} = :${key}`);
        binds[key] = changes[key];
      }
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
      `SELECT ${SELECT_FIELDS} FROM trabajadores WHERE usuario_id = :userId AND id = :id`,
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
