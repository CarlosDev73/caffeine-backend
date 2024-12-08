import { Router } from 'express';
import { register, login, forgotPassword } from '../../controllers/auth.controllers.js';


const router = Router(); 

router.post('/register', register);
router.post('/login', login);
router.post('/auth/forgot-password', forgotPassword);

export default router 