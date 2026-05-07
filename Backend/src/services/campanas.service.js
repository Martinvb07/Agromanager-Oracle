import { query, insertReturningId, toDate } from '../config/db.js';

const CAMPANA_FIELDS = `
  id                AS "id",
  nombre            AS "nombre",
  fecha_inicio      AS "fechaInicio",
  fecha_fin         AS "fechaFin",
  hectareas         AS "hectareas",
  lotes             AS "lotes",
  inversion_total   AS "inversionTotal",
  gastos_operativos AS "gastosOperativos",
  ingreso_total     AS "ingresoTotal",
  rendimiento_ha    AS "rendimientoHa",
  produccion_total  AS "produccionTotal"
`;

const DIARIO_FIELDS = `
  id                  AS "id",
  fecha               AS "fecha",
  hectareas_cortadas  AS "hectareas",
  bultos              AS "bultos",
  notas               AS "notas"
`;

const REMISION_FIELDS = `
  id                AS "id",
  fecha             AS "fecha",
  nombre_conductor  AS "nombreConductor",
  cc_conductor      AS "ccConductor",
  vehiculo_placa    AS "vehiculoPlaca",
  origen            AS "origen",
  destino           AS "destino",
  cantidad          AS "cantidad",
  variedad          AS "variedad",
  tel_conductor     AS "telefonoConductor",
  tel_propietario   AS "telefonoPropietario",
  enviado_por       AS "enviadoPor",
  enviado_cc        AS "enviadoCc",
  valor_flete       AS "valorFlete",
  firma_conductor   AS "firmaConductor",
  firma_propietario AS "firmaPropietario",
  nota              AS "nota"
`;

