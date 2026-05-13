import { finanzasService } from '../services/finanzas.service.js';

export const finanzasController = {
  async list(req, res) {
    const userId = req.user.id;
    const [ingresos, egresos] = await Promise.all([
      finanzasService.listIngresos(userId),
      finanzasService.listEgresos(userId),
    ]);
    res.status(200).json({ data: { ingresos, egresos } });
  },

  async createIngreso(req, res) {
    const userId = req.user.id;
    const created = await finanzasService.createIngreso(userId, req.body);
    res.status(201).json({ data: created });
  },

  async createEgreso(req, res) {
    const userId = req.user.id;
    const created = await finanzasService.createEgreso(userId, req.body);
    res.status(201).json({ data: created });
  },

  async balancePeriodo(req, res) {
    const userId = req.user.id;
    const { desde, hasta } = req.query || {};
    const data = await finanzasService.balancePeriodo(userId, desde, hasta);
    res.status(200).json({ data });
  },

  async registrarInversiones(req, res) {
    const userId = req.user.id;
    const { siembra_id, items } = req.body || {};
    if (!siembra_id) return res.status(400).json({ error: 'siembra_id es requerido' });
    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ error: 'items debe ser un array no vacío' });
    const data = await finanzasService.registrarInversiones(userId, siembra_id, items);
    res.status(201).json({ data });
  },
};
