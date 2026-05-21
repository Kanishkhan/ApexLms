import React, { useEffect, useState } from 'react';
import { courseService, dashboardService } from '../services/api';
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  FolderPlus, 
  ClipboardList, 
  CheckCircle2, 
  Trash2,
  TrendingUp,
  Sliders,
  Settings,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants } from '../animations/variants';

export default function InstructorDashboard() {
  const [metrics, setMetrics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Syllabus course builder states
  const [creatingCourse, setCreatingCourse] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Software Engineering');
  const [newPrice, setNewPrice] = useState('99');
  
  // Lesson/Module additions
  const [addingModule, setAddingModule] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [modTitle, setModTitle] = useState('');
  const [modOrder, setModOrder] = useState('1');

  useEffect(() => {
    fetchInstructorStudio();
  }, []);

  const fetchInstructorStudio = async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getInstructorDashboard();
      setMetrics(res.data);
    } catch (err) {
      console.error('Failed to load instructor metrics: ', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc) return;
    try {
      await courseService.createCourse({
        title: newTitle,
        subtitle: newSubtitle,
        description: newDesc,
        category: newCategory,
        price: Number(newPrice) || 0,
        level: 'beginner',
        tags: ['Draft'],
      });
      setCreatingCourse(false);
      setNewTitle('');
      setNewSubtitle('');
      setNewDesc('');
      fetchInstructorStudio(); // reload metrics
    } catch (err) {
      console.error('Failed to create course: ', err);
    }
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modTitle || !selectedCourseId) return;
    try {
      await courseService.addModule(selectedCourseId, {
        title: modTitle,
        order: Number(modOrder) || 1,
      });
      setAddingModule(false);
      setModTitle('');
      setModOrder('1');
      alert('Module added to syllabus successfully.');
    } catch (err) {
      console.error('Failed to add module: ', err);
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
      className="space-y-8 font-sans max-w-6xl mx-auto px-4 py-6 md:py-8 bg-grid transition-all duration-300"
    >
      {/* Title telemetry block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/60 pb-6">
        <div>
          <span className="text-[9px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest bg-brand-500/10 px-2.5 py-0.5 rounded-md">
            Authoring Telemetry Studio
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">Instructor Studio Hub</h1>
          <p className="text-xs text-slate-555 dark:text-slate-450 mt-1">Author premium curriculum syllabus nodes and inspect aggregated student revenue telemetry.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCreatingCourse(true)}
            className="flex items-center space-x-2 px-5 py-3 text-xs font-bold text-white bg-gradient-to-r from-brand-650 to-indigo-650 hover:from-brand-600 hover:to-indigo-600 rounded-xl transition-all shadow-md shadow-brand-500/10 hover:-translate-y-0.5 group"
          >
            <FolderPlus className="h-4.5 w-4.5 group-hover:scale-105 transition-transform" />
            <span>Create Curriculum Catalog</span>
          </button>
        </div>
      </div>

      {/* Aggregate metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Published Courses', count: metrics?.courseCount || 0, icon: ClipboardList, color: 'text-brand-500 bg-brand-50 dark:bg-brand-950/30 border-brand-500/15' },
          { label: 'Enrolled Students', count: metrics?.totalStudents || 0, icon: Users, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/15' },
          { label: 'Aggregated Revenue', count: `$${metrics?.revenue || 0}`, icon: DollarSign, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-500/15' }
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

      {/* Syllabus Course Manager grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Managed course catalog */}
        <div className="lg:col-span-8 rounded-[2rem] border border-slate-200/55 dark:border-slate-800/60 p-6 sm:p-8 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200/30 dark:border-slate-800/50 pb-4">
              <div className="flex items-center space-x-2">
                <Sliders className="h-4.5 w-4.5 text-brand-500 shrink-0" />
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Active Studio Syllabi</h2>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">STUDIO_CATALOG</span>
            </div>
            
            <div className="divide-y divide-slate-200/50 dark:divide-slate-850 flex-grow">
              {metrics?.courseStats?.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <p className="text-xs text-slate-400 font-medium">No studio items configured yet.</p>
                  <button 
                    onClick={() => setCreatingCourse(true)}
                    className="inline-flex items-center space-x-1.5 px-4.5 py-2 bg-slate-950 dark:bg-slate-850 text-white rounded-xl text-xs font-bold"
                  >
                    <span>Tap Author New Course</span>
                  </button>
                </div>
              ) : (
                metrics.courseStats.map((item: any) => (
                  <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                    <div className="overflow-hidden">
                      <div className="flex items-center space-x-2.5">
                        <h4 className="text-xs font-extrabold text-slate-850 dark:text-white truncate group-hover:text-brand-500 transition-colors">{item.title}</h4>
                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${
                          item.status === 'published' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1">
                        Enrollments: <span className="text-slate-650 dark:text-slate-350">{item.enrollments}</span> | Completions: <span className="text-slate-650 dark:text-slate-350">{item.completions}</span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedCourseId(item.id);
                          setAddingModule(true);
                        }}
                        className="px-4 py-2 border border-slate-200/60 dark:border-slate-800/80 hover:border-brand-500/30 hover:bg-slate-50/50 dark:hover:bg-slate-900 rounded-xl text-[10px] font-bold text-slate-650 dark:text-slate-350 transition-colors"
                      >
                        Add Module Node
                      </button>
                      <button
                        className="p-2 border border-red-200/20 text-red-500 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/5 rounded-xl transition-colors"
                        onClick={async () => {
                          if (confirm('Delete this course from studio? This action is permanent.')) {
                            await courseService.deleteCourse(item.id);
                            fetchInstructorStudio();
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200/30 dark:border-slate-850 flex justify-center">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest font-mono">Catalog sync secured</span>
          </div>
        </div>

        {/* Recently enrolled trends list */}
        <div className="lg:col-span-4 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/60 p-6 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2 border-b border-slate-200/30 dark:border-slate-800/40 pb-3">
              <BarChart3 className="h-4.5 w-4.5 text-brand-500 shrink-0" />
              <span>Real-Time Enrollment Feed</span>
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-slate-850 flex-grow">
              {metrics?.recentEnrollments?.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <p className="text-xs font-semibold">No transactions recorded.</p>
                  <p className="text-[9px] text-slate-500 mt-1">Mock user enrollment events will stream here.</p>
                </div>
              ) : (
                metrics.recentEnrollments.map((enr: any, idx: number) => (
                  <div key={idx} className="py-3 space-y-1 font-sans group hover:bg-slate-50/50 dark:hover:bg-slate-950/20 px-2 rounded-xl transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-extrabold text-slate-850 dark:text-white">{enr.studentName}</p>
                      <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-450 uppercase flex items-center">
                        <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Enrolled
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate font-medium">Syllabus: {enr.courseTitle}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200/30 dark:border-slate-850 flex justify-center">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest font-mono font-bold flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-emerald-500 animate-pulse" /> Live Telemetry
            </span>
          </div>
        </div>

      </div>

      {/* dialog modals with AnimatePresence */}
      <AnimatePresence>
        {/* Dialog overlay for Create Course */}
        {creatingCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay background */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCreatingCourse(false)} 
              className="absolute inset-0 bg-black/50 backdrop-blur-md" 
            />
            
            <motion.form 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onSubmit={handleCreateCourse} 
              className="relative w-full max-w-lg p-6 sm:p-8 rounded-[2rem] border border-slate-200/60 dark:border-slate-800/80 shadow-2xl bg-white dark:bg-slate-950 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/55 pb-3">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                  <FolderPlus className="w-5 h-5 text-brand-500" />
                  <span>Author Curriculum Course</span>
                </h2>
                <span className="text-[9px] font-bold text-slate-450 uppercase font-mono bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded">NEW_COURSE</span>
              </div>
              
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-350">Course Title</label>
                <input
                  type="text"
                  placeholder="e.g. Advanced Distributed Stream Architectures"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-350">Course Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. Master reactive stream pipelines and domain modular boundaries"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none dark:text-white"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-350">Detailed Course Description</label>
                <textarea
                  placeholder="Write detailed outlines and syllabus expectations..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={4}
                  className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-350">Price (USD)</label>
                  <input
                    type="number"
                    placeholder="99"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-350">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none dark:text-white"
                  >
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Frontend Development">Frontend Development</option>
                    <option value="DevOps">DevOps</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-250/20 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setCreatingCourse(false)}
                  className="px-4.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-500/10"
                >
                  Save Draft Course
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {/* Dialog overlay for Add Module */}
        {addingModule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAddingModule(false)} 
              className="absolute inset-0 bg-black/50 backdrop-blur-md" 
            />
            
            <motion.form 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onSubmit={handleAddModule} 
              className="relative w-full max-w-md p-6 sm:p-8 rounded-[2rem] border border-slate-200/60 dark:border-slate-800/80 shadow-2xl bg-white dark:bg-slate-950 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/55 pb-3">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-brand-500 animate-spin-slow" />
                  <span>Add Syllabus Module</span>
                </h2>
                <span className="text-[9px] font-bold text-slate-450 uppercase font-mono bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded">MOD_NODE</span>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-350">Module Title</label>
                <input
                  type="text"
                  placeholder="e.g. Domain boundaries and event dispatchers"
                  value={modTitle}
                  onChange={(e) => setModTitle(e.target.value)}
                  className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-350">Sort Sequence Order</label>
                <input
                  type="number"
                  placeholder="1"
                  value={modOrder}
                  onChange={(e) => setModOrder(e.target.value)}
                  className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none dark:text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-250/20 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setAddingModule(false)}
                  className="px-4.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-500/10"
                >
                  Add Module Node
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
