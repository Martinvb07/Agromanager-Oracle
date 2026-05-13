import { Router } from 'express';
import asyncHandler from '../middleware/asyncHandler.js';
import requireAuth from '../middleware/requireAuth.js';
import { trabajadoresController } from '../controllers/trabajadores.controller.js';

const router = Router();

router.get('/',               requireAuth, asyncHandler(trabajadoresController.list));
router.get('/con-horas',      requireAuth, asyncHandler(trabajadoresController.listConHoras));
router.get('/nomina/costo',   requireAuth, asyncHandler(trabajadoresController.costoNominaMes));
router.post('/',              requireAuth, asyncHandler(trabajadoresController.create));
router.post('/nomina/liquidar', requireAuth, asyncHandler(trabajadoresController.liquidarNomina));
router.get('/:id/horas',      requireAuth, asyncHandler(trabajadoresController.horasTrabajador));
router.post('/:id/jornadas',  requireAuth, asyncHandler(trabajadoresController.registrarJornadas));
router.put('/:id',            requireAuth, asyncHandler(trabajadoresController.update));
router.delete('/:id',         requireAuth, asyncHandler(trabajadoresController.remove));

export default router;
