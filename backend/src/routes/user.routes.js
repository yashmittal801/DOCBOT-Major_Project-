import { Router } from 'express';
import { registerUser,loginUser , updateHealthProfile } from '../controllers/user.controller.js';

const router = Router();

// Endpoint: POST /api/v1/users/register
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/health-profile').post(updateHealthProfile);

export default router;