import { Router } from 'express';
import asyncHandler from '../middleware/asyncHandler.js';
import requireAuth from '../middleware/requireAuth.js';
import { finanzasController } from '../controllers/finanzas.controller.js';

const router = Router();

router.get('/',                  requireAuth, asyncHandler(finanzasController.list));
router.get('/balance',           requireAuth, asyncHandler(finanzasController.balancePeriodo));
router.post('/ingresos',         requireAuth, asyncHandler(finanzasController.createIngreso));
router.post('/egresos',          requireAuth, asyncHandler(finanzasController.createEgreso));
router.post('/inversiones',      requireAuth, asyncHandler(finanzasController.registrarInversiones));

export default router;
