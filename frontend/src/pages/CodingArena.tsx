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
  Award,
  FolderOpen,
  FileCode,
  FileText,
  FileJson,
  Layout,
  Maximize2,
  Minimize2,
  RefreshCw,
  Sliders,
  Flame,
  Activity
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
  
  // File explorer tabs: 'solution' | 'readme' | 'tests'
  const [activeFile, setActiveFile] = useState<'solution' | 'readme' | 'tests'>('solution');
  
  // File content buffer
  const [solutionCode, setSolutionCode] = useState('');
  const [readmeContent, setReadmeContent] = useState('');
  const [testsContent, setTestsContent] = useState('');

  const [language, setLanguage] = useState('javascript');
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'explorer' | 'spec'>('explorer');
  const [terminalTab, setTerminalTab] = useState<'console' | 'asserts' | 'heap'>('console');
  
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
      const starterCode = temp ? temp.templateCode : '// Write code here...';
      setSolutionCode(starterCode);

      // Populate mock spec files
      setReadmeContent(`# CHALLENGE SPECS: ${res.data.title}
Difficulty: ${res.data.difficulty.toUpperCase()}
Reward points: ${res.data.points} XP

## Problem Description
${res.data.description}

## Workspace Considerations
- Program secure validations.
- Double-check runtime memory overhead parameters.
`);

      setTestsContent(JSON.stringify({
        problemId: res.data._id,
        language: language,
        assertBlocks: [
          { input: "Assert block inputs...", expected: "Expected outcomes..." }
        ]
      }, null, 2));

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
      if (temp) setSolutionCode(temp.templateCode);
    }
  };

  const handleRunCode = async () => {
    if (!problem) return;
    setRunning(true);
    setIsSubmitResult(false);
    setTerminalOutput(null);
    setTerminalTab('console');
    try {
      const res = await codingService.runCode(problem._id, { code: solutionCode, language });
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
    setTerminalTab('asserts');
    try {
      const res = await codingService.submitCode(problem._id, { code: solutionCode, language });
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
        code: solutionCode,
      });
      setTutorResponse(res.data.hint);
    } catch (err) {
      setTutorResponse('Failed to contact AI Tutor. Try again.');
    } finally {
      setTutorQuery(false);
    }
  };

  const getEditorValue = () => {
    if (activeFile === 'solution') return solutionCode;
    if (activeFile === 'readme') return readmeContent;
    return testsContent;
  };

  const handleEditorChange = (val: string | undefined) => {
    const newVal = val || '';
    if (activeFile === 'solution') setSolutionCode(newVal);
    else if (activeFile === 'readme') setReadmeContent(newVal);
    else setTestsContent(newVal);
  };

  if (loading) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4 font-sans">
        <div className="h-10 w-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-xs font-bold font-mono">Initializing VS-Code Workspace...</p>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4 text-white font-sans">
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
      className="h-[calc(100vh-64px)] flex bg-slate-950 text-slate-100 font-mono overflow-hidden relative border-t-2 border-slate-900"
    >
      {/* XP Level Celebration Panel */}
      <AnimatePresence>
        {showXpCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center space-y-6"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-3xl animate-pulse" />
              <div className="h-28 w-28 rounded-full border-4 border-emerald-500 flex items-center justify-center bg-emerald-500/10 text-emerald-400 shadow-2xl relative z-10 animate-bounce">
                <Award className="h-14 w-14" />
              </div>
            </div>
            <div className="text-center space-y-2 relative z-10 font-sans">
              <h2 className="text-3xl font-black text-glow-gradient">Code Sandbox Accepted!</h2>
              <p className="text-slate-300 text-sm max-w-sm">Congratulations! Your Monaco submission compiled successfully and passed all assert tests.</p>
              <div className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-black text-sm tracking-wide mt-4 uppercase animate-pulse">
                <Sparkles className="h-4 w-4 fill-emerald-450" />
                <span>+{celebrationXp} XP Awarded</span>
              </div>
            </div>
            <button 
              onClick={() => setShowXpCelebration(false)} 
              className="px-6 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 transition-colors"
            >
              Continue Learning
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT PANEL: Workspace Explorer & Specs (w-80) */}
      <div className="w-80 border-r-2 border-slate-900 flex flex-col h-full bg-slate-950 shrink-0 overflow-hidden">
        {/* Workspace selector */}
        <div className="p-3 bg-slate-950 border-b-2 border-slate-900 flex items-center justify-between">
          <Link 
            to="/dashboard"
            className="flex items-center space-x-1 text-xs font-bold text-slate-400 hover:text-brand-400 transition-colors group font-sans"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Syllabus Dashboard</span>
          </Link>
          <span className="text-[9px] font-bold text-slate-650 bg-slate-900 px-2 py-0.5 rounded font-mono border border-slate-800">
            IDE_EXPLORER
          </span>
        </div>

        {/* Sidebar tabs */}
        <div className="flex border-b-2 border-slate-900 text-xs font-sans font-bold">
          <button
            onClick={() => setSidebarTab('explorer')}
            className={`flex-1 py-3 text-center border-b-2 ${sidebarTab === 'explorer' ? 'border-brand-500 text-white bg-slate-900/20' : 'border-transparent text-slate-500 hover:text-white'}`}
          >
            Explorer
          </button>
          <button
            onClick={() => setSidebarTab('spec')}
            className={`flex-1 py-3 text-center border-b-2 ${sidebarTab === 'spec' ? 'border-brand-500 text-white bg-slate-900/20' : 'border-transparent text-slate-500 hover:text-white'}`}
          >
            Challenge Specs
          </button>
        </div>

        {/* Sidebar content */}
        <div className="flex-grow overflow-y-auto p-4 space-y-6 text-left">
          {sidebarTab === 'explorer' ? (
            <div className="space-y-4 font-sans text-xs">
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Workspace Tree</span>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-slate-400 font-bold">
                  <FolderOpen className="h-4 w-4 text-brand-500" />
                  <span>solution_workspace</span>
                </div>
                
                {/* File Nodes */}
                <div className="pl-4 space-y-1">
                  {[
                    { id: 'solution', label: 'solution.js', icon: FileCode, color: 'text-indigo-400' },
                    { id: 'readme', label: 'README.md', icon: FileText, color: 'text-emerald-450' },
                    { id: 'tests', label: 'test_cases.json', icon: FileJson, color: 'text-amber-500' }
                  ].map((file) => {
                    const FileIcon = file.icon;
                    const isSelected = activeFile === file.id;
                    return (
                      <button
                        key={file.id}
                        onClick={() => setActiveFile(file.id as any)}
                        className={`flex items-center space-x-2 w-full px-2 py-1.5 rounded-lg transition-colors font-mono ${
                          isSelected ? 'bg-slate-900 text-white font-bold border border-slate-800' : 'text-slate-400 hover:bg-slate-900/35 hover:text-slate-200'
                        }`}
                      >
                        <FileIcon className={`h-4 w-4 ${file.color}`} />
                        <span>{file.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5 font-sans">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-extrabold text-white">{problem.title}</h3>
                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                  problem.difficulty === 'easy' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                  problem.difficulty === 'medium' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                  'text-red-400 bg-red-500/10 border-red-500/20'
                }`}>
                  {problem.difficulty}
                </span>
                <span className="text-[8px] font-black text-purple-405 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                  {problem.points} XP
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {problem.topicTags.map((tag) => (
                  <span key={tag} className="text-[8px] font-bold text-slate-400 bg-slate-900 border border-slate-850 px-2 py-0.5 rounded uppercase font-mono">
                    {tag}
                  </span>
                ))}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line text-left">
                {problem.description}
              </p>

              {/* AI Tutor Hint Drawer widget */}
              <div className="p-4 rounded-2xl border-2 border-brand-500/20 bg-brand-500/5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4.5 w-4.5 text-brand-400" />
                    <span className="text-[10px] font-black text-brand-350 uppercase">Copilot hint</span>
                  </div>
                  <button
                    onClick={handleAskTutor}
                    disabled={tutorQuery}
                    className="px-2.5 py-1 text-[8px] font-black text-white bg-brand-650 hover:bg-brand-600 rounded-md shadow-sm"
                  >
                    {tutorQuery ? 'Analyzing...' : 'Ask AI Tutor'}
                  </button>
                </div>
                <AnimatePresence>
                  {showTutor && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-brand-500/10 text-[9px] text-slate-400 leading-normal whitespace-pre-line">
                        {tutorQuery ? 'Analyzing code state...' : tutorResponse}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CENTER INTERACTIVE WORKSPACE: Tabs, Monaco Editor, Dual split terminal */}
      <div className="flex-grow flex flex-col h-full overflow-hidden">
        
        {/* Editor Open file tab bar */}
        <div className="bg-slate-950 border-b-2 border-slate-900 flex items-center justify-between shrink-0 p-1.5">
          {/* File tabs */}
          <div className="flex space-x-1.5">
            {[
              { id: 'solution', label: 'solution.js', icon: FileCode, color: 'text-indigo-400' },
              { id: 'readme', label: 'README.md', icon: FileText, color: 'text-emerald-400' },
              { id: 'tests', label: 'test_cases.json', icon: FileJson, color: 'text-amber-505' }
            ].map((tab) => {
              const FileIcon = tab.icon;
              const isSelected = activeFile === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFile(tab.id as any)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    isSelected ? 'bg-slate-900 text-white font-bold border border-slate-800' : 'text-slate-500 hover:text-slate-350'
                  }`}
                >
                  <FileIcon className={`h-3.5 w-3.5 ${tab.color}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2 font-sans">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-slate-900 border-2 border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
            >
              <option value="javascript">JavaScript (Node)</option>
              <option value="typescript">TypeScript (tsc)</option>
              <option value="python">Python (py3)</option>
            </select>
            <button
              onClick={handleRunCode}
              disabled={running || submitting}
              className="px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border-2 border-slate-800 hover:bg-slate-850 rounded-xl transition-all flex items-center space-x-1"
            >
              <Play className="h-3 w-3 fill-current text-indigo-400" />
              <span>Run Tests</span>
            </button>
            <button
              onClick={handleSubmitCode}
              disabled={running || submitting}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-650 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-md flex items-center space-x-1"
            >
              {submitting ? (
                <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle className="h-3 w-3" />
                  <span>Submit Sandbox</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Monaco Editor frame container */}
        <div className="flex-grow relative bg-slate-950 overflow-hidden min-h-[250px]">
          <Editor
            height="100%"
            language={activeFile === 'tests' ? 'json' : language === 'python' ? 'python' : 'javascript'}
            theme="vs-dark"
            value={getEditorValue()}
            onChange={handleEditorChange}
            options={{
              fontSize: 12.5,
              fontFamily: 'JetBrains Mono, Fira Code, Courier New, monospace',
              minimap: { enabled: false },
              automaticLayout: true,
              scrollBeyondLastLine: false,
              padding: { top: 12, bottom: 12 },
              lineNumbers: 'on',
              tabSize: 2,
              readOnly: activeFile === 'readme'
            }}
          />
        </div>

        {/* Dual compile terminal console at the bottom */}
        <div className="h-72 border-t-2 border-slate-900 bg-slate-950 flex flex-col overflow-hidden shrink-0 text-left">
          {/* Terminal Tabs bar */}
          <div className="px-4 py-1.5 bg-slate-950 border-b-2 border-slate-900 flex items-center justify-between text-xs font-black text-slate-500 font-sans">
            <div className="flex space-x-3">
              {[
                { id: 'console', label: 'Terminal Logs', icon: Terminal },
                { id: 'asserts', label: 'Assertion Asserts', icon: CheckCircle },
                { id: 'heap', label: 'Resource Utilization', icon: Cpu }
              ].map((t) => {
                const TabIcon = t.icon;
                const isSel = terminalTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTerminalTab(t.id as any)}
                    className={`flex items-center space-x-1.5 py-1.5 border-b-2 uppercase tracking-wider text-[10px] ${
                      isSel ? 'border-brand-500 text-white font-black' : 'border-transparent text-slate-550 hover:text-slate-350'
                    }`}
                  >
                    <TabIcon className="h-3.5 w-3.5 text-indigo-400" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
            <span className="text-[8px] font-bold text-slate-600 bg-slate-900 px-2 py-0.5 rounded">TERMINAL_DECK</span>
          </div>

          {/* Terminal body */}
          <div className="flex-grow p-4 overflow-y-auto font-mono text-[11px] space-y-4 select-text scrollbar-dark">
            {running || submitting ? (
              <div className="flex items-center space-x-2 text-slate-555 animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-ping" />
                <span>Isolated container executing tests...</span>
              </div>
            ) : terminalOutput ? (
              <div className="space-y-3">
                
                {/* Console Logs Tab */}
                {terminalTab === 'console' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                        terminalOutput.status === 'passed' || terminalOutput.status === 'accepted'
                          ? 'text-emerald-450 bg-emerald-500/10 border-emerald-500/20'
                          : 'text-red-400 bg-red-500/10 border-red-500/20'
                      }`}>
                        {terminalOutput.status}
                      </span>
                      {terminalOutput.runtimeMs !== undefined && (
                        <span className="text-[9px] text-slate-500">
                          Execution: {terminalOutput.runtimeMs} ms | Heap: {terminalOutput.memoryKb} KB
                        </span>
                      )}
                    </div>
                    {terminalOutput.errorMessage && (
                      <div className="p-3 rounded-xl bg-red-500/15 border border-red-550/20 text-red-400 space-y-1">
                        <p className="font-extrabold flex items-center text-[10px]"><AlertTriangle className="h-4 w-4 mr-1 shrink-0" /> Compilation Error:</p>
                        <p className="whitespace-pre-wrap">{terminalOutput.errorMessage}</p>
                      </div>
                    )}
                    <p className="text-slate-500 italic mt-2">// Compilation output streamed successfully.</p>
                  </div>
                )}

                {/* Assertion Asserts Tab */}
                {terminalTab === 'asserts' && (
                  <div className="space-y-3">
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider font-sans">Unit Assert Checks</span>
                    {terminalOutput.results ? (
                      <div className="space-y-2">
                        {terminalOutput.results.map((res: any, idx: number) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-[10px]">
                            <div>
                              <span className="text-[8px] font-black text-slate-500 uppercase">Test Case {idx + 1}</span>
                              <p className="text-slate-350 mt-1">Input: <span className="text-slate-100">{res.input}</span></p>
                              {res.actual && (
                                <p className="text-slate-450 mt-0.5">Expected: {res.expected} ➜ Actual: <span className={res.passed ? 'text-emerald-400' : 'text-red-400'}>{res.actual}</span></p>
                              )}
                            </div>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded ${res.passed ? 'bg-emerald-500/10 text-emerald-450' : 'bg-red-500/10 text-red-450'}`}>
                              {res.passed ? 'PASSED' : 'FAILED'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-600 italic">// No assertion array returned. Make sure to Submit the sandbox.</p>
                    )}
                  </div>
                )}

                {/* Resource Utilization Heap Dials */}
                {terminalTab === 'heap' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                    
                    {/* Heap Memory Dial */}
                    <div className="p-4 rounded-2xl border border-slate-900 bg-slate-950 flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full border-4 border-indigo-500/35 border-t-indigo-500 flex items-center justify-center text-indigo-400 shrink-0 animate-spin-slow">
                        <Cpu className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-slate-500 uppercase">Heap Memory Overhead</p>
                        <p className="text-sm font-black text-white mt-0.5">{terminalOutput.memoryKb || 0} KB</p>
                        <p className="text-[8px] text-slate-500 font-sans mt-0.5">Profiled isolation sandbox footprint</p>
                      </div>
                    </div>

                    {/* Compile duration Gauge */}
                    <div className="p-4 rounded-2xl border border-slate-900 bg-slate-950 flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full border-4 border-emerald-500/35 border-t-emerald-500 flex items-center justify-center text-emerald-400 shrink-0">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-slate-500 uppercase">Sandboxed Compile Speed</p>
                        <p className="text-sm font-black text-white mt-0.5">{terminalOutput.runtimeMs || 0} ms</p>
                        <p className="text-[8px] text-slate-500 font-sans mt-0.5">Latency inside isolated vm layer</p>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            ) : (
              <span className="text-slate-600 italic">// Console ready. Run or Submit code to stream sandbox compiler telemetry outputs.</span>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
