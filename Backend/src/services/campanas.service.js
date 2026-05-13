import { query, insertReturningId, toDate } from '../config/db.js';

// Campos base de la tabla campanas (sin totales derivados).
const CAMPANA_BASE = `
  c.id           AS "id",
  c.nombre       AS "nombre",
  c.fecha_inicio AS "fechaInicio",
  c.fecha_fin    AS "fechaFin",
  c.hectareas    AS "hectareas",
  c.lotes        AS "lotes"
`;

// Totales calculados desde V_CAMPANAS_RESUMEN.
const CAMPANA_TOTALES = `
  NVL(v.ingreso_total,       0) AS "ingresoTotal",
  NVL(v.egresos_total,       0) AS "egresosTotal",
  NVL(v.produccion_total,    0) AS "produccionTotal",
  NVL(v.hectareas_cosechadas,0) AS "hectareasCosechadas",
  NVL(v.rendimiento_ha,      0) AS "rendimientoHa"
`;

const DIARIO_FIELDS = `
  id                  AS "id",
  fecha               AS "fecha",
  hectareas_cortadas  AS "hectareas",
  bultos              AS "bultos",
  notas               AS "notas"
`;

const REMISION_FIELDS = `
  r.id                AS "id",
  r.fecha             AS "fecha",
  c.nombre            AS "nombreConductor",
  c.cc                AS "ccConductor",
  r.vehiculo_placa    AS "vehiculoPlaca",
  r.origen            AS "origen",
  r.destino           AS "destino",
  r.cantidad          AS "cantidad",
  r.variedad          AS "variedad",
  c.tel               AS "telefonoConductor",
  r.tel_propietario   AS "telefonoPropietario",
  r.enviado_por_id    AS "enviadoPorId",
  u.nombre            AS "enviadoPor",
  r.valor_flete       AS "valorFlete",
  r.firma_conductor   AS "firmaConductor",
  r.firma_propietario AS "firmaPropietario",
  r.nota              AS "nota"
`;

async function upsertConductor(cc, nombre, tel) {
  if (!cc) return null;
  const existing = await query(`SELECT id FROM conductores WHERE cc = :cc`, { cc });
  if (existing.rows.length > 0) {
    const id = existing.rows[0].id;
    await query(
      `UPDATE conductores SET nombre = :nombre, tel = :tel WHERE id = :id`,
      { nombre: nombre ?? null, tel: tel ?? null, id }
    );
    return id;
  }
  return insertReturningId(
    `INSERT INTO conductores (cc, nombre, tel) VALUES (:cc, :nombre, :tel) RETURNING id INTO :outId`,
    { cc, nombre: nombre ?? null, tel: tel ?? null }
  );
}

