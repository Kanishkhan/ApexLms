import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { assignmentService } from '../services/api';
import { 
  FolderGit2, 
  Github, 
  Calendar, 
  CheckCircle, 
  Award, 
  ArrowLeft,
  FileText,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { pageVariants } from '../animations/variants';

interface RubricItem {
  criteria: string;
  maxPoints: number;
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  rubric: RubricItem[];
  maxPoints: number;
}

export default function ProjectConsole() {
  const { id } = useParams<{ id: string }>();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Submit state
  const [githubUrl, setGithubUrl] = useState('');
  const [submissionText, setSubmissionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errMessage, setErrMessage] = useState('');

  useEffect(() => {
    if (id) fetchProjectWorkspace();
  }, [id]);

  const fetchProjectWorkspace = async () => {
    setLoading(true);
    try {
      const res = await assignmentService.getAssignmentById(id!);
      setAssignment(res.data);

      // Check for pre-existing student submissions
      const subRes = await assignmentService.getStudentSubmissions();
      const existing = subRes.data.find((s: any) => s.assignment._id === id);
      if (existing) {
        setSubmission(existing);
        setGithubUrl(existing.githubUrl || '');
        setSubmissionText(existing.submissionText || '');
      }
    } catch (err) {
      console.error('Failed to load project workspace: ', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setErrMessage('');
    
    if (!githubUrl && !submissionText) {
      setErrMessage('Please provide either a valid GitHub Repository link or submission details.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await assignmentService.submitAssignment(assignment!._id, {
        githubUrl,
        submissionText,
      });
      setSubmission(res.data);
      setMessage('Project successfully submitted to the evaluator!');
    } catch (err) {
      setErrMessage('Failed to submit assignment deliverables. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-xs font-bold font-mono">Loading Project Brief...</p>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 animate-bounce" />
        <h3 className="text-lg font-bold">Project Deliverables Workspace Not Found</h3>
        <Link to="/dashboard" className="text-brand-500 hover:underline text-xs flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" /> Return to Dashboard
        </Link>
      </div>
    );
  }

  const deadlineDate = new Date(assignment.deadline);
  const isExpired = new Date() > deadlineDate;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans p-6 md:p-8 lg:p-12 transition-colors duration-300 bg-grid relative overflow-hidden"
    >
      {/* Background glowing decorations */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] aspect-square rounded-full bg-brand-500/5 dark:bg-brand-500/10 blur-[100px] -z-10 animate-pulse-slow" />
      <div className="absolute bottom-[20%] left-[-15%] w-[45%] aspect-square rounded-full bg-purple-500/5 blur-[120px] -z-10" />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* Navigation back */}
        <div className="flex items-center justify-between">
          <Link 
            to="/dashboard"
            className="flex items-center space-x-2 text-slate-500 hover:text-brand-500 text-xs font-bold transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Return to Workspace</span>
          </Link>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-md">
            PROJECT_RUBRIC_V1
          </span>
        </div>

        {/* Page Hero Banner */}
        <div className="p-6 md:p-8 rounded-[2.5rem] bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/55 dark:border-slate-800/60 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-8 items-center glow-effect">
          <div className="md:col-span-2 space-y-4 text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-brand-500/10 border border-brand-500/20 text-brand-650 dark:text-brand-400 text-[10px] font-bold uppercase tracking-wider">
              <FolderGit2 className="h-3.5 w-3.5 text-brand-500 mr-1" />
              <span>Project Deliverables Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">{assignment.title}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">Author your project outputs matching the grading rubrics below.</p>
          </div>

          {/* Pricing/Metrics Gauges */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/80 text-center flex flex-col justify-center items-center space-y-2.5 shadow-sm">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Assignment Max Score</p>
              <div className="text-3xl font-black text-slate-900 dark:text-white flex items-center justify-center space-x-1">
                <Award className="h-7 w-7 text-amber-500 fill-amber-500/10" />
                <span>{assignment.maxPoints} pts</span>
              </div>
            </div>
            {submission?.status === 'graded' ? (
              <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-450 bg-emerald-500/10 px-3 py-1 rounded-lg">
                Score achieved: {submission.pointsEarned} / {assignment.maxPoints}
              </div>
            ) : submission ? (
              <div className="text-[10px] font-bold text-brand-600 dark:text-brand-450 bg-brand-500/10 px-3 py-1 rounded-lg">
                Submitted - Graded Pending
              </div>
            ) : null}
          </div>
        </div>

        {/* Details and Submission form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Details Column (Col 7) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Description */}
            <div className="p-6 sm:p-8 rounded-[2.5rem] bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/55 dark:border-slate-800/60 space-y-4 shadow-sm text-left">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center">
                <FileText className="h-4.5 w-4.5 text-brand-500 mr-2" />
                <span>Project Description & Specifications</span>
              </h3>
              <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans whitespace-pre-wrap prose prose-invert">
                {assignment.description}
              </div>
            </div>

            {/* Rubrics table */}
            <div className="p-6 sm:p-8 rounded-[2.5rem] bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/55 dark:border-slate-800/60 space-y-4 shadow-sm text-left">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center">
                <Award className="h-4.5 w-4.5 text-purple-500 mr-2" />
                <span>Rubric-Based Evaluation Criteria</span>
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {assignment.rubric.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-700 dark:text-slate-300">Criteria {idx + 1}: {item.criteria}</p>
                    </div>
                    <span className="text-[10px] font-extrabold text-purple-600 bg-purple-500/10 px-2.5 py-0.5 rounded-md shrink-0 ml-4 font-mono">
                      Max: {item.maxPoints} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Submission Column (Col 5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Countdown card */}
            <div className="p-5 rounded-3xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/60 text-left space-y-3.5">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-500">
                <Calendar className="h-4 w-4 text-brand-500" />
                <span>Deadline Milestone</span>
              </div>
              <div>
                <p className="text-sm font-black text-slate-800 dark:text-slate-100">{deadlineDate.toLocaleDateString()} at {deadlineDate.toLocaleTimeString()}</p>
                <p className={`text-[10px] font-bold mt-1 uppercase ${isExpired ? 'text-red-500' : 'text-emerald-500'}`}>
                  {isExpired ? '🚨 Milestone Closed (Late submissions flagged)' : '🟢 Active - Submissions Accepted'}
                </p>
              </div>
            </div>

            {/* Submission Form Card */}
            <div className="p-6 sm:p-8 rounded-[2.5rem] bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/55 dark:border-slate-800/60 shadow-md space-y-6 text-left glow-effect">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center">
                <Github className="h-4.5 w-4.5 text-brand-500 mr-2" />
                <span>Submission Console</span>
              </h3>

              {message && (
                <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/20 rounded-xl text-xs font-bold flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" /> {message}
                </div>
              )}
              {errMessage && (
                <div className="p-3 bg-red-500/10 text-red-650 dark:text-red-400 border border-red-500/20 rounded-xl text-xs font-bold flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" /> {errMessage}
                </div>
              )}

              <form onSubmit={handleSubmitProject} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">GitHub Repository Link</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Github className="h-4 w-4" />
                    </span>
                    <input
                      type="url"
                      placeholder="https://github.com/user/repo"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Brief Deliverable Note (Optional)</label>
                  <textarea
                    rows={4}
                    placeholder="Provide credentials, run scripts, or architectural considerations..."
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:outline-none dark:text-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-705 rounded-xl transition-all shadow shadow-brand-500/5 hover:-translate-y-0.5"
                >
                  {submitting ? 'Submitting payload...' : submission ? 'Re-Submit Project' : 'Submit Deliverables'}
                </button>
              </form>

              {/* Feedback Section */}
              {submission?.status === 'graded' && submission.feedback && (
                <div className="border-t border-slate-200/50 dark:border-slate-800/60 pt-4 space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center">
                    <Award className="h-4 w-4 mr-1 text-amber-500" /> Evaluator Feedback:
                  </p>
                  
                  <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-xs space-y-2 text-slate-650 dark:text-slate-350 leading-relaxed font-sans">
                    <p className="font-semibold italic">"{submission.feedback.comments}"</p>
                    
                    <div className="border-t border-slate-200/40 pt-2 space-y-1.5 text-[10px]">
                      {assignment.rubric.map((item, idx) => (
                        <div key={idx} className="flex justify-between font-mono">
                          <span>{item.criteria}:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{submission.feedback.pointsAwarded[idx]} / {item.maxPoints} pts</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </motion.div>
  );
}
