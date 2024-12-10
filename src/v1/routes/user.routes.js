import { Router } from 'express';
import { getAllUsers, getUser, changePassword, updateUser, getSearchUser, followUser, unfollowUser } from '../../controllers/users/user.controllers.js';
import { authenticateUser } from '../../middlewares/auth.js';

const router = Router(); 


router.get('/users', getAllUsers);
router.get('/users/search', getSearchUser);
router.get('/users/:id', getUser);
router.put('/users/:id/change-password', changePassword);
router.put('/users/:id', updateUser);
router.post('/users/:id/follow', authenticateUser, followUser);
router.post('/users/:id/unfollow', authenticateUser, unfollowUser);





export default router 