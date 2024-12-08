import { Router } from 'express';
import { markAsFavorite, unmarkAsFavorite, getUserFavorites, getPostFavorites } from '../../controllers/favorite.controller.js';
import { authenticateUser } from '../../middlewares/auth.js';

const router = Router();

router.post('/:postId/favorite', authenticateUser, markAsFavorite);
router.delete('/:postId/unfavorite', authenticateUser, unmarkAsFavorite);
router.get('/favorites', authenticateUser, getUserFavorites);
router.get('/:postId/favorites', getPostFavorites);

export default router;
