import { fertilizantesService } from '../services/fertilizantes.service.js';

export const fertilizantesController = {
  async list(req, res) {
    const data = await fertilizantesService.list(req.user.id);
    res.status(200).json({ data });
  },

  async create(req, res) {
    const created = await fertilizantesService.create(req.user.id, req.body);
    res.status(201).json({ data: created });
  },

  async update(req, res) {
    const updated = await fertilizantesService.update(req.user.id, req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Fertilizante no encontrado' });
    res.status(200).json({ data: updated });
  },

  async remove(req, res) {
    const removed = await fertilizantesService.remove(req.user.id, req.params.id);
    if (!removed) return res.status(404).json({ error: 'Fertilizante no encontrado' });
    res.status(204).send();
  },

  async stockBajo(req, res) {
    const data = await fertilizantesService.stockBajo(req.user.id);
    res.status(200).json({ data });
  },

  async listarUsos(req, res) {
    const data = await fertilizantesService.listarUsos(req.user.id, req.params.id);
    res.status(200).json({ data });
  },

  async registrarUso(req, res) {
    if (!req.body.cantidad_kg || Number(req.body.cantidad_kg) <= 0) {
      return res.status(400).json({ error: 'cantidad_kg debe ser mayor a 0' });
    }
    const data = await fertilizantesService.registrarUso(req.user.id, req.params.id, req.body);
    res.status(201).json({ data });
  },

  async aplicarLote(req, res) {
    const { parcela_id, items, fecha } = req.body || {};
    if (!parcela_id) return res.status(400).json({ error: 'parcela_id es requerido' });
    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ error: 'items debe ser un array no vacío' });
    const data = await fertilizantesService.aplicarLote(req.user.id, parcela_id, items, fecha);
    res.status(200).json({ data });
  },
};
