import { Router } from 'express';
import { handleChatQuery , getChatHistory ,getRecentSessions, getSessionMessages} from '../controllers/chat.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/multer.middleware.js';

const router = Router();

// Secure chat route: POST /api/v1/chat
router.route('/').post(verifyJWT, upload.single('report'), handleChatQuery);
router.route('/history').get(verifyJWT, getChatHistory);

router.route('/sessions').get(verifyJWT, getRecentSessions);
router.route('/session/:chatSessionId').get(verifyJWT, getSessionMessages);

export default router;