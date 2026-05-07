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
};
