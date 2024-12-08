import { Router } from 'express';
import { register, login, forgotPassword, resetPassword } from '../../controllers/auth.controllers.js';


const router = Router(); 

router.post('/register', register);
router.post('/login', login);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password', resetPassword);

export default router 