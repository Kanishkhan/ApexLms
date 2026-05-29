import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { courseService, quizService } from '../services/api';
import type { Course, Lesson } from '../types';
import VideoPlayer from '../components/VideoPlayer';
import PdfViewer from '../components/PdfViewer';
import DiscussionsSection from '../components/DiscussionsSection';
import { 
  ArrowLeft, 
  CheckCircle, 
  Circle, 
  Bookmark, 
  Menu, 
  PlayCircle, 
  FileText, 
  BookOpen, 
  ChevronRight,
  ClipboardList,
  Sparkles,
  X,
  HelpCircle,
  Bot,
  Send,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  sender: 'ai' | 'user';
  text: string;
}

export default function CoursePlayer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // AI Copilot Drawer states
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userQuery, setUserQuery] = useState('');
  const [aiStreaming, setAiStreaming] = useState(false);

  useEffect(() => {
    if (id) fetchCourseAndCurriculum();
  }, [id]);

  useEffect(() => {
    if (currentModuleId) {
      checkModuleQuiz(currentModuleId);
    }
  }, [currentModuleId]);

  useEffect(() => {
    if (currentLesson) {
      // Prefill AI greeting message matching the current lesson context
      setChatMessages([
        { sender: 'ai', text: `Hello ${user?.name?.split(' ')[0] || 'Engineer'}! I am your ALC Architectural Copilot. Ask me any conceptual question or click a prompt below to accelerate your study of "${currentLesson.title}".` }
      ]);
    }
  }, [currentLesson]);

  const fetchCourseAndCurriculum = async () => {
    setLoading(true);
    try {
      const data = await courseService.getCourseById(id!);
      const courseObj = data.data;
      setCourse(courseObj);

      // Default to first lesson of first module
      if (courseObj.modules && courseObj.modules.length > 0) {
        const firstModule = courseObj.modules[0];
        if (firstModule.lessons && firstModule.lessons.length > 0) {
          setCurrentLesson(firstModule.lessons[0]);
          setCurrentModuleId(firstModule._id);
        }
      }
    } catch (err) {
      console.error('Failed to load course details: ', err);
    } finally {
      setLoading(false);
    }
  };

  const checkModuleQuiz = async (moduleId: string) => {
    try {
      const data = await quizService.getQuizByModule(moduleId);
      if (data.success && data.data) {
        setQuizId(data.data._id);
      } else {
        setQuizId(null);
      }
    } catch {
      setQuizId(null);
    }
  };

  const handleToggleComplete = async () => {
    if (!currentLesson || !course) return;
    const nextCompletedState = !currentLesson.isCompleted;

    try {
      const data = await courseService.toggleProgress(currentLesson._id, nextCompletedState);
      
      setCurrentLesson({
        ...currentLesson,
        isCompleted: nextCompletedState,
      });

      const updatedModules = course.modules?.map((mod) => {
        const updatedLessons = mod.lessons.map((les) => {
          if (les._id === currentLesson._id) {
            return { ...les, isCompleted: nextCompletedState };
          }
          return les;
        });
        return { ...mod, lessons: updatedLessons };
      });

      setCourse({
        ...course,
        modules: updatedModules,
        progressPercentage: data.data.progressPercentage,
      });
    } catch (err) {
      console.error('Toggle progress failed: ', err);
    }
  };

  const handleToggleBookmark = async () => {
    if (!currentLesson) return;
    const nextBookmarkState = !currentLesson.bookmark;

    try {
      await courseService.toggleBookmark(currentLesson._id, nextBookmarkState);
      
      setCurrentLesson({
        ...currentLesson,
        bookmark: nextBookmarkState,
      });

      const updatedModules = course?.modules?.map((mod) => {
        const updatedLessons = mod.lessons.map((les) => {
          if (les._id === currentLesson._id) {
            return { ...les, bookmark: nextBookmarkState };
          }
          return les;
        });
        return { ...mod, lessons: updatedLessons };
      });

      if (course) {
        setCourse({
          ...course,
          modules: updatedModules,
        });
      }
    } catch (err) {
      console.error('Toggle bookmark failed: ', err);
    }
  };

  const selectLesson = (lesson: Lesson, moduleId: string) => {
    setCurrentLesson(lesson);
    setCurrentModuleId(moduleId);
  };

  // AI Conversational chat processing
  const handleSendAiMessage = (queryText: string) => {
    if (!queryText.trim() || aiStreaming) return;

    const newQuery: ChatMessage = { sender: 'user', text: queryText };
    setChatMessages(prev => [...prev, newQuery]);
    setUserQuery('');
    setAiStreaming(true);

    // Simulate AI Copilot streamed heuristics response
    setTimeout(() => {
      let answer = '';
      if (queryText.toLowerCase().includes('summary')) {
        answer = `Here is a structured executive summary of "${currentLesson?.title}":
1. **Architectural Objective**: Establish clear decoupling protocols and encapsulation layers.
2. **Core Pattern**: Model-View-Controller injections to isolate database operations from API endpoints.
3. **Deliverable Outcome**: 100% test-compliant robust REST controller architectures.`;
      } else if (queryText.toLowerCase().includes('code') || queryText.toLowerCase().includes('explain')) {
        answer = `Conceptual code review for: "${currentLesson?.title}":
\`\`\`javascript
// Injection service controller validation logic
const payload = req.body;
const validation = schema.safeParse(payload);
if (!validation.success) {
  throw new ValidationError(validation.error.message);
}
\`\`\`
*This Zod assertion guarantees that all request endpoints enforce WCAG and strict type parameters!*`;
      } else {
        answer = `Excellent query! On "${currentLesson?.title}", we emphasize clean encapsulation. To master this concept, I recommend reviewing:
- **Repository Interface Decoupling** (Milestone node 3)
- **Monaco challenge playgrounds** related to system arrays.

Would you like me to generate a mockup quiz or explain standard constructor patterns?`;
      }

      setChatMessages(prev => [...prev, { sender: 'ai', text: answer }]);
      setAiStreaming(false);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 font-sans bg-grid">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500 font-sans">Loading learning environment...</p>
        </div>
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 font-sans bg-grid">
        <HelpCircle className="h-12 w-12 text-slate-400 animate-bounce" />
        <h3 className="text-lg font-bold">Curriculum view not found</h3>
        <button onClick={() => navigate('/courses')} className="px-5 py-2.5 bg-brand-650 hover:bg-brand-600 text-white rounded-xl font-bold shadow-md transition-all">Return to explore</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300 relative overflow-hidden bg-grid text-slate-900 dark:text-slate-100">
      
      {/* Course player custom top navbar */}
      <header className="glass-nav px-4 md:px-6 py-4 flex items-center justify-between z-30 relative bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(`/courses/${course._id}`)}
            className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-405 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div className="overflow-hidden text-left font-sans">
            <h1 className="text-sm font-black text-slate-900 dark:text-slate-100 truncate max-w-[180px] sm:max-w-md">{course.title}</h1>
            <p className="text-[10px] text-slate-450 font-bold mt-0.5 uppercase tracking-wider font-mono">Progress: {course.progressPercentage || 0}% Complete</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* AI Copilot Drawer toggle button */}
          <button
            onClick={() => {
              setAiDrawerOpen(!aiDrawerOpen);
              if (sidebarOpen) setSidebarOpen(false);
            }}
            className={`p-2.5 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-650 dark:text-slate-350 hover:text-brand-500 flex items-center space-x-2 transition-all font-sans font-bold text-xs ${
              aiDrawerOpen ? 'border-brand-500 bg-brand-500/5 text-brand-500' : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <Bot className="h-4.5 w-4.5 text-brand-500 animate-pulse" />
            <span className="hidden sm:inline">AI Copilot</span>
          </button>

          <button
            onClick={() => {
              setSidebarOpen(!sidebarOpen);
              if (aiDrawerOpen) setAiDrawerOpen(false);
            }}
            className={`p-2.5 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-650 dark:text-slate-350 hover:text-brand-500 flex items-center space-x-2 transition-all font-sans font-bold text-xs ${
              sidebarOpen ? 'border-brand-500 bg-brand-500/5 text-brand-500' : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <Menu className="h-4.5 w-4.5" />
            <span className="hidden sm:inline">Curriculum</span>
          </button>
        </div>
      </header>

      {/* Main split-view container */}
      <div className="flex-grow flex items-stretch min-h-0 relative overflow-hidden">
        
        {/* Left pane content */}
        <div className="flex-grow p-4 md:p-6 overflow-y-auto min-w-0 z-10 relative">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Main Interactive Media Frame (WOW Factor Frame Glows) */}
            <div className="w-full rounded-[2rem] overflow-hidden border-2 border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl relative glow-effect">
              {currentLesson.type === 'video' && currentLesson.videoUrl && (
                <div className="aspect-video bg-black relative">
                  <VideoPlayer url={currentLesson.videoUrl} onEnded={handleToggleComplete} />
                </div>
              )}
              {currentLesson.type === 'pdf' && currentLesson.pdfUrl && (
                <div className="h-[60vh] bg-slate-100 dark:bg-slate-950 relative">
                  <PdfViewer url={currentLesson.pdfUrl} title={currentLesson.title} />
                </div>
              )}
              {currentLesson.type === 'text' && (
                <div className="p-6 sm:p-8 space-y-4 text-left">
                  <div className="h-11 w-11 bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-500">
                    <BookOpen className="h-5.5 w-5.5" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">{currentLesson.title}</h3>
                  <div className="text-slate-650 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line border-t border-slate-200 dark:border-slate-800 pt-5">
                    {currentLesson.content || 'Content not configured.'}
                  </div>
                </div>
              )}
            </div>

            {/* Media Controller toolbar (Mark Completed / Bookmark) */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border-2 border-slate-300 dark:border-slate-800 shadow-md">
              <div className="flex items-center space-x-2.5">
                <button
                  onClick={handleToggleComplete}
                  className={`flex items-center space-x-2 px-5 py-3 text-xs font-bold rounded-xl transition-all shadow-sm ${
                    currentLesson.isCompleted
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/10'
                      : 'bg-indigo-650 hover:bg-indigo-600 text-white shadow-brand-500/10'
                  }`}
                >
                  <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                  <span>{currentLesson.isCompleted ? 'Module Completed!' : 'Mark Node Complete'}</span>
                </button>

                <button
                  onClick={handleToggleBookmark}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-center ${
                    currentLesson.bookmark
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <Bookmark className="h-4.5 w-4.5 fill-current shrink-0" />
                </button>
              </div>

              {/* Assessment link (If module quiz exists) */}
              {quizId && (
                <Link
                  to={`/quizzes/${quizId}/play`}
                  className="flex items-center space-x-2 px-5 py-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-705 rounded-xl transition-all shadow-md group shrink-0"
                >
                  <ClipboardList className="h-4.5 w-4.5 text-brand-500 mr-1 animate-pulse" />
                  <span>Start Module Assessment</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}
            </div>

            {/* Lesson details text */}
            <div className="space-y-2 text-left p-2">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">{currentLesson.title}</h2>
              <p className="text-xs text-slate-600 dark:text-slate-405 leading-relaxed font-normal">{currentLesson.description}</p>
            </div>

            {/* Threaded Q&A Lesson Discussions */}
            <DiscussionsSection 
              lessonId={currentLesson._id} 
              userRole={user?.role} 
              userId={(user as any)?._id || (user as any)?.id} 
            />

          </div>
        </div>

        {/* Right pane syllabus sidebar panel */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l-2 border-slate-300 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md h-full flex flex-col z-20 shrink-0 relative transition-all duration-300"
            >
              <div className="p-4 border-b-2 border-slate-200 dark:border-slate-900 flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center">
                  <BookOpen className="w-4 h-4 mr-1.5 text-brand-500" />
                  <span>Syllabus Checklist</span>
                </span>
                <button 
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-grow overflow-y-auto divide-y divide-slate-150 dark:divide-slate-900/60 custom-scrollbar">
                {course.modules?.map((mod, modIdx) => (
                  <div key={mod._id} className="py-3">
                    <div className="px-4 pb-2 text-left">
                      <span className="text-[8px] font-black text-brand-650 dark:text-brand-400 uppercase tracking-widest bg-brand-500/10 px-2 py-0.5 rounded-md">
                        Module {modIdx + 1}
                      </span>
                      <h4 className="text-[11px] font-black text-slate-850 dark:text-slate-200 leading-snug mt-1.5">{mod.title}</h4>
                    </div>

                    <div className="space-y-0.5">
                      {mod.lessons?.map((les) => {
                        const isSelected = les._id === currentLesson._id;
                        const isVideo = les.type === 'video';
                        return (
                          <button
                            key={les._id}
                            onClick={() => selectLesson(les, mod._id)}
                            className={`flex items-start space-x-3 w-full px-4 py-3 text-left text-xs font-medium transition-colors ${
                              isSelected
                                ? 'bg-brand-50/5 dark:bg-brand-500/10 text-brand-700 dark:text-brand-350 border-l-2 border-brand-500'
                                : 'text-slate-650 dark:text-slate-450 hover:bg-slate-100/50 dark:hover:bg-slate-900/30'
                            }`}
                          >
                            <span className="mt-0.5 shrink-0">
                              {les.isCompleted ? (
                                <CheckCircle className="h-4.5 w-4.5 text-emerald-500 fill-emerald-500/10 shrink-0" />
                              ) : (
                                <Circle className="h-4.5 w-4.5 text-slate-350 dark:text-slate-800 shrink-0" />
                              )}
                            </span>
                            <div className="min-w-0 text-left">
                              <p className={`truncate text-xs font-bold leading-normal ${
                                isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-355'
                              }`}>
                                {les.title}
                              </p>
                              <div className="flex items-center space-x-1.5 text-[9px] font-bold text-slate-450 mt-1 font-sans">
                                {isVideo ? <PlayCircle className="h-3 w-3 text-brand-500 shrink-0" /> : <FileText className="h-3 w-3 text-emerald-500 shrink-0" />}
                                <span className="font-mono">{les.duration} mins</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Collapsible AI Copilot drawer sidebar panel */}
        <AnimatePresence>
          {aiDrawerOpen && (
            <motion.aside 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l-2 border-slate-300 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md h-full flex flex-col z-20 shrink-0 relative transition-all duration-300 text-left"
            >
              <div className="p-4 border-b-2 border-slate-200 dark:border-slate-900 flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center">
                  <Bot className="w-4.5 h-4.5 mr-1.5 text-brand-500 animate-pulse" />
                  <span>AI Copilot Tutor</span>
                </span>
                <button 
                  onClick={() => setAiDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-705 dark:hover:text-white rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Thread history */}
              <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar text-[11px] font-sans">
                {chatMessages.map((msg, index) => (
                  <div 
                    key={index}
                    className={`flex items-start space-x-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-550 shrink-0 border border-indigo-500/15">
                        <Bot className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <div className={`p-3 rounded-2xl max-w-[220px] leading-relaxed whitespace-pre-line border ${
                      msg.sender === 'user'
                        ? 'bg-indigo-650 text-white border-indigo-700 self-end'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-250 dark:border-slate-850 text-slate-700 dark:text-slate-300'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {aiStreaming && (
                  <div className="flex items-center space-x-2 text-slate-450 italic font-mono text-[9px] pl-7">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-450 animate-bounce" />
                    <span>AI Copilot is thinking...</span>
                  </div>
                )}
              </div>

              {/* Quick Prompt actions menu */}
              <div className="p-3.5 border-t border-slate-200 dark:border-slate-900 space-y-2 bg-slate-50/50 dark:bg-slate-900/10">
                <p className="text-[8px] font-black uppercase tracking-wider text-slate-450 mb-1">Quick Copilot Prompts</p>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => handleSendAiMessage(`Generate summary for lesson: "${currentLesson.title}"`)}
                    className="w-full text-left p-2 rounded-lg bg-white dark:bg-slate-905 border border-slate-300 dark:border-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-350 hover:border-brand-500 hover:text-brand-500 transition-all flex items-center"
                  >
                    <MessageSquare className="h-3.5 w-3.5 mr-1.5 text-indigo-500" /> Explain Lesson Summary
                  </button>
                  <button
                    onClick={() => handleSendAiMessage(`Explain core code snippets related to lesson: "${currentLesson.title}"`)}
                    className="w-full text-left p-2 rounded-lg bg-white dark:bg-slate-905 border border-slate-300 dark:border-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-350 hover:border-brand-500 hover:text-brand-500 transition-all flex items-center"
                  >
                    <FileText className="h-3.5 w-3.5 mr-1.5 text-emerald-500" /> Explain Code Snippet
                  </button>
                </div>
              </div>

              {/* Chat Input deck */}
              <div className="p-3 border-t-2 border-slate-200 dark:border-slate-900 bg-slate-950 flex gap-2">
                <input
                  type="text"
                  placeholder="Ask conceptual questions..."
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSendAiMessage(userQuery); }}
                  className="flex-grow p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                />
                <button
                  onClick={() => handleSendAiMessage(userQuery)}
                  disabled={!userQuery.trim() || aiStreaming}
                  className="p-2.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl disabled:bg-slate-800 transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
