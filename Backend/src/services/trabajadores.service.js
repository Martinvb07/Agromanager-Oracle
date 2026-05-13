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

  async listConHoras(userId) {
    const result = await query(
      `SELECT trabajador_id   AS "id",
              trabajador_nombre AS "nombre",
              cargo           AS "cargo",
              estado          AS "estado",
              salario         AS "salario",
              horas_totales   AS "horasTotales",
              horas_mes_actual AS "horasMesActual",
              dias_trabajados AS "diasTrabajados"
         FROM V_TRABAJADORES_HORAS
        WHERE usuario_id = :userId
        ORDER BY trabajador_nombre`,
      { userId }
    );
    return result.rows;
  },

  async horasTrabajador(userId, trabajadorId, desde, hasta) {
    const result = await query(
      `SELECT fn_horas_trabajador(:trabajadorId, :desde, :hasta) AS "horas" FROM dual`,
      {
        trabajadorId: Number(trabajadorId),
        desde: toDate(desde) || new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        hasta: toDate(hasta) || new Date(),
      }
    );
    return { trabajador_id: Number(trabajadorId), horas: result.rows[0]?.horas ?? 0 };
  },

  async registrarJornadas(userId, trabajadorId, lista) {
    if (!Array.isArray(lista) || lista.length === 0)
      throw Object.assign(new Error('lista no puede estar vacía'), { status: 400 });

    const binds = {
      trabajadorId: Number(trabajadorId),
      userId: Number(userId),
    };
    const constructors = lista.map((item, i) => {
      binds[`fecha${i}`]  = toDate(item.fecha) || new Date();
      binds[`horas${i}`]  = Number(item.horas);
      binds[`desc${i}`]   = item.descripcion ?? null;
      return `t_hora_lab(:fecha${i}, :horas${i}, :desc${i})`;
    });

    await query(
      `BEGIN
         sp_registrar_jornadas(
           :trabajadorId,
           :userId,
           t_lista_horas(${constructors.join(', ')})
         );
       END;`,
      binds
    );
    return { registradas: lista.length, trabajador_id: Number(trabajadorId) };
  },

  async liquidarNomina(userId, mes, anio) {
    // Llama sp_liquidar_nomina en un bloque anónimo (el OUT de colección no es bindeable
    // desde oracledb thin mode; el procedimiento hace COMMIT internamente).
    await query(
      `DECLARE v_res t_lista_nomina;
       BEGIN sp_liquidar_nomina(:userId, :mes, :anio, v_res); END;`,
      { userId: Number(userId), mes: Number(mes), anio: Number(anio) }
    );

    // Devuelve el resumen calculado para la respuesta al frontend
    const result = await query(
      `SELECT t.id        AS "id",
              t.nombre    AS "nombre",
              t.salario   AS "salario",
              NVL(SUM(h.horas), 0) AS "horasMes",
              ROUND((t.salario / 240) * NVL(SUM(h.horas), 0), 2) AS "pagoCaiculado"
         FROM trabajadores t
         JOIN estados e ON e.id = t.estado_id AND e.nombre = 'Activo'
         LEFT JOIN horas_laboradas h
                ON h.trabajador_id = t.id
               AND TRUNC(h.fecha, 'MM') =
                   TRUNC(TO_DATE(:anio2 || LPAD(:mes2, 2, '0') || '01', 'YYYYMMDD'), 'MM')
        WHERE t.usuario_id = :userId2
        GROUP BY t.id, t.nombre, t.salario
        ORDER BY t.nombre`,
      { anio2: Number(anio), mes2: Number(mes), userId2: Number(userId) }
    );
    return result.rows;
  },

  async costoNominaMes(userId, mes, anio) {
    const result = await query(
      `SELECT fn_costo_nomina_mes(:userId, :mes, :anio) AS "costo" FROM dual`,
      { userId: Number(userId), mes: Number(mes), anio: Number(anio) }
    );
    return { mes: Number(mes), anio: Number(anio), costo: result.rows[0]?.costo ?? 0 };
  },
};
