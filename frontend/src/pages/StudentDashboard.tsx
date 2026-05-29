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
  Activity,
  FileText,
  Copy,
  Printer,
  Lock,
  Check,
  ChevronRight,
  User,
  Heart,
  Briefcase,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants, staggerContainer, cardVariants } from '../animations/variants';

export default function StudentDashboard() {
  const navigate = useNavigate();

  // Tab navigation: 'syllabi' | 'paths' | 'analytics' | 'career' | 'challenges'
  const [activeTab, setActiveTab] = useState<'syllabi' | 'paths' | 'analytics' | 'career' | 'challenges'>('syllabi');
  const [activePathTrack, setActivePathTrack] = useState<'frontend' | 'backend'>('frontend');
  
  const [metrics, setMetrics] = useState<any | null>(null);
  const [achievements, setAchievements] = useState<any | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [codingProblems, setCodingProblems] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Resume builder and portfolio highlights states
  const [featuredSubmissions, setFeaturedSubmissions] = useState<string[]>([]);
  const [copiedResume, setCopiedResume] = useState(false);

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
      
      const subs = subRes.data || [];
      setSubmissions(subs);
      
      // Auto-feature graded submissions
      const graded = subs.filter((s: any) => s.status === 'graded').map((s: any) => s._id);
      setFeaturedSubmissions(graded);

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

  const toggleFeaturedSubmission = (id: string) => {
    if (featuredSubmissions.includes(id)) {
      setFeaturedSubmissions(featuredSubmissions.filter(item => item !== id));
    } else {
      setFeaturedSubmissions([...featuredSubmissions, id]);
    }
  };

  const handleCopyResumeMarkdown = () => {
    const md = generateResumeMarkdown();
    navigator.clipboard.writeText(md);
    setCopiedResume(true);
    setTimeout(() => setCopiedResume(false), 2000);
  };

  const generateResumeMarkdown = () => {
    const name = achievements?.student?.name || 'Jane Developer';
    const email = achievements?.student?.email || 'developer@apex.edu';
    const xp = achievements?.totalXp || 0;
    const level = achievements?.level || 1;
    const streak = achievements?.currentStreak || 0;
    
    let subSection = '';
    submissions.forEach((s: any) => {
      if (featuredSubmissions.includes(s._id)) {
        subSection += `### 📁 Project: ${s.assignment?.title}\n`;
        subSection += `- **Syllabus Category**: Rubric-grade milestone\n`;
        if (s.pointsEarned) {
          subSection += `- **Evaluation score**: ${s.pointsEarned}/${s.assignment?.maxPoints || 100} pts Achieved\n`;
        }
        if (s.githubUrl) {
          subSection += `- **Repository**: [${s.githubUrl}](${s.githubUrl})\n`;
        }
        if (s.feedback?.comments) {
          subSection += `- **Instructor Evaluation**: "${s.feedback.comments}"\n`;
        }
        subSection += `\n`;
      }
    });

    return `# ${name}
Email: ${email} | Apex Learning Cloud Specialization Profile

## 🏆 Specialized Telemetry Credentials
- **Apex Specialization Level**: Level ${level} System Specialist
- **Total Architectural Experience**: ${xp} XP accumulated
- **Highest Learning Streak**: ${streak} Consecutive Daily Handshakes

## 📁 Featured Project Deliverables Portfolio
${subSection || '*No highlighted project deliverables registered yet.*\n'}
## 🏆 Milestone Badges Unlocked
${achievements?.badges?.map((b: any) => `- **${b.title}** (Unlocked on ${new Date(b.unlockedAt).toLocaleDateString()})`).join('\n') || '- *Starting badge tracks*'}
`;
  };

  if (loading) {
    return (
      <div className="space-y-8 font-sans max-w-6xl mx-auto p-6 md:p-8 animate-pulse bg-grid">
        <div className="space-y-2">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
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

  // Duolingo Visual Skill Paths Data structure
  const pathTracks = {
    frontend: [
      { id: 'fe1', label: 'HTML Semantic Grids', type: 'lesson', xp: 150, status: 'completed', desc: 'CSS overrides and structural semantic HTML layouts.' },
      { id: 'fe2', label: 'Advanced Array Map Loops', type: 'lesson', xp: 200, status: 'completed', desc: 'Asynchronous event maps and functional array patterns.' },
      { id: 'fe3', label: 'React State Redux Slices', type: 'lesson', xp: 300, status: 'active', desc: 'Managing dynamic store states using strict Redux variables.' },
      { id: 'fe4', label: 'Monaco Playground Tests', type: 'assessment', xp: 450, status: 'locked', desc: 'Advanced coding challenge playgrounds.' },
      { id: 'fe5', label: 'React Telemetry Portfolio', type: 'project', xp: 800, status: 'locked', desc: 'Project submission evaluating frontend state layers.' }
    ],
    backend: [
      { id: 'be1', label: 'Repository Injection Pattern', type: 'lesson', xp: 200, status: 'completed', desc: 'Decoupling Express routes from direct Mongo db queries.' },
      { id: 'be2', label: 'Double Token Axios JWT', type: 'lesson', xp: 350, status: 'active', desc: 'Rotating short-lived tokens and Axios authorization interceptors.' },
      { id: 'be3', label: 'MongoDB Schema Indexes', type: 'lesson', xp: 400, status: 'locked', desc: 'Seeding datasets and creating cluster index whitelists.' },
      { id: 'be4', label: ' изолирован Node Runtime vm', type: 'assessment', xp: 600, status: 'locked', desc: 'Compiling untrusted code inside secure backend nodes.' },
      { id: 'be5', label: 'Express Clean Controller Capstone', type: 'project', xp: 1000, status: 'locked', desc: 'Enterprise server architecture matched against rubrics.' }
    ]
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-8 font-sans transition-all duration-300 max-w-6xl mx-auto px-4 py-6 md:py-8 bg-grid text-slate-900 dark:text-slate-100"
    >
      {/* Header telemetry section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-slate-200 dark:border-slate-800 pb-6">
        <div className="text-left">
          <span className="text-[9px] font-black text-indigo-650 dark:text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2.5 py-0.5 rounded-md">
            Student Telemetry Center
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">Student Dashboard Hub</h1>
          <p className="text-xs text-slate-600 dark:text-slate-450 mt-1">Accelerate your software engineering paths and monitor assessment metrics.</p>
        </div>
        
        {/* Dynamic header gauges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="h-10 px-4 rounded-xl border-2 border-amber-400 dark:border-amber-500/35 bg-amber-500/5 flex items-center space-x-2 text-xs font-black text-amber-600 dark:text-amber-450">
            <Flame className="h-4.5 w-4.5 text-amber-500 fill-amber-500 animate-pulse" />
            <span>{achievements?.currentStreak || 0} Day Streak</span>
          </div>
          <div className="h-10 px-4 rounded-xl border-2 border-purple-400 dark:border-purple-500/35 bg-purple-500/5 flex items-center space-x-2 text-xs font-black text-purple-600 dark:text-purple-450">
            <Sparkles className="h-4.5 w-4.5 text-purple-500 fill-purple-400" />
            <span>{achievements?.totalXp || 0} XP</span>
          </div>
          <div className="h-10 px-4 rounded-xl border-2 border-indigo-400 dark:border-indigo-500/35 bg-indigo-500/5 flex items-center space-x-2 text-xs font-black text-indigo-650 dark:text-indigo-400">
            <Trophy className="h-4.5 w-4.5 text-indigo-650 fill-indigo-650/10" />
            <span>Level {achievements?.level || 1} Specialist</span>
          </div>
        </div>
      </div>

      {/* Premium Visual Tab bar Navigation */}
      <div className="flex flex-wrap border-b-2 border-slate-200 dark:border-slate-800 gap-1 pb-px">
        {[
          { id: 'syllabi', label: 'Active Syllabi', icon: BookOpen },
          { id: 'paths', label: 'Interactive Skill Trees', icon: Code2 },
          { id: 'analytics', label: 'Telemetry Analytics', icon: Activity },
          { id: 'career', label: 'Career & Portfolios', icon: Briefcase },
          { id: 'challenges', label: 'Daily Challenges', icon: Terminal }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 text-xs font-extrabold transition-all border-b-2 flex items-center space-x-2 -mb-px focus:outline-none ${
                isSelected 
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-black bg-slate-100/50 dark:bg-slate-900/40 rounded-t-xl' 
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Column Split Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Tab-specific workspaces (Col 8) */}
        <div className="lg:col-span-8 space-y-8">
          
          <AnimatePresence mode="wait">
            
            {/* Active Syllabi Tab */}
            {activeTab === 'syllabi' && (
              <motion.div
                key="syllabi"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-8 text-left"
              >
                {/* Active Ongoing Curriculums */}
                <div className="glass-card p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div className="flex items-center space-x-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-brand-500 animate-ping" />
                      <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Active Ongoing Curriculums</h2>
                    </div>
                    <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest font-mono">APEX_ENROLLMENTS</span>
                  </div>

                  {metrics?.enrollments?.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-slate-350 dark:border-slate-800 rounded-3xl space-y-4">
                      <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center mx-auto text-slate-400">
                        <Compass className="h-5.5 w-5.5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-350 font-sans">You are not enrolled in any paths yet.</p>
                        <p className="text-[10px] text-slate-400 max-w-xs mx-auto font-sans">Access our elite Software Architecture and Advanced React tracks today.</p>
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
                          className="p-5 rounded-2xl border-2 border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-955/20 flex flex-col justify-between space-y-5 hover:border-brand-500/25 transition-all duration-300 group"
                        >
                          <div className="flex items-start space-x-3.5">
                            <img
                              src={enr.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300'}
                              alt={enr.title}
                              className="h-12 w-12 rounded-xl object-cover bg-slate-150 shrink-0 border border-slate-300 dark:border-slate-800"
                            />
                            <div className="overflow-hidden">
                              <span className="text-[8px] font-black uppercase tracking-wider text-brand-650 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-md">
                                {enr.category || 'Topic'}
                              </span>
                              <h3 className="text-xs font-extrabold text-slate-850 dark:text-white truncate mt-1.5 group-hover:text-brand-550 transition-colors">{enr.title}</h3>
                              <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1 leading-normal font-sans">{enr.subtitle}</p>
                            </div>
                          </div>

                          <div className="space-y-2 pt-2">
                            <div className="flex items-center justify-between text-[10px] text-slate-550 dark:text-slate-400 font-bold font-sans">
                              <span className="flex items-center"><Clock className="h-3 w-3 mr-1 text-slate-400" /> Syllabus Completed</span>
                              <span className="text-brand-600 dark:text-brand-400 font-extrabold">{enr.progressPercentage}%</span>
                            </div>
                            <div className="w-full bg-slate-200/80 dark:bg-slate-850 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-brand-600 to-indigo-600 h-full rounded-full transition-all duration-500" 
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

                {/* Bookmarked Lessons and curated recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Bookmarks List */}
                  <div className="glass-card p-6 space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                      <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2 border-b border-slate-255/50 dark:border-slate-800/60 pb-3">
                        <Bookmark className="h-4.5 w-4.5 text-amber-500 fill-amber-500/10" />
                        <span>Bookmarked Lessons</span>
                      </h3>
                      
                      <div className="divide-y divide-slate-200 dark:divide-slate-850 flex-grow text-left">
                        {metrics?.bookmarks?.length === 0 ? (
                          <p className="text-xs text-slate-400 py-10 text-center font-sans font-medium">No bookmarks saved yet.</p>
                        ) : (
                          metrics.bookmarks.map((bm: any) => (
                            <Link
                              key={bm.lessonId}
                              to={`/courses/${bm.courseId}/play`}
                              className="py-3 flex items-center justify-between text-xs text-slate-750 dark:text-slate-405 hover:text-brand-600 font-bold group transition-colors"
                            >
                              <span className="truncate max-w-[200px]">{bm.title}</span>
                              <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 translate-x-1 transition-all text-brand-500 shrink-0" />
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* AI/Category Recommendations */}
                  <div className="glass-card p-6 space-y-6">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2 border-b border-slate-255/50 dark:border-slate-800/60 pb-3">
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
                            className="p-3.5 border-2 border-slate-300 dark:border-slate-850 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 flex items-stretch space-x-3 hover:border-brand-500/25 transition-all duration-300 group"
                          >
                            <img
                              src={rec.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300'}
                              alt={rec.title}
                              className="w-16 h-auto rounded-xl object-cover shrink-0 border border-slate-300 dark:border-slate-800"
                            />
                            <div className="flex flex-col justify-between font-sans overflow-hidden text-left">
                              <div className="space-y-0.5">
                                <span className="text-[8px] font-black text-brand-650 dark:text-brand-400 uppercase tracking-widest">{rec.category}</span>
                                <h4 className="text-xs font-extrabold text-slate-850 dark:text-white truncate mt-0.5 group-hover:text-brand-550 transition-colors">{rec.title}</h4>
                              </div>
                              <Link to={`/courses/${rec.id}`} className="inline-flex items-center space-x-1 text-[10px] text-slate-500 hover:text-brand-550 font-bold mt-2">
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
              </motion.div>
            )}

            {/* Interactive Skill Trees Tab (Duolingo visual node flowchart) */}
            {activeTab === 'paths' && (
              <motion.div
                key="paths"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="glass-card p-6 sm:p-8 space-y-6 text-left"
              >
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div className="flex items-center space-x-2">
                    <Code2 className="h-5 w-5 text-brand-500 mr-1" />
                    <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Visual Specialization Pathways</h2>
                  </div>
                  
                  {/* Selector for FE / BE tree */}
                  <div className="flex bg-slate-100 dark:bg-slate-950 p-1 border border-slate-300 dark:border-slate-850 rounded-xl">
                    <button
                      onClick={() => setActivePathTrack('frontend')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-colors ${
                        activePathTrack === 'frontend' 
                          ? 'bg-white dark:bg-slate-900 text-indigo-650 dark:text-indigo-400 border border-slate-300 dark:border-slate-800 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-850'
                      }`}
                    >
                      Frontend Tree
                    </button>
                    <button
                      onClick={() => setActivePathTrack('backend')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-colors ${
                        activePathTrack === 'backend' 
                          ? 'bg-white dark:bg-slate-900 text-indigo-650 dark:text-indigo-400 border border-slate-300 dark:border-slate-800 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-850'
                      }`}
                    >
                      Backend Tree
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-405 leading-relaxed font-sans font-medium">
                  Follow visual linked nodes inside this track. Completed nodes are marked with checkmarks. Click or hover on active nodes to start evaluations or assignments.
                </p>

                {/* Vertical visual node list linked with custom lines */}
                <div className="py-8 flex flex-col items-center space-y-12 relative">
                  
                  {pathTracks[activePathTrack].map((node, index) => (
                    <div key={node.id} className="relative flex flex-col items-center w-full max-w-sm">
                      {/* SVG vertical line connector */}
                      {index < pathTracks[activePathTrack].length - 1 && (
                        <div className="absolute bottom-[-48px] w-[3px] h-[48px] bg-slate-300 dark:bg-slate-800" />
                      )}

                      {/* Visual Node */}
                      <div className={`skill-node ${
                        node.status === 'completed' ? 'skill-node-completed' :
                        node.status === 'active' ? 'skill-node-active' :
                        'skill-node-locked'
                      } hover:scale-105`}>
                        {node.status === 'completed' ? <Check className="h-6 w-6 stroke-[3.5]" /> :
                         node.status === 'active' ? <PlayCircle className="h-6 w-6" /> :
                         <Lock className="h-5 w-5" />}
                      </div>

                      {/* Information Popover Details */}
                      <div className="mt-4 p-4.5 rounded-2xl border-2 border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 w-full text-left shadow-sm hover:border-brand-500/20 transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                            node.status === 'completed' ? 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20' :
                            node.status === 'active' ? 'text-indigo-650 bg-indigo-500/10 border border-indigo-500/20' :
                            'text-slate-400 bg-slate-100 dark:bg-slate-900 border border-slate-250 dark:border-slate-850'
                          }`}>
                            {node.status}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 font-mono tracking-wider uppercase">
                            {node.type} • +{node.xp} XP
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white mt-2 leading-tight">{node.label}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-1 leading-relaxed">{node.desc}</p>
                      </div>
                    </div>
                  ))}

                </div>
              </motion.div>
            )}

            {/* Telemetry Analytics Tab */}
            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-8 text-left"
              >
                {/* GitHub-style Contribution Heatmap */}
                <div className="glass-card p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center">
                      <Calendar className="h-5 w-5 text-indigo-500 mr-2" />
                      <span>Developer Activity Contribution Heatmap</span>
                    </h3>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">ACTIVITY_GRID_V1</span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-405 leading-relaxed font-sans font-medium">
                    Profile your daily XP contributions and learning handshakes over the past year. Solid green squares represent high-XP active study sessions.
                  </p>

                  {/* SVG Heatmap Calendar Mock Grid */}
                  <div className="overflow-x-auto p-4 border border-slate-300 dark:border-slate-850 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 max-w-full">
                    <div className="inline-grid grid-flow-col gap-1 pr-2">
                      {/* Let's generate 32 columns representing weeks, each having 7 day rows */}
                      {Array.from({ length: 32 }).map((_, colIdx) => (
                        <div key={colIdx} className="grid grid-rows-7 gap-1">
                          {Array.from({ length: 7 }).map((_, rowIdx) => {
                            // Assign mock shades representing learning intensity
                            const sum = colIdx + rowIdx;
                            let shade = 'heatmap-0';
                            if (sum % 11 === 0) shade = 'heatmap-4';
                            else if (sum % 7 === 0) shade = 'heatmap-3';
                            else if (sum % 5 === 0) shade = 'heatmap-2';
                            else if (sum % 3 === 0) shade = 'heatmap-1';
                            
                            return (
                              <div 
                                key={rowIdx}
                                className={`heatmap-cell ${shade}`}
                                title={`Week ${colIdx + 1}, Day ${rowIdx + 1} XP Contribution`}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                    
                    {/* Heatmap Legend */}
                    <div className="flex items-center justify-end space-x-2.5 mt-4 text-[9px] font-bold text-slate-450 uppercase font-mono">
                      <span>Less active</span>
                      <div className="w-3 h-3 heatmap-0 rounded-[2px]" />
                      <div className="w-3 h-3 heatmap-1 rounded-[2px]" />
                      <div className="w-3 h-3 heatmap-2 rounded-[2px]" />
                      <div className="w-3 h-3 heatmap-3 rounded-[2px]" />
                      <div className="w-3 h-3 heatmap-4 rounded-[2px]" />
                      <span>highly active</span>
                    </div>
                  </div>
                </div>

                {/* Sub-Track Skill Growth Radial Progress & Weekly Learning hours */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Skill Growth circular progress bars */}
                  <div className="glass-card p-6 space-y-6">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                      <Trophy className="h-4.5 w-4.5 text-brand-500" />
                      <span>Skill Track Progress Telemetry</span>
                    </h3>

                    <div className="space-y-5">
                      {[
                        { label: 'Frontend Engineering', percent: 75, color: 'bg-indigo-650' },
                        { label: 'Backend Clean Architecture', percent: 60, color: 'bg-purple-650' },
                        { label: 'Isolated Monaco Compiles', percent: 85, color: 'bg-emerald-650' },
                        { label: 'Multi-Container Cloud DevOps', percent: 40, color: 'bg-rose-550' }
                      ].map((skill, idx) => (
                        <div key={idx} className="space-y-1.5 text-left font-sans">
                          <div className="flex justify-between text-[10px] font-extrabold text-slate-550 dark:text-slate-350">
                            <span>{skill.label}</span>
                            <span>{skill.percent}% Capable</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-850 h-2.5 rounded-full overflow-hidden border border-slate-300 dark:border-slate-800">
                            <div 
                              className={`${skill.color} h-full rounded-full transition-all duration-500`}
                              style={{ width: `${skill.percent}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Learning hour bars */}
                  <div className="glass-card p-6 space-y-6">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                      <Clock className="h-4.5 w-4.5 text-amber-500" />
                      <span>Weekly Active Learning Hours</span>
                    </h3>

                    {/* Bar graph */}
                    <div className="flex items-end justify-between h-40 pt-4 px-2">
                      {[
                        { day: 'Mon', hours: 4.5, max: 8 },
                        { day: 'Tue', hours: 6.2, max: 8 },
                        { day: 'Wed', hours: 2.1, max: 8 },
                        { day: 'Thu', hours: 5.5, max: 8 },
                        { day: 'Fri', hours: 7.8, max: 8 },
                        { day: 'Sat', hours: 3.5, max: 8 },
                        { day: 'Sun', hours: 1.2, max: 8 }
                      ].map((day, idx) => {
                        const hPct = `${(day.hours / day.max) * 100}%`;
                        return (
                          <div key={idx} className="flex flex-col items-center space-y-2 flex-grow">
                            <span className="text-[8px] font-black text-slate-450 font-mono">{day.hours}h</span>
                            <div className="w-5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 h-24 rounded-lg flex items-end overflow-hidden">
                              <div 
                                className="bg-indigo-600 dark:bg-indigo-500 w-full rounded-b-md transition-all duration-300"
                                style={{ height: hPct }}
                              />
                            </div>
                            <span className="text-[9px] font-bold text-slate-500">{day.day}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Career & Portfolios Tab */}
            {activeTab === 'career' && (
              <motion.div
                key="career"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-8 text-left"
              >
                {/* Portfolios Toggle checklist */}
                <div className="glass-card p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center">
                      <FolderGit2 className="h-5 w-5 text-indigo-500 mr-2" />
                      <span>Deliverable Portfolios Highlights Console</span>
                    </h3>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">PORTFOLIO_SELECT</span>
                  </div>

                  <p className="text-xs text-slate-555 dark:text-slate-405 leading-relaxed font-sans font-medium">
                    Toggle which projects and assignments to showcase on your automatically generated recruiter-facing resume profile. Featured items link source repository directories.
                  </p>

                  <div className="space-y-3.5">
                    {submissions.length === 0 ? (
                      <p className="text-xs text-slate-400 font-sans text-center py-6">Submit homework outputs inside the courses player to feature portfolios.</p>
                    ) : (
                      submissions.map((sub: any) => {
                        const isFeatured = featuredSubmissions.includes(sub._id);
                        return (
                          <div 
                            key={sub._id}
                            className={`p-4.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 text-left ${
                              isFeatured 
                                ? 'bg-indigo-500/5 border-indigo-500/30' 
                                : 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-300 dark:border-slate-850'
                            }`}
                          >
                            <div className="overflow-hidden">
                              <h4 className="text-xs font-black text-slate-850 dark:text-white truncate">{sub.assignment?.title}</h4>
                              <div className="flex items-center space-x-3 text-[9px] font-bold text-slate-450 mt-1 font-mono">
                                <span>SCORE: {sub.pointsEarned || 0} / {sub.assignment?.maxPoints || 100} PTS</span>
                                {sub.githubUrl && <span className="truncate max-w-[180px]">URL: {sub.githubUrl}</span>}
                              </div>
                            </div>

                            <button
                              onClick={() => toggleFeaturedSubmission(sub._id)}
                              className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                                isFeatured
                                  ? 'bg-indigo-650 text-white border border-indigo-700 shadow-sm'
                                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 border border-slate-300 dark:border-slate-800'
                              }`}
                            >
                              {isFeatured ? '✓ Featured' : 'Feature'}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Markdown Recruiter Resume compiler Card */}
                <div className="glass-card p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center">
                      <FileText className="h-5 w-5 text-indigo-550 mr-2" />
                      <span>Interactive markdown Resume Compiler</span>
                    </h3>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleCopyResumeMarkdown}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-750 text-white rounded-xl text-[10px] font-black uppercase transition-all flex items-center space-x-1"
                        title="Copy Markdown to Clipboard"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        <span>{copiedResume ? 'Copied!' : 'Copy Markdown'}</span>
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase transition-all flex items-center space-x-1"
                        title="Export profile resume to PDF"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        <span>Export PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* Rendered dynamic compiler resume */}
                  <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-y-auto max-h-[380px] text-left leading-relaxed whitespace-pre-wrap select-text scrollbar-dark">
                    {generateResumeMarkdown()}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Daily Challenge Monaco launcher Tab */}
            {activeTab === 'challenges' && (
              <motion.div
                key="challenges"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="glass-card p-6 sm:p-8 space-y-6 text-left"
              >
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div className="flex items-center space-x-2">
                    <Terminal className="h-5 w-5 text-indigo-500 mr-1.5" />
                    <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Daily Coding Arena Challenge</h2>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">DAILY_PLAYGROUND</span>
                </div>

                {codingProblems.length === 0 ? (
                  <p className="text-xs text-slate-400 font-sans text-center py-6">No problems seeded currently inside the workspace.</p>
                ) : (
                  <div className="space-y-6 font-sans">
                    <div className="p-6 rounded-[2rem] border-2 border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col justify-between space-y-5">
                      <div className="text-left space-y-3">
                        <div className="flex items-center justify-between gap-2.5">
                          <span className="text-[9px] font-black uppercase px-2.5 py-0.5 rounded border text-purple-600 bg-purple-500/10 border-purple-500/20">
                            Challenge of the Day
                          </span>
                          <span className="text-[9px] font-black text-indigo-650 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-550/20 flex items-center">
                            <Sparkles className="h-3.5 w-3.5 mr-0.5 fill-indigo-400" />
                            +{codingProblems[0].points} XP Awarded
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{codingProblems[0].title}</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">{codingProblems[0].description}</p>
                        
                        <div className="flex flex-wrap gap-1.5">
                          {codingProblems[0].topicTags?.map((tag: string) => (
                            <span key={tag} className="text-[8px] font-black text-slate-500 bg-slate-100 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 px-2 py-0.5 rounded uppercase font-mono">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/coding/${codingProblems[0]._id}`)}
                        className="flex items-center justify-center space-x-2 w-full py-3 bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-705 text-white text-xs font-bold rounded-xl transition-all shadow-sm group"
                      >
                        <PlayCircle className="h-4.5 w-4.5 text-brand-500 mr-1 animate-pulse" />
                        <span>Launch Monaco Coding Playground</span>
                        <ChevronRight className="h-3.5 w-3.5 text-white group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>

                    {/* Challenges list */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-450 border-b border-slate-150/40 pb-2">Past challenges catalog</h4>
                      
                      {codingProblems.slice(1).map((prob: any) => (
                        <div 
                          key={prob._id}
                          className="p-4 rounded-xl border border-slate-300 dark:border-slate-850 bg-white dark:bg-slate-950/20 flex items-center justify-between text-xs hover:border-brand-500/20 transition-all"
                        >
                          <div className="text-left overflow-hidden pr-4">
                            <h5 className="font-extrabold text-slate-800 dark:text-slate-200 truncate">{prob.title}</h5>
                            <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 mt-1 block">+{prob.points} XP challenge</span>
                          </div>
                          
                          <button
                            onClick={() => navigate(`/coding/${prob._id}`)}
                            className="px-3.5 py-1.5 text-[10px] font-black text-slate-700 hover:text-slate-900 dark:text-slate-350 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 rounded-lg transition-colors shrink-0"
                          >
                            Launch Arena
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>

        </div>

        {/* RIGHT COLUMN: Achievements Profile detail card, notifications inbox alert console (Col 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Notifications Alerts Inbox */}
          <div className="glass-card p-6 space-y-5 text-left glow-effect">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
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
                  className="p-1.5 text-slate-400 hover:text-brand-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors flex items-center text-[10px] font-bold"
                  title="Mark all as read"
                >
                  <Check className="h-3.5 w-3.5 mr-0.5" /> Clear All
                </button>
              )}
            </div>

            <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-dark">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-slate-450 space-y-2">
                  <Bell className="h-7 w-7 text-slate-300 dark:text-slate-800 mx-auto" />
                  <p className="text-xs font-bold">No active notifications</p>
                  <p className="text-[9px]">Syllabus updates or level events show here.</p>
                </div>
              ) : (
                notifications.map((not: any) => (
                  <div 
                    key={not._id}
                    className={`p-3.5 rounded-2xl border-2 transition-all ${
                      not.isRead 
                        ? 'bg-slate-50/50 dark:bg-slate-950/10 border-slate-200 dark:border-slate-850' 
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
          <div className="glass-card p-6 space-y-4 text-left">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <Award className="h-4.5 w-4.5 text-brand-500" />
              <span>Syllabus Achievements Profile</span>
            </h3>

            <div className="space-y-3 font-medium text-xs font-sans">
              <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-850">
                <span className="text-slate-550 dark:text-slate-400 font-bold">Total Accumulated XP:</span>
                <span className="font-extrabold text-slate-800 dark:text-white">{achievements?.totalXp || 0} XP</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-850">
                <span className="text-slate-550 dark:text-slate-400 font-bold">Active flame streak:</span>
                <span className="font-extrabold text-amber-500 flex items-center">
                  <Flame className="h-4 w-4 mr-0.5 fill-current" />
                  {achievements?.currentStreak || 0} Days
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-850">
                <span className="text-slate-550 dark:text-slate-400 font-bold">Longest Streak Achieved:</span>
                <span className="font-extrabold text-slate-800 dark:text-white font-mono">{achievements?.longestStreak || 0} Days</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-550 dark:text-slate-400 font-bold">Total Milestone Badges:</span>
                <span className="font-extrabold text-slate-850 dark:text-white">{achievements?.badges?.length || 0} Unlocked</span>
              </div>
            </div>

            {/* Achievements Badges Roster List */}
            {achievements?.badges && achievements.badges.length > 0 && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-850 space-y-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Unlocked Badges Showcase</p>
                <div className="flex flex-wrap gap-1.5">
                  {achievements.badges.map((badge: any, idx: number) => (
                    <div 
                      key={idx}
                      className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-850 text-[9px] font-extrabold text-amber-550 shadow-sm"
                    >
                      <Award className="h-3 w-3 text-amber-550 fill-amber-550/10" />
                      <span>{badge.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </motion.div>
  );
}
