import { Router } from 'express';
import { markAsFavorite, unmarkAsFavorite, getUserFavorites } from '../../controllers/favorite.controller.js';
import { authenticateUser } from '../../middlewares/auth.js';

const router = Router();

router.post('/favorites', authenticateUser, markAsFavorite);
router.delete('/favorites', authenticateUser, unmarkAsFavorite);
router.get('/favorites', authenticateUser, getUserFavorites);

export default router;
