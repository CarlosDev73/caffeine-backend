import express from 'express';
import {
  createLevel,
  getLevels,
  assignLevelToUser,
} from '../../controllers/levels/level.controllers.js';
import { authenticateUser } from '../../middlewares/auth.js';

const router = express.Router();

router.post('/levels', authenticateUser, createLevel);
router.get('/levels', authenticateUser, getLevels);
router.put('/users/:userId/levels', authenticateUser, assignLevelToUser);

export default router;
