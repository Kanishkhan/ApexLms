import { Router } from 'express';
import {
  createContest,
  getContests,
  getContestById,
  registerForContest,
  getContestLeaderboard,
} from '../controllers/contestController';
import { protect, restrictTo } from '../middleware/authMiddleware';

const router = Router();

router.post('/', protect, restrictTo('instructor', 'admin'), createContest);
router.get('/', protect, getContests);
router.get('/:id', protect, getContestById);
router.post('/:id/register', protect, registerForContest);
router.get('/:id/leaderboard', protect, getContestLeaderboard);

export default router;
