import { Discussion, IDiscussion } from '../models/Discussion';
import { NotFoundError, BadRequestError } from '../utils/customErrors';

export class DiscussionService {
  async getLessonDiscussions(lessonId: string): Promise<any[]> {
    // Fetch all discussions for this lesson
    const discussions = await Discussion.find({ lesson: lessonId })
      .populate('user', 'name email avatarUrl role')
      .sort({ createdAt: -1 });

    // Build comment trees dynamically
    const commentMap = new Map<string, any>();
    const rootComments: any[] = [];

    discussions.forEach((disc) => {
      const plainObj = disc.toObject() as any;
      plainObj.replies = [];
      commentMap.set(plainObj._id.toString(), plainObj);
    });

    commentMap.forEach((comment) => {
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId.toString());
        if (parent) {
          parent.replies.push(comment);
        } else {
          // If parent is deleted, orphan becomes a root
          rootComments.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });

    // Sort roots by upvotes count first, then date
    return rootComments.sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0));
  }

  async createPost(
    userId: string,
    postData: { lessonId: string; content: string; parentId?: string; isInstructor?: boolean }
  ): Promise<IDiscussion> {
    return Discussion.create({
      lesson: postData.lessonId as any,
      user: userId as any,
      content: postData.content,
      parentId: postData.parentId as any,
      isInstructorAnswer: !!postData.isInstructor,
    });
  }

  async toggleUpvote(userId: string, discussionId: string): Promise<IDiscussion> {
    const comment = await Discussion.findById(discussionId);
    if (!comment) throw new NotFoundError('Discussion comment not found');

    const hasUpvoted = comment.upvotes.some((id) => id.toString() === userId);
    if (hasUpvoted) {
      comment.upvotes = comment.upvotes.filter((id) => id.toString() !== userId);
    } else {
      comment.upvotes.push(userId as any);
    }

    return comment.save();
  }

  async moderatePost(
    discussionId: string,
    moderatorId: string,
    action: 'delete' | 'verify'
  ): Promise<any> {
    const comment = await Discussion.findById(discussionId);
    if (!comment) throw new NotFoundError('Comment not found');

    if (action === 'delete') {
      await Discussion.deleteMany({ parentId: discussionId }); // delete children
      await comment.deleteOne();
      return { deleted: true };
    }

    if (action === 'verify') {
      comment.isInstructorAnswer = true;
      return comment.save();
    }
  }
}

export const discussionService = new DiscussionService();
