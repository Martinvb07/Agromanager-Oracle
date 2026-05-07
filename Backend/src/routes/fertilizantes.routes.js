import { Router } from 'express';
import asyncHandler from '../middleware/asyncHandler.js';
import requireAuth from '../middleware/requireAuth.js';
import { fertilizantesController } from '../controllers/fertilizantes.controller.js';

const router = Router();

router.get('/', requireAuth, asyncHandler(fertilizantesController.list));
router.post('/', requireAuth, asyncHandler(fertilizantesController.create));
router.put('/:id', requireAuth, asyncHandler(fertilizantesController.update));
router.delete('/:id', requireAuth, asyncHandler(fertilizantesController.remove));

export default router;
