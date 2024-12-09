import { Router } from 'express';
import { getAllUsers, getUser, changePassword, updateUser, getSearchUser, followUser, unfollowUser } from '../../controllers/user.controllers.js';
import { authenticateUser } from '../../middlewares/auth.js';

const router = Router(); 


router.get('/users', getAllUsers);
router.get('/users/searchUser', getSearchUser);
router.get('/users/:id', getUser);
router.put('/users/changePassword/:id', changePassword);
router.put('/users/update/:id', updateUser);
router.post('/users/follow/:id', authenticateUser, followUser);
router.post('/users/unfollow/:id', authenticateUser, unfollowUser);





export default router 