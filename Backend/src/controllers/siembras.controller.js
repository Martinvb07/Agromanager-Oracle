import { siembrasService } from '../services/siembras.service.js';

export const siembrasController = {
  async list(req, res) {
    const data = await siembrasService.list(req.user.id);
    res.status(200).json({ data });
  },
};
