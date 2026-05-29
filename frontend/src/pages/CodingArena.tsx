import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { codingService } from '../services/api';
import { 
  Terminal, 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle, 
  Cpu, 
  Clock, 
  ChevronRight, 
  ArrowLeft,
  Sparkles,
  Bot,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants } from '../animations/variants';

interface Problem {
  _id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topicTags: string[];
  points: number;
  starterTemplates: { language: string; templateCode: string }[];
}

export default function CodingArena() {
  const { id } = useParams<{ id: string }>();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'submissions'>('description');
  
  // Terminal logs
  const [terminalOutput, setTerminalOutput] = useState<any | null>(null);
  const [isSubmitResult, setIsSubmitResult] = useState(false);

  // AI Tutor helper
  const [tutorQuery, setTutorQuery] = useState(false);
  const [tutorResponse, setTutorResponse] = useState('');
  const [showTutor, setShowTutor] = useState(false);

  // Gamification Level-Up Celebration
  const [showXpCelebration, setShowXpCelebration] = useState(false);
  const [celebrationXp, setCelebrationXp] = useState(0);

  useEffect(() => {
    if (id) fetchProblemWorkspace();
  }, [id]);

  const fetchProblemWorkspace = async () => {
    setLoading(true);
    try {
      const res = await codingService.getProblemById(id!);
      setProblem(res.data);
      
      // Auto-load starter template
      const temp = res.data.starterTemplates.find((t: any) => t.language === language);
      if (temp) setCode(temp.templateCode);
    } catch (err) {
      console.error('Failed to load coding problem workspace: ', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    if (problem) {
      const temp = problem.starterTemplates.find((t: any) => t.language === lang);
      if (temp) setCode(temp.templateCode);
    }
  };

  const handleRunCode = async () => {
    if (!problem) return;
    setRunning(true);
    setIsSubmitResult(false);
    setTerminalOutput(null);
    try {
      const res = await codingService.runCode(problem._id, { code, language });
      setTerminalOutput(res.data);
    } catch (err: any) {
      setTerminalOutput({
        status: 'error',
        errorMessage: err.response?.data?.message || 'Execution failed. Inspect compiler setup.',
      });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!problem) return;
    setSubmitting(true);
    setIsSubmitResult(true);
    setTerminalOutput(null);
    try {
      const res = await codingService.submitCode(problem._id, { code, language });
      const { submission, xpEarned } = res.data;
      
      setTerminalOutput(submission);
      
      if (submission.status === 'accepted' && xpEarned > 0) {
        setCelebrationXp(xpEarned);
        setShowXpCelebration(true);
        // Auto dismiss celebration after 4.5s
        setTimeout(() => setShowXpCelebration(false), 4500);
      }
    } catch (err: any) {
      setTerminalOutput({
        status: 'runtime_error',
        errorMessage: err.response?.data?.message || 'Submission compile crashed.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAskTutor = async () => {
    if (!problem) return;
    setTutorQuery(true);
    setTutorResponse('');
    setShowTutor(true);
    try {
      const res = await codingService.askTutor({
        topic: problem.title,
        code,
      });
      setTutorResponse(res.data.hint);
    } catch (err) {
      setTutorResponse('Failed to contact AI Tutor. Try again.');
    } finally {
      setTutorQuery(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-xs font-bold font-mono">Initializing Monaco Workspace...</p>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4 text-white">
        <AlertTriangle className="h-12 w-12 text-amber-500 animate-bounce" />
        <h3 className="text-lg font-bold">Coding Arena Problem Not Found</h3>
        <Link to="/dashboard" className="text-brand-400 hover:underline text-xs flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" /> Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="h-[calc(100vh-64px)] grid grid-cols-1 lg:grid-cols-12 bg-slate-950 text-slate-100 font-sans overflow-hidden relative"
    >
      {/* XP Level Celebration Panel */}
      <AnimatePresence>
        {showXpCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex flex-col items-center justify-center space-y-6"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-3xl animate-pulse" />
              <div className="h-28 w-28 rounded-full border-4 border-emerald-500 flex items-center justify-center bg-emerald-500/10 text-emerald-400 shadow-2xl relative z-10 animate-bounce">
                <Award className="h-14 w-14" />
              </div>
            </div>
            <div className="text-center space-y-2 relative z-10">
              <h2 className="text-3xl font-black text-glow-gradient">Code Accepted!</h2>
              <p className="text-slate-350 text-sm max-w-xs">Congratulations! Your Monaco submission compiled successfully and passed all test cases.</p>
              <div className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-black text-sm tracking-wide mt-4 uppercase animate-pulse">
                <Sparkles className="h-4 w-4 fill-emerald-400" />
                <span>+{celebrationXp} XP Awarded</span>
              </div>
            </div>
            <button 
              onClick={() => setShowXpCelebration(false)} 
              className="px-6 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-350 transition-colors"
            >
              Continue Learning
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT PANE: Details, specification & AI tutor (Col 5) */}
      <div className="lg:col-span-5 border-r border-slate-900 flex flex-col h-full bg-slate-950 overflow-hidden">
        
        {/* Top workspace navigation */}
        <div className="p-3 border-b border-slate-900 flex items-center justify-between">
          <Link 
            to="/dashboard"
            className="flex items-center space-x-1 text-xs font-bold text-slate-400 hover:text-brand-400 transition-colors group"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Coding Catalog</span>
          </Link>
          <span className="text-[9px] font-bold text-slate-600 bg-slate-900 px-2 py-0.5 rounded font-mono">
            ARENA_WORKSPACE_V1
          </span>
        </div>

        {/* Workspace tabs */}
        <div className="flex border-b border-slate-900">
          <button 
            onClick={() => setActiveTab('description')}
            className={`px-6 py-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'description' ? 'border-brand-500 text-white bg-slate-900/20' : 'border-transparent text-slate-450 hover:text-white'
            }`}
          >
            Description
          </button>
          <button 
            onClick={() => setActiveTab('submissions')}
            className={`px-6 py-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'submissions' ? 'border-brand-500 text-white bg-slate-900/20' : 'border-transparent text-slate-450 hover:text-white'
            }`}
          >
            Submissions History
          </button>
        </div>

        {/* Left pane content wrapper */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-dark">
          {activeTab === 'description' ? (
            <div className="space-y-5 text-left">
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-extrabold text-white tracking-tight">{problem.title}</h1>
                <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-md border ${
                  problem.difficulty === 'easy' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                  problem.difficulty === 'medium' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                  'text-red-400 bg-red-500/10 border-red-500/20'
                }`}>
                  {problem.difficulty}
                </span>
                <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-md flex items-center">
                  <Sparkles className="h-3 w-3 mr-1 fill-purple-400" />
                  {problem.points} XP
                </span>
              </div>

              {/* Topic tags */}
              <div className="flex flex-wrap gap-2">
                {problem.topicTags.map((tag) => (
                  <span key={tag} className="text-[9px] font-bold text-slate-450 bg-slate-900 border border-slate-850 px-2.5 py-1 rounded-lg">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Problem Description */}
              <div className="text-xs text-slate-350 leading-relaxed font-sans space-y-4 prose prose-invert max-w-none">
                {/* Parse descriptive markdown blocks */}
                <p className="whitespace-pre-line">{problem.description}</p>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-900 pt-6" />

              {/* AI Tutor Callout Widget */}
              <div className="rounded-2xl border border-brand-500/20 bg-brand-500/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="h-8 w-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400">
                      <Bot className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-brand-350 leading-none">Need an Architectural Hint?</h4>
                      <p className="text-[9px] text-slate-500 mt-1 leading-none">AI Code Tutor is available</p>
                    </div>
                  </div>
                  <button
                    onClick={handleAskTutor}
                    disabled={tutorQuery}
                    className="px-3.5 py-1.5 text-[9px] font-black text-white bg-brand-650 hover:bg-brand-600 rounded-lg transition-colors shadow-sm shadow-brand-500/10 flex items-center"
                  >
                    {tutorQuery ? 'Analyzing...' : 'Ask AI Tutor'}
                  </button>
                </div>

                {/* AI Tutor Hint Output overlay */}
                <AnimatePresence>
                  {showTutor && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2.5 p-3 rounded-xl bg-slate-950 border border-brand-500/15 text-[10px] text-slate-350 font-sans leading-relaxed whitespace-pre-line">
                        {tutorQuery ? (
                          <div className="flex items-center space-x-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-ping" />
                            <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-ping delay-75" />
                            <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-ping delay-150" />
                            <span className="text-slate-550 pl-1">Analyzing code state...</span>
                          </div>
                        ) : tutorResponse}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          ) : (
            <div className="space-y-4 text-left">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Submission Logs</h3>
              <p className="text-[10px] text-slate-400">View your runtime history, memory metrics, and compiler logs inside this problem arena.</p>
              
              {/* Submission empty state */}
              <div className="py-12 border border-dashed border-slate-900 rounded-3xl text-center text-slate-550 max-w-sm mx-auto space-y-2">
                <Terminal className="h-7 w-7 mx-auto" />
                <p className="text-xs font-semibold text-slate-400">No submission logs</p>
                <p className="text-[9px]">Submit your code to profile compiled metrics.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANE: Monaco Code Editor & Live terminal logs (Col 7) */}
      <div className="lg:col-span-7 flex flex-col h-full bg-slate-950 overflow-hidden">
        
        {/* Editor Controls Bar */}
        <div className="p-3 bg-slate-950 border-b border-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <span className="text-xs font-bold text-slate-350">Language:</span>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="javascript">JavaScript (Node.js)</option>
              <option value="typescript">TypeScript (tsc)</option>
              <option value="python">Python (py3)</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRunCode}
              disabled={running || submitting}
              className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-850 rounded-xl transition-all flex items-center space-x-1.5 border border-slate-800 shadow-sm"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Run Tests</span>
            </button>
            <button
              onClick={handleSubmitCode}
              disabled={running || submitting}
              className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-650 to-teal-650 hover:from-emerald-600 hover:to-teal-600 rounded-xl transition-all shadow-md shadow-emerald-500/10 flex items-center space-x-1.5 hover:-translate-y-0.5"
            >
              {submitting ? (
                <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Submit Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Monaco Editor Container */}
        <div className="flex-grow relative bg-slate-950 overflow-hidden min-h-[350px]">
          <Editor
            height="100%"
            language={language === 'python' ? 'python' : 'javascript'}
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{
              fontSize: 12.5,
              fontFamily: 'JetBrains Mono, Fira Code, Courier New, monospace',
              minimap: { enabled: false },
              automaticLayout: true,
              scrollBeyondLastLine: false,
              padding: { top: 12, bottom: 12 },
              lineNumbers: 'on',
              tabSize: 2,
            }}
          />
        </div>

        {/* Live Terminal outputs */}
        <div className="h-64 border-t border-slate-900 bg-slate-950 flex flex-col overflow-hidden shrink-0">
          <div className="px-4 py-2 bg-slate-950 border-b border-slate-900 flex items-center justify-between text-xs font-black text-slate-400">
            <span className="flex items-center space-x-1.5 font-mono uppercase tracking-wider">
              <Terminal className="h-3.5 w-3.5 text-brand-500" />
              <span>Execution Console Outputs</span>
            </span>
            <span className="text-[8px] font-bold text-slate-600 font-mono bg-slate-900 px-2 py-0.5 rounded">Terminal Output</span>
          </div>

          <div className="flex-grow p-4 overflow-y-auto font-mono text-xs space-y-4 text-left select-text scrollbar-dark">
            {running || submitting ? (
              <div className="flex items-center space-x-2 text-slate-500 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-slate-500 animate-ping" />
                <span>Running compilation sandboxes and checking assert blocks...</span>
              </div>
            ) : terminalOutput ? (
              <div className="space-y-3.5 font-mono">
                {/* Status indicator */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-extrabold tracking-widest uppercase border ${
                    terminalOutput.status === 'passed' || terminalOutput.status === 'accepted'
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : 'text-red-400 bg-red-500/10 border-red-500/20'
                  }`}>
                    {terminalOutput.status}
                  </span>

                  {/* Performance metrics */}
                  {terminalOutput.runtimeMs !== undefined && (
                    <div className="flex items-center space-x-3 text-[10px] text-slate-450 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-850">
                      <span className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1 text-slate-400" />
                        Runtime: <strong className="text-white font-bold ml-1">{terminalOutput.runtimeMs} ms</strong>
                      </span>
                      <span className="h-3 w-px bg-slate-800" />
                      <span className="flex items-center">
                        <Cpu className="h-3.5 w-3.5 mr-1 text-slate-400" />
                        Memory: <strong className="text-white font-bold ml-1">{terminalOutput.memoryKb} KB</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Error messages overlay */}
                {terminalOutput.errorMessage && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px]">
                    <p className="font-bold flex items-center mb-1">
                      <AlertTriangle className="h-4.5 w-4.5 mr-1" /> Compile/Runtime Error:
                    </p>
                    <p className="whitespace-pre-wrap">{terminalOutput.errorMessage}</p>
                  </div>
                )}

                {/* Detailed Test results */}
                {terminalOutput.results && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Test Cases Assert logs:</p>
                    <div className="space-y-1.5">
                      {terminalOutput.results.map((res: any, idx: number) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-between text-[11px]">
                          <div className="overflow-hidden">
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wide">Test Case {idx + 1}:</span>
                            <p className="text-slate-400 truncate mt-1">Input: <span className="text-slate-200">{res.input}</span></p>
                            {res.actual && (
                              <p className="text-slate-450 mt-0.5">Expected: <span className="text-slate-350">{res.expected}</span> ➜ Actual: <span className={res.passed ? 'text-emerald-400' : 'text-red-400'}>{res.actual}</span></p>
                            )}
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                            res.passed ? 'bg-emerald-500/10 text-emerald-450' : 'bg-red-500/10 text-red-450'
                          }`}>
                            {res.passed ? 'PASSED' : 'FAILED'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <span className="text-slate-600 italic">No output. Click "Run Tests" or "Submit Code" to run the sandbox.</span>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
