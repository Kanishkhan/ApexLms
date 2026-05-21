import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { dashboardService } from '../services/api';
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
  Trophy
} from 'lucide-react';
import { motion } from 'framer-motion';
import { pageVariants, staggerContainer, cardVariants } from '../animations/variants';

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const fetchDashboardMetrics = async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getStudentDashboard();
      setMetrics(res.data);
    } catch (err) {
      console.error('Failed to load student dashboard info: ', err);
    } finally {
      setLoading(false);
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

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-8 font-sans transition-all duration-300 max-w-6xl mx-auto px-4 py-6 md:py-8 bg-grid"
    >
      {/* Header telemetry section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/60 pb-6">
        <div>
          <span className="text-[9px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest bg-brand-500/10 px-2.5 py-0.5 rounded-md">
            Student Telemetry Center
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">Student Dashboard Hub</h1>
          <p className="text-xs text-slate-555 dark:text-slate-450 mt-1">Accelerate your software engineering paths and monitor assessment metrics.</p>
        </div>
        <div className="flex items-center space-x-2.5">
          <div className="h-10 px-4 rounded-xl border border-slate-200/60 dark:border-slate-800/65 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-350">
            <Trophy className="h-4.5 w-4.5 text-amber-500 fill-amber-500/10 animate-bounce" />
            <span>Ready for assessment</span>
          </div>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Enrolled Syllabi', count: metrics?.enrolledCount || 0, icon: BookOpen, color: 'text-brand-500 bg-brand-50 dark:bg-brand-950/30 border-brand-500/15' },
          { label: 'Completed Tracks', count: metrics?.completedCount || 0, icon: CheckCircle, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/15' },
          { label: 'Bookmarked Lessons', count: metrics?.bookmarks?.length || 0, icon: Bookmark, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-500/15' }
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx} 
              className="rounded-3xl border border-slate-200/50 dark:border-slate-800/60 p-6 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md flex items-center justify-between shadow-sm hover:border-brand-500/20 hover:shadow-md transition-all duration-300 group"
            >
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{card.label}</p>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors">{card.count}</h3>
              </div>
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${card.color} shrink-0`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Enrolled list */}
      <div className="rounded-[2rem] border border-slate-200/55 dark:border-slate-800/60 p-6 sm:p-8 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200/30 dark:border-slate-800/50 pb-4">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-brand-500 animate-ping" />
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Active Ongoing Curriculums</h2>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">APEX_ENROLLMENTS</span>
        </div>

        {metrics?.enrollments?.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
            <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center mx-auto text-slate-400">
              <Compass className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-350">You are not enrolled in any paths yet.</p>
              <p className="text-[10px] text-slate-400 max-w-xs mx-auto">Access our elite Software Architecture and Advanced React tracks today.</p>
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
                    className="h-14 w-14 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200/30"
                  />
                  <div className="overflow-hidden">
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

      {/* Grid columns for bookmarks and recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Bookmarks List */}
        <div className="lg:col-span-4 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/60 p-6 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2 border-b border-slate-200/30 dark:border-slate-800/40 pb-3">
              <Bookmark className="h-4.5 w-4.5 text-amber-500 fill-amber-500/10" />
              <span>Bookmarked Lessons</span>
            </h3>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-850 flex-grow">
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
        <div className="lg:col-span-8 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/60 p-6 sm:p-8 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md space-y-6 shadow-sm">
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2 border-b border-slate-200/30 dark:border-slate-800/40 pb-3">
            <Sparkles className="h-4.5 w-4.5 text-brand-500 animate-pulse" />
            <span>Curated Skill Suggestions</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {metrics?.recommendations?.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center col-span-2">Explore the main catalog to enable skill engines.</p>
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
                  <div className="flex flex-col justify-between font-sans overflow-hidden">
                    <div className="space-y-0.5">
                      <span className="text-[8px] font-black text-brand-650 dark:text-brand-400 uppercase tracking-widest">{rec.category}</span>
                      <h4 className="text-xs font-extrabold text-slate-850 dark:text-white truncate mt-0.5 group-hover:text-brand-500 transition-colors">{rec.title}</h4>
                    </div>
                    <Link to={`/courses/${rec.id}`} className="inline-flex items-center space-x-1 text-[10px] text-slate-400 hover:text-brand-500 font-bold mt-2">
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
  );
}
