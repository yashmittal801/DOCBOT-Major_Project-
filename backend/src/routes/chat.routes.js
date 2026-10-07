import { Router } from 'express';
import { handleChatQuery } from '../controllers/chat.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

// Secure chat route: POST /api/v1/chat
router.route('/').post(verifyJWT, handleChatQuery);

export default router;