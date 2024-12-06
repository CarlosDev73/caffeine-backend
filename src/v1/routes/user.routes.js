import { Router } from 'express';
import { getAllUsers, getUser, changePassword, updateUser} from '../../controllers/user.controllers.js';
import { authenticateUser } from '../../middlewares/auth.js';

const router = Router(); 


router.get('/users',getAllUsers);
router.get('/users/:id',getUser);
router.put('/users/changePassword/:id',changePassword);
router.put('/users/update/:id',updateUser);





export default router 