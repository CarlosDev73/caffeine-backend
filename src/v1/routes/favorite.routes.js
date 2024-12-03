import { Router } from 'express';
import { markAsFavorite, unmarkAsFavorite, getUserFavorites, getPostFavorites } from '../../controllers/favorite.controller.js';
import { authenticateUser } from '../../middlewares/auth.js';

const router = Router();

router.post('/favorites', authenticateUser, markAsFavorite);
router.delete('/favorites', authenticateUser, unmarkAsFavorite);
router.get('/favorites', authenticateUser, getUserFavorites);
router.get('/:postId/favorites', getPostFavorites);

export default router;
