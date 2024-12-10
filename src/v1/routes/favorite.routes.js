import { Router } from 'express';
import { markAsFavorite, unmarkAsFavorite, getUserFavorites, getPostFavorites } from '../../controllers/favorites/favorite.controller.js';
import { authenticateUser } from '../../middlewares/auth.js';

const router = Router();

router.post('/posts/:postId/favorites', authenticateUser, markAsFavorite);
router.delete('/posts/:postId/favorites', authenticateUser, unmarkAsFavorite);
router.get('/users/favorites', authenticateUser, getUserFavorites);
router.get('/posts/:postId/favorites', getPostFavorites);

export default router;
