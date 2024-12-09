import { Router } from 'express';
import { register, login, forgotPassword, resetPassword, renewToken } from '../../controllers/auth.controllers.js';
import { authenticateUser } from '../../middlewares/auth.js';


const router = Router(); 

router.post('/register', register);
router.post('/login', login);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password', resetPassword);
router.post('/auth/renew-token', authenticateUser, renewToken);

export default router 