import { query } from '../config/db.js';

export const siembrasService = {
  async list(userId) {
    const result = await query(
      `SELECT siembra_id       AS "id",
              fecha_siembra    AS "fechaSiembra",
              cantidad_kg      AS "cantidadKg",
              parcela          AS "parcela",
              tipo_semilla     AS "tipoSemilla",
              proveedor        AS "proveedor",
              estado           AS "estado",
              inversion_total  AS "inversionTotal",
              fertilizante_kg  AS "fertilizanteKg"
         FROM V_SIEMBRAS_RESUMEN
        WHERE usuario_id = :userId
        ORDER BY fecha_siembra DESC`,
      { userId }
    );
    return result.rows;
  },
};