export const campanasService = {
  // -------- Campañas --------

  async list(userId) {
    const result = await query(
      `SELECT ${CAMPANA_FIELDS}
         FROM campanas
        WHERE usuario_id = :userId
        ORDER BY fecha_inicio DESC, id DESC`,
      { userId }
    );
    return result.rows;
  },

  async create(userId, payload) {
    const {
      nombre = null,
      fechaInicio = null,
      fechaFin = null,
      hectareas = null,
      lotes = null,
      inversionTotal = 0,
      gastosOperativos = 0,
      ingresoTotal = 0,
      rendimientoHa = null,
      produccionTotal = null,
    } = payload || {};

    const id = await insertReturningId(
      `INSERT INTO campanas
         (nombre, fecha_inicio, fecha_fin, hectareas, lotes, inversion_total,
          gastos_operativos, ingreso_total, rendimiento_ha, produccion_total, usuario_id)
       VALUES (:nombre, :fechaInicio, :fechaFin, :hectareas, :lotes, :inversionTotal,
               :gastosOperativos, :ingresoTotal, :rendimientoHa, :produccionTotal, :userId)
       RETURNING id INTO :outId`,
      {
        nombre,
        fechaInicio: toDate(fechaInicio),
        fechaFin: toDate(fechaFin),
        hectareas,
        lotes,
        inversionTotal,
        gastosOperativos,
        ingresoTotal,
        rendimientoHa,
        produccionTotal,
        userId,
      }
    );

    return this.getById(userId, id);
  },

  async update(userId, id, changes) {
    const map = {
      nombre: 'nombre',
      fechaInicio: 'fecha_inicio',
      fechaFin: 'fecha_fin',
      hectareas: 'hectareas',
      lotes: 'lotes',
      inversionTotal: 'inversion_total',
      gastosOperativos: 'gastos_operativos',
      ingresoTotal: 'ingreso_total',
      rendimientoHa: 'rendimiento_ha',
      produccionTotal: 'produccion_total',
    };
    const dateKeys = new Set(['fechaInicio', 'fechaFin']);

    const setParts = [];
    const binds = { userId, id };

    for (const [key, column] of Object.entries(map)) {
      if (key in changes) {
        setParts.push(`${column} = :${key}`);
        binds[key] = dateKeys.has(key) ? toDate(changes[key]) : changes[key];
      }
    }

    if (!setParts.length) return this.getById(userId, id);

    await query(
      `UPDATE campanas SET ${setParts.join(', ')} WHERE usuario_id = :userId AND id = :id`,
      binds
    );

    return this.getById(userId, id);
  },

  async getById(userId, id) {
    const result = await query(
      `SELECT ${CAMPANA_FIELDS}
         FROM campanas
        WHERE usuario_id = :userId AND id = :id`,
      { userId, id }
    );
    return result.rows[0] || null;
  },

  async remove(userId, id) {
    const result = await query(
      `DELETE FROM campanas WHERE usuario_id = :userId AND id = :id`,
      { userId, id }
    );
    return (result.rowsAffected || 0) > 0;
  },

  // -------- Diario de cosecha --------

  async listDiario(userId, campanaId, filters = {}) {
    const { desde, hasta } = filters || {};

    let sql = `SELECT ${DIARIO_FIELDS}
                 FROM campanas_diario
                WHERE usuario_id = :userId AND campana_id = :campanaId`;
    const binds = { userId, campanaId };

    if (desde) {
      sql += ' AND fecha >= :desde';
      binds.desde = toDate(desde);
    }
    if (hasta) {
      sql += ' AND fecha <= :hasta';
      binds.hasta = toDate(hasta);
    }

    sql += ' ORDER BY fecha ASC, id ASC';

    const result = await query(sql, binds);
    return result.rows;
  },

  async createDiario(userId, campanaId, payload) {
    const {
      fecha = null,
      hectareas = null,
      bultos = null,
      notas = null,
    } = payload || {};

    const id = await insertReturningId(
      `INSERT INTO campanas_diario (campana_id, fecha, hectareas_cortadas, bultos, notas, usuario_id)
       VALUES (:campanaId, :fecha, :hectareas, :bultos, :notas, :userId)
       RETURNING id INTO :outId`,
      { campanaId, fecha: toDate(fecha), hectareas, bultos, notas, userId }
    );

    return this.getDiarioById(userId, campanaId, id);
  },

  async updateDiario(userId, campanaId, entryId, changes) {
    const map = {
      fecha: 'fecha',
      hectareas: 'hectareas_cortadas',
      bultos: 'bultos',
      notas: 'notas',
    };
    const dateKeys = new Set(['fecha']);

    const setParts = [];
    const binds = { userId, campanaId, id: entryId };

    for (const [key, column] of Object.entries(map)) {
      if (key in changes) {
        setParts.push(`${column} = :${key}`);
        binds[key] = dateKeys.has(key) ? toDate(changes[key]) : changes[key];
      }
    }

    if (!setParts.length) return this.getDiarioById(userId, campanaId, entryId);

    await query(
      `UPDATE campanas_diario SET ${setParts.join(', ')}
        WHERE usuario_id = :userId AND campana_id = :campanaId AND id = :id`,
      binds
    );

    return this.getDiarioById(userId, campanaId, entryId);
  },

  async getDiarioById(userId, campanaId, entryId) {
    const result = await query(
      `SELECT ${DIARIO_FIELDS}
         FROM campanas_diario
        WHERE usuario_id = :userId AND campana_id = :campanaId AND id = :id`,
      { userId, campanaId, id: entryId }
    );
    return result.rows[0] || null;
  },

  async removeDiario(userId, campanaId, entryId) {
    const result = await query(
      `DELETE FROM campanas_diario
        WHERE usuario_id = :userId AND campana_id = :campanaId AND id = :id`,
      { userId, campanaId, id: entryId }
    );
    return (result.rowsAffected || 0) > 0;
  },

  // -------- Remisiones --------

  async listRemisiones(userId, campanaId) {
    const result = await query(
      `SELECT ${REMISION_FIELDS}
         FROM remisiones
        WHERE usuario_id = :userId AND campana_id = :campanaId
        ORDER BY fecha DESC, id DESC`,
      { userId, campanaId }
    );
    return result.rows;
  },

  async createRemision(userId, campanaId, payload) {
    const {
      fecha = null,
      nombreConductor = null,
      ccConductor = null,
      vehiculoPlaca = null,
      origen = null,
      destino = null,
      cantidad = null,
      variedad = null,
      telefonoConductor = null,
      telefonoPropietario = null,
      enviadoPor = null,
      enviadoCc = null,
      valorFlete = null,
      firmaConductor = null,
      firmaPropietario = null,
      nota = null,
    } = payload || {};

    const id = await insertReturningId(
      `INSERT INTO remisiones (
         campana_id, fecha, nombre_conductor, cc_conductor, vehiculo_placa,
         origen, destino, cantidad, variedad, tel_conductor, tel_propietario, valor_flete,
         enviado_por, enviado_cc, firma_conductor, firma_propietario, nota, usuario_id)
       VALUES (
         :campanaId, :fecha, :nombreConductor, :ccConductor, :vehiculoPlaca,
         :origen, :destino, :cantidad, :variedad, :telefonoConductor, :telefonoPropietario, :valorFlete,
         :enviadoPor, :enviadoCc, :firmaConductor, :firmaPropietario, :nota, :userId)
       RETURNING id INTO :outId`,
      {
        campanaId,
        fecha: toDate(fecha),
        nombreConductor,
        ccConductor,
        vehiculoPlaca,
        origen,
        destino,
        cantidad,
        variedad,
        telefonoConductor,
        telefonoPropietario,
        valorFlete,
        enviadoPor,
        enviadoCc,
        firmaConductor,
        firmaPropietario,
        nota,
        userId,
      }
    );

    return this.getRemisionById(userId, campanaId, id);
  },

  async updateRemision(userId, campanaId, remisionId, changes) {
    const map = {
      fecha: 'fecha',
      nombreConductor: 'nombre_conductor',
      ccConductor: 'cc_conductor',
      vehiculoPlaca: 'vehiculo_placa',
      origen: 'origen',
      destino: 'destino',
      cantidad: 'cantidad',
      variedad: 'variedad',
      telefonoConductor: 'tel_conductor',
      telefonoPropietario: 'tel_propietario',
      enviadoPor: 'enviado_por',
      enviadoCc: 'enviado_cc',
      valorFlete: 'valor_flete',
      firmaConductor: 'firma_conductor',
      firmaPropietario: 'firma_propietario',
      nota: 'nota',
    };
    const dateKeys = new Set(['fecha']);

    const setParts = [];
    const binds = { userId, campanaId, id: remisionId };

    for (const [key, column] of Object.entries(map)) {
      if (key in changes) {
        setParts.push(`${column} = :${key}`);
        binds[key] = dateKeys.has(key) ? toDate(changes[key]) : changes[key];
      }
    }

    if (!setParts.length) return this.getRemisionById(userId, campanaId, remisionId);

    await query(
      `UPDATE remisiones SET ${setParts.join(', ')}
        WHERE usuario_id = :userId AND campana_id = :campanaId AND id = :id`,
      binds
    );

    return this.getRemisionById(userId, campanaId, remisionId);
  },

  async getRemisionById(userId, campanaId, remisionId) {
    const result = await query(
      `SELECT ${REMISION_FIELDS}
         FROM remisiones
        WHERE usuario_id = :userId AND campana_id = :campanaId AND id = :id`,
      { userId, campanaId, id: remisionId }
    );
    return result.rows[0] || null;
  },

  async removeRemision(userId, campanaId, remisionId) {
    const result = await query(
      `DELETE FROM remisiones
        WHERE usuario_id = :userId AND campana_id = :campanaId AND id = :id`,
      { userId, campanaId, id: remisionId }
    );
    return (result.rowsAffected || 0) > 0;
  },
};
