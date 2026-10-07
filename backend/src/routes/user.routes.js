import { Router } from 'express';
import { registerUser,loginUser , updateHealthProfile, logoutUser, refreshAccessToken, changeCurrentPassword } from '../controllers/user.controller.js';
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Endpoint: POST /api/v1/users/register
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/health-profile').post(updateHealthProfile);
router.route("/logout").post(verifyJWT,  logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword)

export default router;