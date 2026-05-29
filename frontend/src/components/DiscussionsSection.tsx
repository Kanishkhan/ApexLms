import React, { useEffect, useState } from 'react';
import { discussionService } from '../services/api';
import { 
  MessageSquare, 
  ThumbsUp, 
  MessageCircle, 
  User, 
  Check, 
  Trash2, 
  Send,
  CornerDownRight,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Comment {
  _id: string;
  content: string;
  user: {
    _id: string;
    name: string;
    avatarUrl?: string;
    role: string;
  };
  upvotes: string[];
  isInstructorAnswer: boolean;
  replies: Comment[];
  createdAt: string;
}

interface DiscussionsSectionProps {
  lessonId: string;
  userRole?: string;
  userId?: string;
}

export default function DiscussionsSection({ lessonId, userRole, userId }: DiscussionsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [newReply, setNewReply] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (lessonId) fetchDiscussions();
  }, [lessonId]);

  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      const res = await discussionService.getDiscussions(lessonId);
      setComments(res.data);
    } catch (err) {
      console.error('Failed to load discussions: ', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await discussionService.createPost({
        lessonId,
        content: newComment,
      });
      setNewComment('');
      fetchDiscussions();
    } catch (err) {
      console.error('Failed to post comment: ', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostReply = async (parentId: string) => {
    if (!newReply.trim()) return;

    setSubmitting(true);
    try {
      await discussionService.createPost({
        lessonId,
        content: newReply,
        parentId,
      });
      setNewReply('');
      setReplyingTo(null);
      fetchDiscussions();
    } catch (err) {
      console.error('Failed to post reply: ', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleUpvote = async (commentId: string) => {
    try {
      await discussionService.toggleUpvote(commentId);
      fetchDiscussions();
    } catch (err) {
      console.error('Failed to toggle upvote: ', err);
    }
  };

  const handleModerate = async (commentId: string, action: 'delete' | 'verify') => {
    try {
      await discussionService.moderatePost(commentId, action);
      fetchDiscussions();
    } catch (err) {
      console.error('Failed to moderate: ', err);
    }
  };

  const isModerator = userRole === 'instructor' || userRole === 'admin';

  return (
    <div className="rounded-[2.5rem] border border-slate-200/55 dark:border-slate-800/60 p-6 sm:p-8 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md space-y-6 shadow-sm text-left">
      <div className="flex items-center justify-between border-b border-slate-200/30 dark:border-slate-850 pb-4">
        <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-brand-500" />
          <span>Syllabus Q&A Discussion Thread</span>
        </h2>
        <span className="text-[9px] font-bold text-slate-400 uppercase font-mono bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded">
          {comments.length} discussions
        </span>
      </div>

      {/* Post comment input box */}
      <form onSubmit={handlePostComment} className="flex gap-3">
        <input
          type="text"
          placeholder="Ask a question or share a thought on this lesson..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-grow p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
        />
        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className="px-4.5 py-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-705 disabled:bg-slate-700 rounded-xl transition-colors shrink-0 flex items-center space-x-1.5 shadow"
        >
          <Send className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Post</span>
        </button>
      </form>

      {loading ? (
        <div className="py-6 flex items-center justify-center text-xs text-slate-400 font-mono">
          Loading discussion threads...
        </div>
      ) : comments.length === 0 ? (
        <div className="py-10 text-center text-slate-400 space-y-2 max-w-xs mx-auto">
          <MessageCircle className="h-6 w-6 text-slate-300 dark:text-slate-800 mx-auto" />
          <p className="text-xs font-semibold">No questions yet</p>
          <p className="text-[10px]">Be the first to post a study comment or query!</p>
        </div>
      ) : (
        <div className="space-y-4 pt-2">
          {comments.map((comment) => (
            <div key={comment._id} className="space-y-3.5 border-b border-slate-100 dark:border-slate-850/40 pb-4 last:border-b-0 last:pb-0">
              
              {/* Comment Body */}
              <div className="flex gap-3 items-start">
                <img
                  src={comment.user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${comment.user.name}`}
                  alt={comment.user.name}
                  className="h-8.5 w-8.5 rounded-full border border-slate-200 dark:border-slate-800 object-cover bg-slate-50 shrink-0"
                />

                <div className="flex-grow space-y-1.5 overflow-hidden">
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{comment.user.name}</span>
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded ${
                      comment.user.role === 'instructor' ? 'text-brand-500 bg-brand-500/10 border border-brand-500/10' :
                      comment.user.role === 'admin' ? 'text-purple-500 bg-purple-500/10 border border-purple-500/10' :
                      'text-slate-400 bg-slate-100 dark:bg-slate-950'
                    }`}>
                      {comment.user.role}
                    </span>
                    <span className="text-[9px] text-slate-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>

                  <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed">{comment.content}</p>

                  {/* Comment Toolbar */}
                  <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-slate-400 pt-1">
                    <button
                      onClick={() => handleToggleUpvote(comment._id)}
                      className={`flex items-center space-x-1.5 hover:text-brand-500 transition-colors ${
                        comment.upvotes.includes(userId || '') ? 'text-brand-500' : ''
                      }`}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>{comment.upvotes?.length || 0} Upvotes</span>
                    </button>

                    <button
                      onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                      className="flex items-center space-x-1.5 hover:text-brand-500 transition-colors"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>Reply</span>
                    </button>

                    {/* Instructor Answer Badge */}
                    {comment.isInstructorAnswer && (
                      <span className="flex items-center text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded font-black uppercase tracking-wider text-[8px] border border-emerald-500/10">
                        <Check className="h-2.5 w-2.5 mr-0.5" /> Instructor Verified
                      </span>
                    )}

                    {/* Moderator controls */}
                    {isModerator && (
                      <div className="flex items-center space-x-2 border-l border-slate-200/50 pl-2">
                        {!comment.isInstructorAnswer && (
                          <button
                            onClick={() => handleModerate(comment._id, 'verify')}
                            className="text-emerald-500 hover:underline"
                          >
                            Verify
                          </button>
                        )}
                        <button
                          onClick={() => handleModerate(comment._id, 'delete')}
                          className="text-red-500 hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Reply inputs */}
              <AnimatePresence>
                {replyingTo === comment._id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pl-11 flex gap-2 overflow-hidden"
                  >
                    <input
                      type="text"
                      placeholder={`Reply to ${comment.user.name}...`}
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                      className="flex-grow p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                    />
                    <button
                      onClick={() => handlePostReply(comment._id)}
                      disabled={submitting || !newReply.trim()}
                      className="px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-705 rounded-xl transition-colors"
                    >
                      Post Reply
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Threaded Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="pl-11 space-y-3 pt-2">
                  {comment.replies.map((reply) => (
                    <div key={reply._id} className="flex gap-2.5 items-start">
                      <CornerDownRight className="h-4.5 w-4.5 text-slate-300 dark:text-slate-800 shrink-0 mt-2" />
                      <img
                        src={reply.user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${reply.user.name}`}
                        alt={reply.user.name}
                        className="h-7 w-7 rounded-full border border-slate-200 dark:border-slate-800 object-cover bg-slate-50 shrink-0"
                      />
                      <div className="flex-grow space-y-1 overflow-hidden">
                        <div className="flex items-center space-x-2 text-[11px]">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{reply.user.name}</span>
                          <span className={`text-[7px] font-black uppercase px-1 py-0.1 rounded ${
                            reply.user.role === 'instructor' ? 'text-brand-500 bg-brand-500/10 border border-brand-500/10' :
                            reply.user.role === 'admin' ? 'text-purple-500 bg-purple-500/10 border border-purple-500/10' :
                            'text-slate-400 bg-slate-100 dark:bg-slate-950'
                          }`}>
                            {reply.user.role}
                          </span>
                          <span className="text-[8px] text-slate-400">{new Date(reply.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed">{reply.content}</p>

                        <div className="flex items-center space-x-2.5 text-[9px] font-bold text-slate-400 pt-0.5">
                          <button
                            onClick={() => handleToggleUpvote(reply._id)}
                            className="hover:text-brand-500 transition-colors"
                          >
                            {reply.upvotes?.length || 0} Upvotes
                          </button>
                          {isModerator && (
                            <button
                              onClick={() => handleModerate(reply._id, 'delete')}
                              className="text-red-500 hover:text-red-400"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
