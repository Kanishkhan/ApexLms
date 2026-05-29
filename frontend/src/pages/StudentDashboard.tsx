import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { dashboardService, gamificationService, codingService, assignmentService } from '../services/api';
import { 
  Award, 
  BookOpen, 
  Bookmark, 
  Sparkles, 
  PlayCircle, 
  CheckCircle, 
  ArrowRight,
  Clock,
  Compass,
  Trophy,
  Flame,
  Code2,
  FolderGit2,
  Bell,
  Terminal,
  AlertTriangle,
  AwardIcon,
  Trash2,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants, staggerContainer, cardVariants } from '../animations/variants';

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<any | null>(null);
  const [achievements, setAchievements] = useState<any | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [codingProblems, setCodingProblems] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [metricsRes, achRes, notRes, codRes, subRes] = await Promise.all([
        dashboardService.getStudentDashboard(),
        gamificationService.getAchievementsProfile(),
        gamificationService.getNotifications(),
        codingService.getProblems(),
        assignmentService.getStudentSubmissions()
      ]);
      setMetrics(metricsRes.data);
      setAchievements(achRes.data);
      setNotifications(notRes.data || []);
      setCodingProblems(codRes.data || []);
      setSubmissions(subRes.data || []);

      // Auto update streak telemetry
      await gamificationService.checkAndUpdateStreak();
    } catch (err) {
      console.error('Failed to load student dashboard info: ', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkNotificationsRead = async () => {
    try {
      await gamificationService.markNotificationsRead(notifications.map((n) => n._id));
      const notRes = await gamificationService.getNotifications();
      setNotifications(notRes.data || []);
    } catch (err) {
      console.error('Failed to clear notifications feed: ', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 font-sans max-w-6xl mx-auto p-6 md:p-8 animate-pulse bg-grid">
        <div className="space-y-2">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  // Calculate level progress
  const currentLevel = achievements?.level || 1;
  const totalXp = achievements?.totalXp || 0;
  const prevThreshold = Math.pow(currentLevel - 1, 2) * 100;
  const nextThreshold = Math.pow(currentLevel, 2) * 100;
  const levelProgress = nextThreshold === prevThreshold ? 0 : Math.min(100, Math.max(0, ((totalXp - prevThreshold) / (nextThreshold - prevThreshold)) * 100));

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-8 font-sans transition-all duration-300 max-w-6xl mx-auto px-4 py-6 md:py-8 bg-grid text-slate-800 dark:text-slate-100"
    >
      {/* Header telemetry section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/60 pb-6">
        <div>
          <span className="text-[9px] font-bold text-brand-650 dark:text-brand-400 uppercase tracking-widest bg-brand-500/10 px-2.5 py-0.5 rounded-md">
            Student Telemetry Center
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">Student Dashboard Hub</h1>
          <p className="text-xs text-slate-500 dark:text-slate-450 mt-1">Accelerate your software engineering paths and monitor assessment metrics.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Flame streak widget */}
          <div className="h-10 px-4 rounded-xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-sm flex items-center space-x-2 text-xs font-black text-amber-650 dark:text-amber-400">
            <Flame className="h-4.5 w-4.5 text-amber-500 fill-amber-500 animate-pulse" />
            <span>{achievements?.currentStreak || 0} Day Streak</span>
          </div>
          {/* XP Widget */}
          <div className="h-10 px-4 rounded-xl border border-purple-500/20 bg-purple-500/5 backdrop-blur-sm flex items-center space-x-2 text-xs font-black text-purple-650 dark:text-purple-450">
            <Sparkles className="h-4.5 w-4.5 text-purple-500 fill-purple-400 animate-spin" />
            <span>{achievements?.totalXp || 0} XP</span>
          </div>
          {/* Level Widget */}
          <div className="h-10 px-4 rounded-xl border border-brand-500/20 bg-brand-500/5 backdrop-blur-sm flex items-center space-x-2 text-xs font-black text-brand-650 dark:text-brand-400">
            <Trophy className="h-4.5 w-4.5 text-brand-550 fill-brand-550/10" />
            <span>Level {achievements?.level || 1} Specialist</span>
          </div>
        </div>
      </div>

      {/* Main Column Split Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Course player catalogs, Monaco arena, and submissions (Col 8) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Gamification Rpg Progress Bar Panel */}
          <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-950 to-brand-950/20 border border-slate-800 shadow-xl text-left relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-[40%] aspect-square rounded-full bg-brand-500/10 blur-[80px] -z-10" />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-850 pb-4 mb-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">GAMIFIED SPECIALIZATION TRACKS</p>
                <h3 className="text-lg font-black text-white mt-1">Level {achievements?.level || 1} Architect Milestone</h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 font-mono">
                  {totalXp} / {nextThreshold} XP ({Math.floor(levelProgress)}%)
                </span>
              </div>
            </div>

            {/* XP Level Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-850">
                <div 
                  className="bg-gradient-to-r from-brand-500 via-purple-500 to-emerald-450 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${levelProgress}%` }} 
                />
              </div>
              <div className="flex justify-between text-[9px] font-bold text-slate-500 font-mono uppercase">
                <span>Level {currentLevel} Specialist</span>
                <span>Level {currentLevel + 1} Specialist (+{(nextThreshold - totalXp)} XP)</span>
              </div>
            </div>

            {/* Achievements Badges Roster */}
            {achievements?.badges && achievements.badges.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-850/60 space-y-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">UNLOCKED MILESTONE BADGES</p>
                <div className="flex flex-wrap gap-2.5">
                  {achievements.badges.map((badge: any, idx: number) => (
                    <div 
                      key={idx}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-extrabold text-amber-400 shadow-sm"
                    >
                      <Award className="h-3.5 w-3.5 text-amber-500 fill-amber-500/10" />
                      <span>{badge.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Active Ongoing Curriculums */}
          <div className="rounded-[2.5rem] border border-slate-200/55 dark:border-slate-800/60 p-6 sm:p-8 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200/30 dark:border-slate-800/50 pb-4">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-brand-500 animate-ping" />
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Active Ongoing Curriculums</h2>
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">APEX_ENROLLMENTS</span>
            </div>

            {metrics?.enrollments?.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
                <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center mx-auto text-slate-400">
                  <Compass className="h-5.5 w-5.5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-350">You are not enrolled in any paths yet.</p>
                  <p className="text-[9px] text-slate-400 max-w-xs mx-auto">Access our elite Software Architecture and Advanced React tracks today.</p>
                </div>
                <Link to="/courses" className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-705 text-white text-xs font-bold rounded-xl transition-colors">
                  <span>View Course Catalog</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {metrics.enrollments.map((enr: any) => (
                  <div 
                    key={enr.id} 
                    className="p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col justify-between space-y-5 hover:border-brand-500/25 transition-all duration-300 group"
                  >
                    <div className="flex items-start space-x-3.5">
                      <img
                        src={enr.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300'}
                        alt={enr.title}
                        className="h-12 w-12 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200/30"
                      />
                      <div className="overflow-hidden text-left">
                        <span className="text-[8px] font-black uppercase tracking-wider text-brand-650 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-md">
                          {enr.category || 'Topic'}
                        </span>
                        <h3 className="text-xs font-extrabold text-slate-850 dark:text-white truncate mt-1.5 group-hover:text-brand-500 transition-colors">{enr.title}</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 leading-normal">{enr.subtitle}</p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between text-[10px] text-slate-450 dark:text-slate-400 font-bold">
                        <span className="flex items-center"><Clock className="h-3 w-3 mr-1 text-slate-400" /> Syllabus Completed</span>
                        <span className="text-brand-600 dark:text-brand-400 font-extrabold">{enr.progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-slate-200/60 dark:bg-slate-850 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-brand-500 to-indigo-650 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${enr.progressPercentage}%` }} 
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/courses/${enr.id}/play`)}
                      className="flex items-center justify-center space-x-2 w-full py-3 bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-705 text-white text-xs font-bold rounded-xl transition-all shadow-sm group-hover:bg-brand-600"
                    >
                      <PlayCircle className="h-4 w-4 shrink-0" />
                      <span>Resume Course Syllabus</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Monaco Coding Arena Playgrounds */}
          <div className="rounded-[2.5rem] border border-slate-200/55 dark:border-slate-800/60 p-6 sm:p-8 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200/30 dark:border-slate-800/50 pb-4">
              <div className="flex items-center space-x-2">
                <Code2 className="h-5 w-5 text-brand-500 mr-1.5" />
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Architectural Coding Sandboxes</h2>
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">MONACO_COMPILER_V1</span>
            </div>

            {codingProblems.length === 0 ? (
              <p className="text-xs text-slate-400 py-10 text-center font-sans font-medium">No sandbox challenges seeded.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {codingProblems.map((prob: any) => (
                  <div 
                    key={prob._id} 
                    className="p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 hover:border-brand-500/25 flex flex-col justify-between space-y-4 hover:-translate-y-0.5 transition-all duration-300 group"
                  >
                    <div className="text-left">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md border ${
                          prob.difficulty === 'easy' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                          prob.difficulty === 'medium' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                          'text-red-400 bg-red-500/10 border-red-500/20'
                        }`}>
                          {prob.difficulty}
                        </span>
                        <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md flex items-center shrink-0">
                          <Sparkles className="h-3 w-3 mr-0.5 fill-purple-450 text-purple-450" />
                          {prob.points} XP
                        </span>
                      </div>
                      <h3 className="text-xs font-extrabold text-slate-850 dark:text-white mt-3 group-hover:text-brand-500 transition-colors truncate">{prob.title}</h3>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{prob.description}</p>
                    </div>

                    <button
                      onClick={() => navigate(`/coding/${prob._id}`)}
                      className="flex items-center justify-center space-x-1.5 w-full py-2.5 bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-705 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                    >
                      <Terminal className="h-3.5 w-3.5 text-brand-500" />
                      <span>Launch Monaco Sandbox</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Project Rubric Submissions Evaluator */}
          {submissions.length > 0 && (
            <div className="rounded-[2.5rem] border border-slate-200/55 dark:border-slate-800/60 p-6 sm:p-8 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200/30 dark:border-slate-800/50 pb-4">
                <div className="flex items-center space-x-2">
                  <FolderGit2 className="h-5 w-5 text-purple-500 mr-1.5" />
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Project Deliverable Evaluator</h2>
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">RUBRIC_CRITERIA_MATCH</span>
              </div>

              <div className="space-y-4">
                {submissions.map((sub: any) => (
                  <div 
                    key={sub._id}
                    className="p-4 rounded-2xl border border-slate-200/40 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left hover:border-brand-500/20 transition-all duration-300"
                  >
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{sub.assignment?.title || 'Seeded Architectural Project'}</h4>
                      <div className="flex items-center space-x-3.5 text-[9px] font-bold text-slate-450 mt-1">
                        <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-0.5 text-slate-405" /> Submitted: {new Date(sub.submittedAt).toLocaleDateString()}</span>
                        {sub.githubUrl && <a href={sub.githubUrl} target="_blank" rel="noopener noreferrer" className="text-brand-555 hover:underline font-mono truncate max-w-[200px]">github.com-repo</a>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {sub.status === 'graded' ? (
                        <div className="text-right">
                          <span className="text-[10px] font-extrabold text-emerald-650 bg-emerald-500/10 px-3 py-1 rounded-lg">
                            Score: {sub.pointsEarned} / {sub.assignment?.maxPoints || 100}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-black text-brand-650 bg-brand-500/10 px-3 py-1 rounded-lg">
                          Pending Rubric Grade
                        </span>
                      )}
                      
                      <button
                        onClick={() => navigate(`/assignments/${sub.assignment?._id}`)}
                        className="px-3.5 py-1.5 text-[10px] font-black text-slate-700 hover:text-slate-900 dark:text-slate-350 dark:hover:text-white bg-slate-200 dark:bg-slate-800 rounded-lg hover:bg-slate-250 dark:hover:bg-slate-750 transition-colors"
                      >
                        View Console
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grid columns for bookmarks and recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Bookmarks List */}
            <div className="rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/60 p-6 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2 border-b border-slate-200/30 dark:border-slate-800/40 pb-3 text-left">
                  <Bookmark className="h-4.5 w-4.5 text-amber-500 fill-amber-500/10" />
                  <span>Bookmarked Lessons</span>
                </h3>
                
                <div className="divide-y divide-slate-100 dark:divide-slate-850 flex-grow text-left">
                  {metrics?.bookmarks?.length === 0 ? (
                    <p className="text-xs text-slate-400 py-10 text-center font-sans font-medium">No bookmarks saved yet.</p>
                  ) : (
                    metrics.bookmarks.map((bm: any) => (
                      <Link
                        key={bm.lessonId}
                        to={`/courses/${bm.courseId}/play`}
                        className="py-3 flex items-center justify-between text-xs text-slate-650 dark:text-slate-450 hover:text-brand-500 font-bold group transition-colors"
                      >
                        <span className="truncate max-w-[200px]">{bm.title}</span>
                        <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 translate-x-1 transition-all text-brand-500 shrink-0" />
                      </Link>
                    ))
                  )}
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-200/30 dark:border-slate-850 flex justify-center">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest font-mono">Telemetry verified</span>
              </div>
            </div>

            {/* AI/Category Recommendations */}
            <div className="rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/60 p-6 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md space-y-6 shadow-sm">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2 border-b border-slate-200/30 dark:border-slate-800/40 pb-3 text-left">
                <Sparkles className="h-4.5 w-4.5 text-brand-500 animate-pulse" />
                <span>Curated Skill Suggestions</span>
              </h3>

              <div className="space-y-4">
                {metrics?.recommendations?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-8 text-center">Explore the main catalog to enable skill engines.</p>
                ) : (
                  metrics.recommendations.map((rec: any) => (
                    <div 
                      key={rec.id} 
                      className="p-3.5 border border-slate-200/40 dark:border-slate-850 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 flex items-stretch space-x-3 hover:border-brand-500/25 transition-all duration-300 group"
                    >
                      <img
                        src={rec.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300'}
                        alt={rec.title}
                        className="w-16 h-auto rounded-xl object-cover shrink-0 border border-slate-200/30"
                      />
                      <div className="flex flex-col justify-between font-sans overflow-hidden text-left">
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-black text-brand-650 dark:text-brand-400 uppercase tracking-widest">{rec.category}</span>
                          <h4 className="text-xs font-extrabold text-slate-850 dark:text-white truncate mt-0.5 group-hover:text-brand-500 transition-colors">{rec.title}</h4>
                        </div>
                        <Link to={`/courses/${rec.id}`} className="inline-flex items-center space-x-1 text-[10px] text-slate-450 hover:text-brand-500 font-bold mt-2">
                          <span>Study syllabus</span>
                          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Achievements summary and Notifications Alert Feeds (Col 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Notifications Alerts Console */}
          <div className="rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/60 p-6 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md shadow-sm space-y-5 text-left glow-effect">
            <div className="flex items-center justify-between border-b border-slate-200/30 dark:border-slate-800/40 pb-3">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                <Bell className="h-4.5 w-4.5 text-brand-500" />
                <span>Live Alerts Inbox</span>
                {unreadNotificationsCount > 0 && (
                  <span className="h-5 px-1.5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </h3>
              
              {notifications.length > 0 && (
                <button
                  onClick={handleMarkNotificationsRead}
                  className="p-1.5 text-slate-400 hover:text-brand-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center text-[10px] font-bold"
                  title="Mark all as read"
                >
                  <Check className="h-3.5 w-3.5 mr-0.5" /> Clear All
                </button>
              )}
            </div>

            <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-dark">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Bell className="h-7 w-7 text-slate-300 dark:text-slate-800 mx-auto" />
                  <p className="text-xs font-bold">No active notifications</p>
                  <p className="text-[9px]">Syllabus updates or level events show here.</p>
                </div>
              ) : (
                notifications.map((not: any) => (
                  <div 
                    key={not._id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      not.isRead 
                        ? 'bg-slate-50/50 dark:bg-slate-950/10 border-slate-200/40 dark:border-slate-850/60' 
                        : 'bg-brand-500/5 dark:bg-brand-500/5 border-brand-500/20 shadow-sm relative'
                    }`}
                  >
                    {!not.isRead && <span className="absolute top-3.5 right-3.5 h-2 w-2 rounded-full bg-brand-500 animate-ping" />}
                    <div className="flex items-start space-x-2.5">
                      <div className={`p-2 rounded-xl border ${
                        not.type === 'achievement' 
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' 
                          : 'bg-brand-500/10 border-brand-500/20 text-brand-500'
                      } shrink-0`}>
                        {not.type === 'achievement' ? <Trophy className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-black text-slate-850 dark:text-white leading-tight">{not.title}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-405 mt-1 leading-normal">{not.message}</p>
                        <span className="text-[8px] font-bold text-slate-400 mt-2 block font-mono">
                          {new Date(not.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Gamification stats scorecard details */}
          <div className="rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/60 p-6 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md shadow-sm space-y-4 text-left">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2 border-b border-slate-200/30 dark:border-slate-800/40 pb-3">
              <Award className="h-4.5 w-4.5 text-brand-500" />
              <span>Syllabus Achievements Profile</span>
            </h3>

            <div className="space-y-3 font-medium text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-850">
                <span className="text-slate-450 dark:text-slate-400 font-bold">Total Accumulated XP:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{achievements?.totalXp || 0} XP</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-850">
                <span className="text-slate-450 dark:text-slate-400 font-bold">Active flame streak:</span>
                <span className="font-extrabold text-amber-500 flex items-center">
                  <Flame className="h-4 w-4 mr-0.5 fill-current" />
                  {achievements?.currentStreak || 0} Days
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-850">
                <span className="text-slate-450 dark:text-slate-400 font-bold">Longest Streak Achieved:</span>
                <span className="font-extrabold text-slate-900 dark:text-white font-mono">{achievements?.longestStreak || 0} Days</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-450 dark:text-slate-400 font-bold">Total Milestone Badges:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{achievements?.badges?.length || 0} Unlocked</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
