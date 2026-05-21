import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { courseService } from '../services/api';
import type { Course } from '../types';
import { CourseCardSkeleton } from '../components/SkeletonLoader';
import { Search, Compass, Shield, ArrowRight, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { pageVariants, staggerContainer, cardVariants } from '../animations/variants';

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  // Debounced search trigger
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCourses();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search, category]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await courseService.getCourses({
        category: category || undefined,
        search: search || undefined,
      });
      setCourses(data.data);
    } catch (err) {
      console.error('Failed to fetch courses catalog: ', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Software Engineering', 'Frontend Development', 'DevOps'];

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans p-6 md:p-8 lg:p-12 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page title info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/40 dark:border-slate-800/40 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Curated Syllabus Catalog</h1>
            <p className="text-sm text-slate-400 mt-1">Acquire startup-ready engineering capabilities with elite guided structures.</p>
          </div>
        </div>

        {/* Filter / Search bars */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search wrapper */}
          <div className="relative flex-grow max-w-lg">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
              <Search className="h-4.5 w-4.5" />
            </span>
            <input
              type="text"
              placeholder="Search courses, modules, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm text-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Categories selectors */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setCategory('')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                category === ''
                  ? 'bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-500/10'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              All Topics
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  category === cat
                    ? 'bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-500/10'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content list Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((idx) => <CourseCardSkeleton key={idx} />)}
          </div>
        ) : courses.length === 0 ? (
          <div className="py-20 rounded-3xl glass border border-slate-200/50 dark:border-slate-800/50 text-center max-w-md mx-auto space-y-4">
            <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mx-auto text-slate-400">
              <Compass className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No results found</h3>
              <p className="text-xs text-slate-400 mt-1">Try adapting your search terms or filter constraints.</p>
            </div>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {courses.map((course) => (
              <motion.div
                key={course._id}
                variants={cardVariants}
                className="rounded-[2rem] border border-slate-250/65 dark:border-slate-850/60 overflow-hidden bg-white/70 dark:bg-slate-900/60 backdrop-blur-md hover:border-brand-500/35 dark:hover:border-brand-500/30 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group glow-effect"
              >
                {/* Thumbnail card */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-950/40">
                  <img
                    src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600'}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-550 group-hover:scale-[1.03]"
                  />
                  <div className="absolute top-3.5 right-3.5 px-3 py-1 rounded-lg bg-slate-950/85 backdrop-blur text-[9px] font-extrabold text-white uppercase tracking-widest border border-white/10 shadow-sm">
                    {course.level}
                  </div>
                </div>

                {/* Info block */}
                <div className="p-6 flex-grow flex flex-col justify-between space-y-4 font-sans">
                  <div className="space-y-2.5">
                    <span className="text-[9px] font-black uppercase tracking-wider text-brand-650 dark:text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-md">
                      {course.category}
                    </span>
                    <h3 className="text-base font-extrabold leading-snug text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {course.subtitle}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Divider */}
                    <div className="border-t border-slate-200/50 dark:border-slate-800/60" />

                    {/* Footer values */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <img
                          src={course.instructor?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${course.instructor?.name || 'Instructor'}`}
                          alt={course.instructor?.name}
                          className="h-7 w-7 rounded-full border border-slate-200/55 dark:border-slate-800/80 object-cover bg-slate-50"
                        />
                        <span className="font-semibold text-slate-700 dark:text-slate-350 truncate max-w-[120px]">
                          {course.instructor?.name || 'Instructor'}
                        </span>
                      </div>

                      <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                        {course.price === 0 ? 'Free' : `$${course.price}`}
                      </div>
                    </div>

                    <Link
                      to={`/courses/${course._id}`}
                      className="flex items-center justify-center space-x-2 w-full py-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-705 rounded-xl transition-all shadow-sm group-hover:bg-gradient-to-r group-hover:from-brand-600 group-hover:to-indigo-650"
                    >
                      <span>Explore Syllabus Course</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
