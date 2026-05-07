import { query } from '../config/db.js';

export const dashboardService = {
  async resumen(userId) {
    const result = await query(
      `SELECT parcelas_activas     AS "parcelas_activas",
              trabajadores_activos AS "trabajadores_activos",
              ingresos_mes         AS "ingresos_mes",
              egresos_mes          AS "egresos_mes",
              total_maquinaria     AS "total_maquinaria",
              campanas_activas     AS "campanas_activas"
         FROM V_DASHBOARD
        WHERE usuario_id = :userId`,
      { userId }
    );
    return result.rows[0] || {};
  },

  async resumenFinanciero(userId) {
    const result = await query(
      `SELECT TO_CHAR(mes, 'YYYY-MM') AS "mes", tipo AS "tipo", total AS "total"
         FROM V_RESUMEN_FINANCIERO
        WHERE usuario_id = :userId
        ORDER BY mes DESC, tipo`,
      { userId }
    );
    return result.rows;
  },
};
