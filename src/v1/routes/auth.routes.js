import { Router } from 'express';
import { register } from '../../controllers/auth/register.controller.js';
import { login } from '../../controllers/auth/login.controller.js';
import { forgotPassword, resetPassword } from '../../controllers/auth/password.controller.js';
import { renewToken } from '../../controllers/auth/token.controller.js';

import { authenticateUser } from '../../middlewares/auth.js';


const router = Router(); 

router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password', resetPassword);
router.post('/auth/renew-token', authenticateUser, renewToken);

export default router 