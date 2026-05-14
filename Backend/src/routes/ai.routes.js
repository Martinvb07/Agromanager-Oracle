import { Router } from 'express';
import asyncHandler from '../middleware/asyncHandler.js';
import requireAuth from '../middleware/requireAuth.js';
import { aiController } from '../controllers/ai.controller.js';

const router = Router();

// Devuelve alertas activas del usuario (para badge del chatbot).
router.get('/alerts', requireAuth, asyncHandler(aiController.alerts));

// Genera recomendaciones usando contexto del panel.
router.post('/advice', requireAuth, asyncHandler(aiController.advice));

// Chat conversacional con el asistente AgroBot.
router.post('/chat', requireAuth, asyncHandler(aiController.chat));

export default router;
