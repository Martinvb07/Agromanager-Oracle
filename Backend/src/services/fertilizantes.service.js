import { query, insertReturningId, toDate } from '../config/db.js';

const FIELDS = `
  f.id           AS "id",
  f.nombre       AS "fertilizante",
  f.estado       AS "estado",
  f.costo        AS "costo",
  f.stock_kg     AS "stock_kg",
  f.stock_minimo AS "stock_minimo"
`;

export const fertilizantesService = {
  async list(userId) {
    const result = await query(
      `SELECT ${FIELDS}
         FROM fertilizantes f
        WHERE f.usuario_id = :userId
        ORDER BY f.id DESC`,
      { userId }
    );
    return result.rows;
  },

  async create(userId, payload) {
    const {
      fertilizante = null,
      estado = 'Disponible',
      costo = 0,
      stock_kg = 0,
      stock_minimo = 0,
    } = payload || {};

    const id = await insertReturningId(
      `INSERT INTO fertilizantes
         (nombre, estado, costo, stock_kg, stock_minimo, usuario_id)
       VALUES (:fertilizante, :estado, :costo, :stock_kg, :stock_minimo, :userId)
       RETURNING id INTO :outId`,
      { fertilizante, estado, costo, stock_kg, stock_minimo, userId }
    );

    return this.getById(userId, id);
  },

  async update(userId, id, changes) {
    const map = {
      fertilizante: 'nombre',
      estado: 'estado',
      costo: 'costo',
      stock_kg: 'stock_kg',
      stock_minimo: 'stock_minimo',
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
      `UPDATE fertilizantes SET ${setParts.join(', ')}
        WHERE usuario_id = :userId AND id = :id`,
      binds
    );

    return this.getById(userId, id);
  },

  async getById(userId, id) {
    const result = await query(
      `SELECT ${FIELDS}
         FROM fertilizantes f
        WHERE f.usuario_id = :userId AND f.id = :id`,
      { userId, id }
    );
    return result.rows[0] || null;
  },

  async remove(userId, id) {
    const result = await query(
      `DELETE FROM fertilizantes WHERE usuario_id = :userId AND id = :id`,
      { userId, id }
    );
    return (result.rowsAffected || 0) > 0;
  },

  async stockBajo(userId) {
    const result = await query(
      `SELECT id, nombre, stock_kg AS "stock_kg", stock_minimo AS "stock_minimo",
              diferencia_kg AS "diferencia_kg"
         FROM V_STOCK_BAJO
        WHERE usuario_id = :userId
        ORDER BY diferencia_kg ASC`,
      { userId }
    );
    return result.rows;
  },

  async listarUsos(userId, fertilizanteId) {
    const result = await query(
      `SELECT u.id AS "id", u.cantidad_kg AS "cantidad_kg", u.fecha_uso AS "fecha_uso",
              u.notas AS "notas", p.nombre AS "parcela"
         FROM usos_fertilizante u
         LEFT JOIN parcelas p ON p.id = u.parcela_id
         JOIN fertilizantes f ON f.id = u.fertilizante_id
        WHERE f.usuario_id = :userId AND u.fertilizante_id = :fertilizanteId
        ORDER BY u.fecha_uso DESC`,
      { userId, fertilizanteId }
    );
    return result.rows;
  },

  async registrarUso(userId, fertilizanteId, payload) {
    const { cantidad_kg, parcela_id = null, notas = null, fecha_uso = null } = payload || {};
    const id = await insertReturningId(
      `INSERT INTO usos_fertilizante (fertilizante_id, parcela_id, cantidad_kg, fecha_uso, notas, usuario_id)
       VALUES (:fertilizanteId, :parcelaId, :cantidad, :fecha, :notas, :userId)
       RETURNING id INTO :outId`,
      {
        fertilizanteId: Number(fertilizanteId),
        parcelaId: parcela_id ? Number(parcela_id) : null,
        cantidad: Number(cantidad_kg),
        fecha: toDate(fecha_uso) || new Date(),
        notas,
        userId,
      }
    );
    return { id, fertilizante_id: fertilizanteId, cantidad_kg, notas };
  },

  async aplicarLote(userId, parcelaId, items, fecha) {
    const binds = {
      parcelaId: Number(parcelaId),
      usuarioId: Number(userId),
      fecha: toDate(fecha) || new Date(),
    };
    const constructors = items.map((item, i) => {
      binds[`fid${i}`] = Number(item.fertilizante_id);
      binds[`qty${i}`] = Number(item.cantidad_kg);
      return `t_uso_fert(:fid${i}, :qty${i})`;
    });
    await query(
      `BEGIN
         sp_aplicar_fertilizantes(
           t_lista_usos(${constructors.join(', ')}),
           :parcelaId, :usuarioId, :fecha
         );
       END;`,
      binds
    );
    return { aplicados: items.length };
  },
};
