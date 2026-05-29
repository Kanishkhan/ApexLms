import { Router } from 'express';
import { getDiscussions, createPost, toggleUpvote, moderatePost } from '../controllers/discussionController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.get('/lesson/:lessonId', getDiscussions);
router.post('/', createPost);
router.post('/:id/upvote', toggleUpvote);
router.post('/:id/moderate', moderatePost);

export default router;
