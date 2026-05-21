import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { courseService } from '../services/api';
import type { Course } from '../types';
import { LessonSkeleton } from '../components/SkeletonLoader';
import { 
  BookOpen, 
  Award, 
  Users, 
  CheckCircle, 
  PlayCircle, 
  ArrowRight, 
  FileText,
  HelpCircle,
  Clock,
  Unlock,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants } from '../animations/variants';

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (id) fetchCourseDetail();
  }, [id]);

  const fetchCourseDetail = async () => {
    setLoading(true);
    try {
      const data = await courseService.getCourseById(id!);
      setCourse(data.data);
      
      // Expand all modules by default
      if (data.data?.modules) {
        const initialExpand: Record<string, boolean> = {};
        data.data.modules.forEach((mod: any) => {
          initialExpand[mod._id] = true;
        });
        setExpandedModules(initialExpand);
      }
    } catch (err) {
      console.error('Failed to load course detail: ', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!course) return;
    setEnrolling(true);
    try {
      await courseService.enroll(course._id);
      fetchCourseDetail(); // refresh state
    } catch (err) {
      console.error('Enroll failed: ', err);
    } finally {
      setEnrolling(false);
    }
  };

  const toggleModule = (modId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [modId]: !prev[modId]
    }));
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 md:p-8 space-y-8 font-sans bg-grid">
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-1/3 animate-pulse" />
            {[1, 2].map((idx) => <LessonSkeleton key={idx} />)}
          </div>
          <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-center font-sans">
        <HelpCircle className="h-12 w-12 text-slate-400 animate-bounce" />
        <h2 className="text-xl font-bold">Course Not Found</h2>
        <Link to="/courses" className="text-brand-600 dark:text-brand-400 hover:underline font-semibold flex items-center space-x-1">
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Explore</span>
        </Link>
      </div>
    );
  }

  const totalLessons = course.modules?.reduce((acc, curr) => acc + (curr.lessons?.length || 0), 0) || 0;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans p-4 md:p-8 transition-colors duration-300 bg-grid bg-mesh relative overflow-hidden"
    >
      {/* Background radial glowing accents */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] aspect-square rounded-full bg-brand-500/5 dark:bg-brand-500/10 blur-[100px] -z-10 animate-pulse-slow" />
      <div className="absolute bottom-[20%] left-[-15%] w-[45%] aspect-square rounded-full bg-purple-500/5 blur-[120px] -z-10" />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* Navigation back header */}
        <div className="flex items-center justify-between">
          <Link 
            to="/courses"
            className="flex items-center space-x-2 text-slate-500 hover:text-brand-500 text-xs font-bold transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Course Catalog</span>
          </Link>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-md">
            APEX_SYLLABUS_V1
          </span>
        </div>

        {/* Header Hero Banner Card */}
        <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200/55 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center glow-effect">
          
          <div className="md:col-span-2 space-y-5 text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-brand-500/10 border border-brand-500/20 text-brand-650 dark:text-brand-400 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-brand-500 mr-1 animate-pulse" />
              <span>{course.category}</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-[1.15] tracking-tight font-sans">
              {course.title}
            </h1>
            
            <p className="text-sm text-slate-555 dark:text-slate-405 leading-relaxed font-normal">
              {course.subtitle}
            </p>
            
            {/* Meta values */}
            <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-400 pt-2 border-t border-slate-200/40 dark:border-slate-800/40">
              <span className="flex items-center space-x-1.5">
                <BookOpen className="h-4.5 w-4.5 text-brand-500" />
                <span className="text-slate-600 dark:text-slate-350">{course.modules?.length || 0} modules</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Clock className="h-4.5 w-4.5 text-purple-500" />
                <span className="text-slate-600 dark:text-slate-350">{totalLessons} lessons</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Award className="h-4.5 w-4.5 text-emerald-500" />
                <span className="capitalize text-slate-600 dark:text-slate-350">{course.level} Level</span>
              </span>
            </div>
          </div>

          {/* Pricing & CTA Column */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/80 flex flex-col justify-center items-center text-center space-y-4 shadow-sm group">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Price</p>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {course.price === 0 ? 'Free Access' : `$${course.price}`}
              </div>
            </div>
            
            {course.isEnrolled ? (
              <div className="w-full space-y-3">
                <button
                  onClick={() => navigate(`/courses/${course._id}/play`)}
                  className="flex items-center justify-center space-x-2 w-full py-3.5 text-xs font-bold text-white bg-gradient-to-r from-brand-650 to-indigo-650 hover:from-brand-600 hover:to-indigo-600 rounded-xl transition-all shadow-md shadow-brand-500/15 hover:-translate-y-0.5"
                >
                  <PlayCircle className="h-4.5 w-4.5 shrink-0" />
                  <span>Resume Course Syllabus</span>
                </button>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-450 font-bold bg-emerald-500/10 py-1 px-3 rounded-lg inline-block">
                  Syllabus Enrolled: {course.progressPercentage || 0}% Done
                </div>
              </div>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="flex items-center justify-center space-x-2 w-full py-3.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-705 disabled:bg-slate-700 rounded-xl transition-all shadow-md hover:-translate-y-0.5"
              >
                {enrolling ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Enroll Now</span>
                    <ArrowRight className="h-4 w-4 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Detailed Description */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Syllabus Curriculum Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-[2rem] border border-slate-200/55 dark:border-slate-800/60 p-6 sm:p-8 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200/30 dark:border-slate-800/50 pb-4">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-brand-500" />
                  <span>Course Syllabus & Curriculum</span>
                </h2>
                <span className="text-[9px] font-bold text-slate-400 uppercase font-mono bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded">
                  {totalLessons} lessons
                </span>
              </div>

              {/* Accordion List */}
              <div className="space-y-4 relative">
                {course.modules?.map((mod, modIdx) => {
                  const isExpanded = !!expandedModules[mod._id];
                  return (
                    <div 
                      key={mod._id} 
                      className="border border-slate-200/50 dark:border-slate-800/65 rounded-2xl overflow-hidden bg-slate-50/40 dark:bg-slate-950/20 transition-all duration-300"
                    >
                      {/* Accordion header */}
                      <button
                        onClick={() => toggleModule(mod._id)}
                        className="w-full text-left p-4 bg-slate-100/30 dark:bg-slate-900/30 border-b border-slate-200/40 dark:border-slate-800/50 flex items-center justify-between hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-colors"
                      >
                        <div className="overflow-hidden pr-4">
                          <span className="text-[8px] font-black text-brand-650 dark:text-brand-400 uppercase tracking-widest bg-brand-500/10 px-2 py-0.5 rounded-md">
                            Module {modIdx + 1}
                          </span>
                          <h4 className="text-xs font-black text-slate-850 dark:text-slate-200 truncate mt-1.5">{mod.title}</h4>
                          <p className="text-[10px] text-slate-405 dark:text-slate-450 mt-0.5 line-clamp-1">{mod.description}</p>
                        </div>
                        <div className="shrink-0 text-slate-400 p-1 hover:text-slate-650 dark:hover:text-slate-200 rounded-lg">
                          {isExpanded ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
                        </div>
                      </button>

                      {/* Accordion content */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white/50 dark:bg-slate-950/10">
                              {mod.lessons?.map((les) => {
                                const isVideo = les.type === 'video';
                                const isPdf = les.type === 'pdf';
                                return (
                                  <div 
                                    key={les._id} 
                                    className="p-3.5 flex items-center justify-between hover:bg-slate-100/30 dark:hover:bg-slate-800/20 transition-colors"
                                  >
                                    <div className="flex items-center space-x-3 text-xs text-slate-600 dark:text-slate-350 min-w-0">
                                      <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                                        isVideo ? 'bg-brand-50 dark:bg-brand-950/20 text-brand-500' : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500'
                                      }`}>
                                        {isVideo ? <PlayCircle className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                                      </div>
                                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{les.title}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-[9px] font-bold text-slate-400 shrink-0 ml-4">
                                      {les.isFreePreview && (
                                        <span className="flex items-center space-x-0.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-450 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                                          <Unlock className="h-2.5 w-2.5" />
                                          <span>Free</span>
                                        </span>
                                      )}
                                      <span className="font-mono">{les.duration} mins</span>
                                    </div>
                                  </div>
                                );
                              })}
                              
                              {mod.lessons?.length === 0 && (
                                <p className="text-[10px] text-slate-400 p-4 text-center">No lessons configured for this syllabus node.</p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* About Author Column */}
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200/55 dark:border-slate-800/60 p-6 sm:p-8 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-1">
                  <Award className="h-4.5 w-4.5 text-brand-500 mr-1" />
                  <span>Meet the Instructor</span>
                </h3>
                
                <div className="flex items-center space-x-3.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <img
                    src={course.instructor?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${course.instructor?.name || 'Instructor'}`}
                    alt={course.instructor?.name}
                    className="h-11 w-11 rounded-full border border-slate-200 dark:border-slate-800 object-cover shadow-sm"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">{course.instructor?.name || 'Instructor'}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">{course.instructor?.email}</p>
                  </div>
                </div>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                  Evelyn is a principal software architect with decades of experience designing high-concurrency event stream pipelines and state analytics engines. She is dedicated to guiding learners along advanced software paths.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest font-mono">Expert verified curriculum</span>
              </div>
            </div>
          </div>
          
        </div>

      </div>
    </motion.div>
  );
}
