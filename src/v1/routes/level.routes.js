import express from 'express';
import {
  createLevel,
  getLevels,
  assignLevelToUser,
} from '../../controllers/level.controllers.js';
import { authenticateUser } from '../../middlewares/auth.js';

const router = express.Router();

router.post('/levels', authenticateUser, createLevel);
router.get('/levels', authenticateUser, getLevels);
router.put('/levels/assign/:userId', authenticateUser, assignLevelToUser);

export default router;
