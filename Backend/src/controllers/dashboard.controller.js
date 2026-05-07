import { dashboardService } from '../services/dashboard.service.js';

export const dashboardController = {
  async resumen(req, res) {
    const data = await dashboardService.resumen(req.user.id);
    res.status(200).json({ data });
  },

  async resumenFinanciero(req, res) {
    const data = await dashboardService.resumenFinanciero(req.user.id);
    res.status(200).json({ data });
  },
};
