import { trabajadoresService } from '../services/trabajadores.service.js';

export const trabajadoresController = {
  async list(req, res) {
    const userId = req.user.id;
    const data = await trabajadoresService.list(userId);
    res.status(200).json({ data });
  },

  async create(req, res) {
    const userId = req.user.id;
    const created = await trabajadoresService.create(userId, req.body);
    res.status(201).json({ data: created });
  },

  async update(req, res) {
    const userId = req.user.id;
    const { id } = req.params;
    const updated = await trabajadoresService.update(userId, id, req.body);
    if (!updated) return res.status(404).json({ error: 'Trabajador no encontrado' });
    res.status(200).json({ data: updated });
  },

  async remove(req, res) {
    const userId = req.user.id;
    const { id } = req.params;
    const removed = await trabajadoresService.remove(userId, id);
    if (!removed) return res.status(404).json({ error: 'Trabajador no encontrado' });
    res.status(204).send();
  },

  async listConHoras(req, res) {
    const data = await trabajadoresService.listConHoras(req.user.id);
    res.status(200).json({ data });
  },

  async horasTrabajador(req, res) {
    const { id } = req.params;
    const { desde, hasta } = req.query || {};
    const data = await trabajadoresService.horasTrabajador(req.user.id, id, desde, hasta);
    res.status(200).json({ data });
  },

  async registrarJornadas(req, res) {
    const { id } = req.params;
    const { lista } = req.body || {};
    if (!Array.isArray(lista) || lista.length === 0)
      return res.status(400).json({ error: 'lista debe ser un array no vacío' });
    const data = await trabajadoresService.registrarJornadas(req.user.id, id, lista);
    res.status(201).json({ data });
  },

  async liquidarNomina(req, res) {
    const userId = req.user.id;
    const mes  = Number(req.body.mes  ?? new Date().getMonth() + 1);
    const anio = Number(req.body.anio ?? new Date().getFullYear());
    if (mes < 1 || mes > 12) return res.status(400).json({ error: 'mes debe estar entre 1 y 12' });
    const data = await trabajadoresService.liquidarNomina(userId, mes, anio);
    res.status(200).json({ data, mes, anio });
  },

  async costoNominaMes(req, res) {
    const userId = req.user.id;
    const mes  = Number(req.query.mes  ?? new Date().getMonth() + 1);
    const anio = Number(req.query.anio ?? new Date().getFullYear());
    const data = await trabajadoresService.costoNominaMes(userId, mes, anio);
    res.status(200).json({ data });
  },
};