export const campanasService = {
  // -------- Campañas --------

  async list(userId) {
    const result = await query(
      `SELECT ${CAMPANA_BASE}, ${CAMPANA_TOTALES}
         FROM campanas c
         LEFT JOIN V_CAMPANAS_RESUMEN v ON v.campana_id = c.id
        WHERE c.usuario_id = :userId
        ORDER BY c.fecha_inicio DESC, c.id DESC`,
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
    } = payload || {};

    const id = await insertReturningId(
      `INSERT INTO campanas (nombre, fecha_inicio, fecha_fin, hectareas, lotes, usuario_id)
       VALUES (:nombre, :fechaInicio, :fechaFin, :hectareas, :lotes, :userId)
       RETURNING id INTO :outId`,
      {
        nombre,
        fechaInicio: toDate(fechaInicio),
        fechaFin: toDate(fechaFin),
        hectareas,
        lotes,
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
      `SELECT ${CAMPANA_BASE}, ${CAMPANA_TOTALES}
         FROM campanas c
         LEFT JOIN V_CAMPANAS_RESUMEN v ON v.campana_id = c.id
        WHERE c.usuario_id = :userId AND c.id = :id`,
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
         FROM remisiones r
         LEFT JOIN conductores c ON c.id = r.conductor_id
         LEFT JOIN usuarios u   ON u.id = r.enviado_por_id
        WHERE r.usuario_id = :userId AND r.campana_id = :campanaId
        ORDER BY r.fecha DESC, r.id DESC`,
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
      enviadoPorId = null,
      valorFlete = null,
      firmaConductor = null,
      firmaPropietario = null,
      nota = null,
    } = payload || {};

    const conductorId = await upsertConductor(ccConductor, nombreConductor, telefonoConductor);

    const id = await insertReturningId(
      `INSERT INTO remisiones (
         campana_id, fecha, conductor_id, vehiculo_placa,
         origen, destino, cantidad, variedad, tel_propietario, valor_flete,
         enviado_por_id, firma_conductor, firma_propietario, nota, usuario_id)
       VALUES (
         :campanaId, :fecha, :conductorId, :vehiculoPlaca,
         :origen, :destino, :cantidad, :variedad, :telefonoPropietario, :valorFlete,
         :enviadoPorId, :firmaConductor, :firmaPropietario, :nota, :userId)
       RETURNING id INTO :outId`,
      {
        campanaId,
        fecha: toDate(fecha),
        conductorId,
        vehiculoPlaca,
        origen,
        destino,
        cantidad,
        variedad,
        telefonoPropietario,
        valorFlete,
        enviadoPorId: enviadoPorId ? Number(enviadoPorId) : null,
        firmaConductor,
        firmaPropietario,
        nota,
        userId,
      }
    );

    return this.getRemisionById(userId, campanaId, id);
  },

  async updateRemision(userId, campanaId, remisionId, changes) {
    const hasConductorChange = ['nombreConductor', 'ccConductor', 'telefonoConductor'].some(k => k in changes);
    let conductorId;

    if (hasConductorChange) {
      const current = await this.getRemisionById(userId, campanaId, remisionId);
      conductorId = await upsertConductor(
        changes.ccConductor ?? current?.ccConductor,
        changes.nombreConductor ?? current?.nombreConductor,
        changes.telefonoConductor ?? current?.telefonoConductor
      );
    }

    const map = {
      fecha: 'fecha',
      vehiculoPlaca: 'vehiculo_placa',
      origen: 'origen',
      destino: 'destino',
      cantidad: 'cantidad',
      variedad: 'variedad',
      telefonoPropietario: 'tel_propietario',
      enviadoPorId: 'enviado_por_id',
      valorFlete: 'valor_flete',
      firmaConductor: 'firma_conductor',
      firmaPropietario: 'firma_propietario',
      nota: 'nota',
    };
    const dateKeys = new Set(['fecha']);

    const setParts = [];
    const binds = { userId, campanaId, id: remisionId };

    if (conductorId !== undefined) {
      setParts.push('conductor_id = :conductorId');
      binds.conductorId = conductorId;
    }

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
         FROM remisiones r
         LEFT JOIN conductores c ON c.id = r.conductor_id
         LEFT JOIN usuarios u   ON u.id = r.enviado_por_id
        WHERE r.usuario_id = :userId AND r.campana_id = :campanaId AND r.id = :id`,
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

  // -------- Parcelas de campaña (N:M) --------

  async listParcelas(userId, campanaId) {
    const result = await query(
      `SELECT p.id AS "id", p.nombre AS "nombre", p.hectareas AS "hectareas", p.cultivo AS "cultivo"
         FROM campanas_parcelas cp
         JOIN parcelas p  ON p.id  = cp.parcela_id
         JOIN campanas c  ON c.id  = cp.campana_id
        WHERE c.usuario_id = :userId AND cp.campana_id = :campanaId
        ORDER BY p.nombre`,
      { userId, campanaId }
    );
    return result.rows;
  },

  async addParcela(userId, campanaId, parcelaId) {
    const campana = await this.getById(userId, campanaId);
    if (!campana) return false;
    await query(
      `INSERT INTO campanas_parcelas (campana_id, parcela_id) VALUES (:campanaId, :parcelaId)`,
      { campanaId, parcelaId }
    );
    return true;
  },

  async cerrarCampana(userId, campanaId) {
    await query(
      `BEGIN sp_cerrar_campana(:campanaId, :userId); END;`,
      { campanaId: Number(campanaId), userId: Number(userId) }
    );
    return this.getById(userId, campanaId);
  },

  async rendimientoCampana(userId, campanaId) {
    const campana = await this.getById(userId, campanaId);
    if (!campana) return null;
    const result = await query(
      `SELECT fn_rendimiento_campana(:campanaId) AS "rendimiento" FROM dual`,
      { campanaId: Number(campanaId) }
    );
    return {
      campana_id: Number(campanaId),
      rendimiento_ha: result.rows[0]?.rendimiento ?? 0,
    };
  },

  async removeParcela(userId, campanaId, parcelaId) {
    const campana = await this.getById(userId, campanaId);
    if (!campana) return false;
    const result = await query(
      `DELETE FROM campanas_parcelas WHERE campana_id = :campanaId AND parcela_id = :parcelaId`,
      { campanaId, parcelaId }
    );
    return (result.rowsAffected || 0) > 0;
  },
};
