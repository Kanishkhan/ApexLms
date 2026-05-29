import { Router } from 'express';
import {
  getAchievementsProfile,
  checkAndUpdateStreak,
  getNotifications,
  markNotificationsRead,
} from '../controllers/gamificationController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.get('/profile', getAchievementsProfile);
router.post('/streak', checkAndUpdateStreak);
router.get('/notifications', getNotifications);
router.post('/notifications/read', markNotificationsRead);

export default router;
