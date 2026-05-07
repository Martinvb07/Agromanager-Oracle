import { Router } from 'express';
import asyncHandler from '../middleware/asyncHandler.js';
import requireAuth from '../middleware/requireAuth.js';
import { dashboardController } from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/',          requireAuth, asyncHandler(dashboardController.resumen));
router.get('/financiero',requireAuth, asyncHandler(dashboardController.resumenFinanciero));

export default router;
