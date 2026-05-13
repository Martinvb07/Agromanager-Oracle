import { Router } from 'express';
import asyncHandler from '../middleware/asyncHandler.js';
import requireAuth from '../middleware/requireAuth.js';
import { siembrasController } from '../controllers/siembras.controller.js';

const router = Router();

router.get('/', requireAuth, asyncHandler(siembrasController.list));

export default router;
