import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService } from '../services/api';
import type { Quiz } from '../types';
import { 
  Award, 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  ClipboardList,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants } from '../animations/variants';

export default function QuizPlayer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  
  const [attemptResult, setAttemptResult] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    if (id) fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const data = await quizService.getQuizById(id!);
      setQuiz(data.data);
      // Initialize answers array with -1
      setAnswers(new Array(data.data.questions.length).fill(-1));
    } catch (err) {
      console.error('Failed to load quiz metadata: ', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optIdx: number) => {
    const updated = [...answers];
    updated[currentIdx] = optIdx;
    setAnswers(updated);
  };

  const handleNext = () => {
    if (!quiz) return;
    if (currentIdx < quiz.questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    if (answers.includes(-1)) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await quizService.submitAttempt(quiz._id, answers);
      setAttemptResult(res.data);
    } catch (err) {
      console.error('Submit quiz attempt failed: ', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 font-sans bg-grid">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading module assessment...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 font-sans bg-grid">
        <HelpCircle className="h-12 w-12 text-slate-400 animate-bounce" />
        <h3 className="text-lg font-bold">Assessment Not Found</h3>
        <button onClick={() => navigate('/courses')} className="px-5 py-2.5 bg-brand-650 hover:bg-brand-600 text-white rounded-xl font-bold shadow-md transition-all">Return to Explore</button>
      </div>
    );
  }

  // If graded attempt result exists, show Results Screen (WOW Factor SVG Gauge + Details list)
  if (attemptResult) {
    const passed = attemptResult.passed;
    const score = attemptResult.score;
    // Circular calculation parameters
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300 bg-grid bg-mesh relative overflow-hidden"
      >
        <div className="absolute top-[-10%] right-[-10%] w-[50%] aspect-square bg-brand-500/5 rounded-full blur-[120px] -z-10 animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[45%] aspect-square bg-purple-500/5 rounded-full blur-[100px] -z-10" />

        <div className="w-full max-w-2xl space-y-6 z-10 relative">
          
          <div className="p-6 sm:p-8 rounded-[2.5rem] bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/55 dark:border-slate-800/60 shadow-2xl space-y-6 glow-effect text-center">
            
            {/* Elegant glowing result icon */}
            <div className="mx-auto h-24 w-24 rounded-full flex items-center justify-center relative">
              <div className={`absolute inset-0 rounded-full blur-xl opacity-20 ${passed ? 'bg-emerald-500' : 'bg-red-500'}`} />
              {passed ? (
                <div className="h-20 w-20 bg-emerald-500/10 dark:bg-emerald-950/20 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                  <CheckCircle className="h-11 w-11 animate-pulse" />
                </div>
              ) : (
                <div className="h-20 w-20 bg-red-500/10 dark:bg-red-950/20 rounded-full flex items-center justify-center text-red-500 border border-red-500/20">
                  <XCircle className="h-11 w-11 animate-pulse" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-brand-650 dark:text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-md">
                Telemetry Graded
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-3">
                {passed ? 'Certification Requirements Met!' : 'Assessment Retake Required'}
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {passed 
                  ? 'Excellent job! You have fully verified your structural system architectural design capabilities in this module.' 
                  : 'You were close! Take a few moments to review your course material and attempt again.'}
              </p>
            </div>

            {/* SVG Score Gauge Meter - HIGH QUALITY */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4 border-y border-slate-200/40 dark:border-slate-800/40">
              <div className="relative h-32 w-32 shrink-0">
                <svg className="h-full w-full -rotate-90">
                  {/* Outer circle track */}
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    className="stroke-slate-200 dark:stroke-slate-850 fill-transparent"
                    strokeWidth="8"
                  />
                  {/* Colored progress line */}
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    className={`fill-transparent transition-all duration-1000 ease-out ${passed ? 'stroke-emerald-500' : 'stroke-brand-500'}`}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Center score labels */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{score}%</span>
                  <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Score</span>
                </div>
              </div>

              {/* Tally parameters */}
              <div className="space-y-3.5 text-left w-full max-w-xs font-sans">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Correct Answers</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-250 font-mono">
                    {attemptResult.correctCount} / {attemptResult.totalQuestions}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Required Threshold</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-250 font-mono">
                    {attemptResult.passingScore}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Assessment Result</span>
                  <span className={`font-black uppercase text-[10px] px-2 py-0.5 rounded ${
                    passed ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450' : 'bg-red-500/10 text-red-600 dark:text-red-450'
                  }`}>
                    {passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Review Selector */}
            <div className="text-left space-y-3.5">
              <button
                type="button"
                onClick={() => setShowReview(!showReview)}
                className="w-full py-2.5 border border-slate-200/50 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 rounded-xl text-xs font-bold text-slate-650 dark:text-slate-350 flex items-center justify-between transition-all"
              >
                <span className="pl-4">Inspect Performance Outline</span>
                <span className="pr-4">{showReview ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}</span>
              </button>

              <AnimatePresence>
                {showReview && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3 pt-2 max-h-60 overflow-y-auto pr-1">
                      {quiz.questions.map((q, idx) => {
                        const userAnsIdx = answers[idx];
                        const isCorrect = userAnsIdx === q.correctAnswerIndex;
                        return (
                          <div key={idx} className="p-3.5 border border-slate-200/40 dark:border-slate-850 rounded-2xl bg-slate-50/30 dark:bg-slate-950/20 space-y-2">
                            <div className="flex items-start justify-between gap-3">
                              <span className="text-[10px] font-bold text-slate-400">Q{idx + 1}</span>
                              <span className={`h-4.5 w-4.5 rounded-full flex items-center justify-center shrink-0 ${isCorrect ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'}`}>
                                {isCorrect ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-normal">{q.questionText}</p>
                            <p className="text-[10px] text-slate-400">
                              Your answer:{' '}
                              <span className={`font-semibold ${isCorrect ? 'text-emerald-600 dark:text-emerald-450' : 'text-red-650 dark:text-red-450'}`}>
                                {q.options[userAnsIdx] || 'None'}
                              </span>
                            </p>
                            {!isCorrect && (
                              <p className="text-[10px] text-slate-450">
                                Correct answer:{' '}
                                <span className="font-semibold text-emerald-600 dark:text-emerald-450">
                                  {q.options[q.correctAnswerIndex]}
                                </span>
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Navigation links */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-200/30 dark:border-slate-800/40">
              {passed ? (
                <button
                  onClick={() => navigate(`/courses/${quiz.course}/play`)}
                  className="flex items-center justify-center space-x-2.5 w-full py-3.5 text-xs font-bold text-white bg-gradient-to-r from-brand-650 to-indigo-650 hover:from-brand-600 hover:to-indigo-600 rounded-xl transition-all shadow-md shadow-brand-500/15 hover:-translate-y-0.5 group"
                >
                  <span>Resume Course Syllabus</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setAttemptResult(null);
                      setCurrentIdx(0);
                      setAnswers(new Array(quiz.questions.length).fill(-1));
                    }}
                    className="flex items-center justify-center space-x-2 w-full py-3.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-705 rounded-xl transition-all shadow-md hover:-translate-y-0.5"
                  >
                    <span>Retry Assessment</span>
                  </button>
                  <button
                    onClick={() => navigate(`/courses/${quiz.course}/play`)}
                    className="flex items-center justify-center space-x-2 w-full py-3.5 text-xs font-bold text-slate-750 dark:text-slate-250 border border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-all"
                  >
                    <span>Back to player</span>
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      </motion.div>
    );
  }

  const currentQuestion = quiz.questions[currentIdx];
  const selectedOption = answers[currentIdx];

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans p-4 md:p-8 flex items-center justify-center transition-colors duration-300 bg-grid bg-mesh relative overflow-hidden"
    >
      <div className="absolute top-10 left-10 w-72 h-72 bg-brand-500/5 rounded-full blur-[80px] -z-10" />

      <div className="w-full max-w-2xl space-y-6 relative z-10">
        
        {/* Header toolbar */}
        <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-slate-800/40 pb-4">
          <div className="flex items-center space-x-2">
            <ClipboardList className="h-5 w-5 text-brand-500" />
            <h1 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">{quiz.title}</h1>
          </div>
          <span className="text-xs font-bold text-slate-400 font-mono bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded">
            Card {currentIdx + 1} of {quiz.questions.length}
          </span>
        </div>

        {/* Assessment Card content */}
        <div className="rounded-[2.5rem] border border-slate-200/55 dark:border-slate-800/60 p-6 md:p-8 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md shadow-2xl space-y-6 glow-effect">
          
          <div className="space-y-4 text-left">
            <div className="flex items-center space-x-1.5 text-[9px] text-brand-650 dark:text-brand-400 font-black uppercase tracking-widest bg-brand-500/10 px-2.5 py-0.5 rounded-md inline-flex">
              <HelpCircle className="h-3.5 w-3.5 text-brand-500 mr-1 animate-pulse shrink-0" />
              <span>Question {currentIdx + 1}</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
              {currentQuestion.questionText}
            </h2>
          </div>

          {/* Multiple options grid */}
          <div className="grid grid-cols-1 gap-3.5 pt-2">
            {currentQuestion.options.map((opt, optIdx) => {
              const isChosen = selectedOption === optIdx;
              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full text-left p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5 ${
                    isChosen
                      ? 'bg-brand-500/10 border-brand-500 text-brand-700 dark:text-brand-350 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 bg-transparent hover:bg-slate-100/50 dark:hover:bg-slate-900/50'
                  }`}
                >
                  <span className="pr-4 leading-normal">{opt}</span>
                  <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center shrink-0 ${
                    isChosen ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-300 dark:border-slate-750'
                  }`}>
                    {isChosen && <div className="h-1.5 w-1.5 bg-white rounded-full" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Nav Actions Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200/40 dark:border-slate-800/50">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="flex items-center space-x-1.5 px-4 py-2.5 border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </button>

            {currentIdx < quiz.questions.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={selectedOption === -1}
                className="flex items-center space-x-1.5 px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-705 disabled:opacity-40 rounded-xl transition-all shadow-sm"
              >
                <span>Next Question</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || answers.includes(-1)}
                className="flex items-center space-x-1.5 px-6 py-2.5 text-xs font-extrabold text-white bg-brand-650 hover:bg-brand-600 disabled:opacity-40 rounded-xl transition-all shadow-md shadow-brand-500/15"
              >
                {submitting ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Submit Assessment</span>
                    <CheckCircle className="h-4 w-4 text-brand-200" />
                  </>
                )}
              </button>
            )}
          </div>

        </div>

      </div>
    </motion.div>
  );
}
