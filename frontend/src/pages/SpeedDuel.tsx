import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { 
  Flame, 
  Terminal, 
  Play, 
  RotateCcw, 
  Trophy, 
  Zap, 
  AlertCircle, 
  CheckCircle,
  HelpCircle,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock coding challenge
const CHALLENGE = {
  title: 'Reverse Words in String',
  description: 'Write a function `reverseWords(s)` that takes a string `s` and reverses the order of words. A word is defined as a sequence of non-space characters. The words in `s` will be separated by at least one space. Return the words joined by a single space with no leading or trailing spaces.',
  signature: `function reverseWords(s) {\n  // Write your speed solution here...\n  \n}`,
  tests: [
    { input: '"the sky is blue"', expected: '"blue is sky the"' },
    { input: '"  hello world  "', expected: '"world hello"' },
    { input: '"a good   example"', expected: '"example good a"' },
    { input: '"  Bob    Loves  Alice   "', expected: '"Alice Loves Bob"' },
    { input: '"Alice"', expected: '"Alice"' }
  ]
};

// AI code segments for simulated typing
const AI_TYPING_SNIPPETS = [
  "function reverseWords(s) {",
  "  // AI is parsing input",
  "  const words = s.trim().split(/\\s+/);",
  "  // AI event dispatchers starting",
  "  const reversed = [];",
  "  for (let i = words.length - 1; i >= 0; i--) {",
  "    reversed.push(words[i]);",
  "  }",
  "  return reversed.join(' ');",
  "}"
];

export default function SpeedDuel() {
  const navigate = useNavigate();
  const [playerCode, setPlayerCode] = useState(CHALLENGE.signature);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [playerProgress, setPlayerProgress] = useState(0); // 0 to 5 test cases
  const [aiProgress, setAiProgress] = useState(0); // 0 to 5 test cases
  const [isCompiling, setIsCompiling] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>(['Arena status: Awaiting challengers. Click "Commence Code Duel" to begin!']);
  const [gameOver, setGameOver] = useState(false);
  const [winStatus, setWinStatus] = useState<'win' | 'lose' | 'draw' | null>(null);
  
  // AI Typing simulation states
  const [aiCode, setAiCode] = useState('// AI is analyzing specifications...');
  const [aiStatus, setAiStatus] = useState('Idle');
  
  const timerRef = useRef<any>(null);
  const aiProgressRef = useRef<any>(null);
  const aiTypingRef = useRef<any>(null);

  // Initialize and clean up game timers
  useEffect(() => {
    return () => {
      stopTimers();
    };
  }, []);

  const stopTimers = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (aiProgressRef.current) clearInterval(aiProgressRef.current);
    if (aiTypingRef.current) clearInterval(aiTypingRef.current);
  };

  const handleStartGame = () => {
    setGameStarted(true);
    setTimeLeft(180);
    setPlayerProgress(0);
    setAiProgress(0);
    setGameOver(false);
    setWinStatus(null);
    setAiCode('// AI establishing socket handshake...\n');
    setAiStatus('Analyzing Challenge');
    setTerminalOutput([
      '⚡ DUEL INITIATED ⚡',
      'Task: Reverse Words in String',
      'Submitting compilation will assert all 5 structural test cases.',
      'WARNING: AI Copilot is typing actively. Speed is essential.'
    ]);

    // Main game countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame('draw');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Simulate AI typing code segments
    let snippetIdx = 0;
    let charIdx = 0;
    let currentCode = '';
    
    aiTypingRef.current = setInterval(() => {
      if (snippetIdx < AI_TYPING_SNIPPETS.length) {
        setAiStatus('Writing Solution');
        const targetLine = AI_TYPING_SNIPPETS[snippetIdx];
        if (charIdx < targetLine.length) {
          currentCode += targetLine[charIdx];
          setAiCode(currentCode + '\n_');
          charIdx++;
        } else {
          currentCode += '\n';
          snippetIdx++;
          charIdx = 0;
        }
      } else {
        setAiStatus('Optimizing Space complexity');
        if (aiTypingRef.current) clearInterval(aiTypingRef.current);
      }
    }, 90); // speed typing

    // Simulate AI progress increments
    aiProgressRef.current = setInterval(() => {
      setAiProgress((prev) => {
        const next = prev + 1;
        setTerminalOutput(old => [
          ...old,
          `⚠️ AI Copilot compiled! Assertions passed: ${next}/5`
        ]);
        if (next >= 5) {
          endGame('lose');
          return 5;
        }
        return next;
      });
    }, 28000); // AI completes in about 2.3 minutes
  };

  const endGame = (status: 'win' | 'lose' | 'draw') => {
    stopTimers();
    setGameOver(true);
    setWinStatus(status);
    
    if (status === 'win') {
      setTerminalOutput(old => [
        ...old,
        '🏆 VICTORY ACHIEVED! You out-compiled the AI Copilot!',
        'Reward added: +150 XP accumulated, Flame streak maintained!'
      ]);
    } else if (status === 'lose') {
      setTerminalOutput(old => [
        ...old,
        '💀 DEFEAT. AI Copilot completed all test assertions first.',
        'Study recommendation: Review string token split filters.'
      ]);
    } else {
      setTerminalOutput(old => [
        ...old,
        '⌛ TIME LIMIT EXPIRED. Duel closed as a split draw.'
      ]);
    }
  };

  const handleCompileCode = () => {
    if (!gameStarted || gameOver) return;
    setIsCompiling(true);
    setTerminalOutput(old => [...old, '🔄 Compiling player buffer... Running test suite asserts.']);

    setTimeout(() => {
      setIsCompiling(false);
      
      // Simple dynamic evaluation logic - look for regex/split keywords or simulate success
      const codeHasSplit = playerCode.includes('.split') || playerCode.includes('split(');
      const codeHasJoin = playerCode.includes('.join') || playerCode.includes('join(');
      
      let score = 0;
      if (codeHasSplit) score += 2;
      if (codeHasJoin) score += 2;
      if (playerCode.includes('reverse') || playerCode.includes('words.length')) score += 1;
      
      setPlayerProgress(score);
      
      const newLogs = CHALLENGE.tests.map((test, idx) => {
        const passed = idx < score;
        return `${passed ? '✅' : '❌'} Test Case ${idx + 1}: input ${test.input} | Expected: ${test.expected} | ${passed ? 'PASSED' : 'FAILED'}`;
      });

      setTerminalOutput(old => [
        ...old,
        ...newLogs,
        `📊 Compilation Result: Passed ${score}/5 test assertions.`
      ]);

      if (score >= 5) {
        endGame('win');
      }
    }, 1200);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 font-sans flex flex-col justify-between selection:bg-brand-500/30 selection:text-white">
      {/* Top Header telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-4 gap-4">
        <div>
          <span className="text-[9px] font-black text-brand-400 uppercase tracking-widest bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/15">
            Synchronous AI Duel Chamber
          </span>
          <h1 className="text-2xl font-black text-white mt-1 flex items-center gap-2 font-sans">
            <Flame className="h-6 w-6 text-brand-500 animate-pulse animate-duration-1000" />
            <span>AI Speed Coding Arena Duel</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2">
            <Clock className="h-4.5 w-4.5 text-brand-400 font-sans" />
            <span className="font-mono text-sm font-bold text-white tracking-widest">
              {formatTime(timeLeft)}
            </span>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            Leave Arena
          </button>
        </div>
      </div>

      {/* Duel Arena layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-4 flex-grow items-stretch">
        
        {/* Left Side: Instructions and Player Code workspace */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
          
          {/* Challenge Description panel */}
          <div className="bg-slate-900/60 border border-slate-800/70 p-5 rounded-[2rem] space-y-3">
            <h2 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-brand-500" />
              <span>Specs: {CHALLENGE.title}</span>
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-sans text-left">
              {CHALLENGE.description}
            </p>
          </div>

          {/* Monaco Coding Arena Panel */}
          <div className="rounded-[2rem] border-2 border-slate-350 dark:border-slate-800 bg-slate-950 overflow-hidden flex-grow flex flex-col min-h-[400px]">
            <div className="bg-slate-900/90 px-4 py-3 border-b-2 border-slate-350 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 font-mono">SOLUTION.JS</span>
              <span className="text-[8px] font-black text-brand-500 uppercase tracking-widest">Monaco Playground ready</span>
            </div>
            
            <div className="flex-grow relative">
              <Editor
                height="100%"
                defaultLanguage="javascript"
                theme="vs-dark"
                value={playerCode}
                onChange={(val) => setPlayerCode(val || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 12,
                  fontFamily: 'Fira Code, Menlo, Monaco, Courier New, monospace',
                  padding: { top: 12 },
                  readOnly: !gameStarted || gameOver
                }}
              />
            </div>

            {/* Code Controls bar */}
            <div className="bg-slate-900/90 px-4 py-3 border-t-2 border-slate-350 dark:border-slate-800 flex items-center justify-between gap-4">
              <button
                onClick={() => setPlayerCode(CHALLENGE.signature)}
                disabled={!gameStarted || gameOver}
                className="p-2 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all hover:bg-slate-850 disabled:opacity-50"
                title="Reset solution template"
              >
                <RotateCcw className="h-4.5 w-4.5" />
              </button>

              <button
                onClick={handleCompileCode}
                disabled={!gameStarted || gameOver || isCompiling}
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-500/10 flex items-center gap-1.5 disabled:opacity-50 transition-colors"
              >
                {isCompiling ? (
                  <>
                    <div className="h-3 w-3 rounded-full border border-white border-t-transparent animate-spin" />
                    <span>Compiling...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Compile & Speed Run Tests</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Right Side: AI Opponent and Terminal log */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
          
          {/* AI Copilot Status & Editor View */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-[2rem] p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800/70 pb-3">
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1">
                  <Zap className="h-4 w-4 text-brand-500 animate-bounce" />
                  <span>AI Copilot Opponent</span>
                </h3>
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                  aiStatus === 'Writing Solution' ? 'bg-amber-500/10 text-amber-500' : 'bg-brand-500/10 text-brand-400'
                }`}>
                  {aiStatus}
                </span>
              </div>
            </div>

            {/* Code simulated viewer */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 h-[180px] overflow-y-auto font-mono text-[10px] text-slate-400 leading-relaxed text-left">
              <pre>{aiCode}</pre>
            </div>

            <div className="pt-2 border-t border-slate-850">
              <p className="text-[10px] text-slate-500 font-semibold leading-normal text-left">
                Status: Simulated AI model splitscreen typist. Complete the puzzle before the AI compiles all 5 test asserts.
              </p>
            </div>
          </div>

          {/* Test case assertion track */}
          <div className="bg-slate-900/60 border border-slate-800/85 rounded-[2rem] p-5 space-y-4 text-left">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-brand-500" />
              <span>Duel Racing Track</span>
            </h3>

            <div className="space-y-4">
              {/* Player Progress row */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-slate-300">You (Player)</span>
                  <span className="text-brand-500 font-mono">{playerProgress}/5 Asserts</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                  <div 
                    className="bg-brand-500 h-full rounded-full transition-all duration-500 shadow-md shadow-brand-500/30"
                    style={{ width: `${(playerProgress / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* AI Progress row */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-slate-300">AI Copilot</span>
                  <span className="text-amber-500 font-mono">{aiProgress}/5 Asserts</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-500 shadow-md shadow-amber-500/30"
                    style={{ width: `${(aiProgress / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Arena Terminal Log */}
          <div className="bg-slate-900/60 border border-slate-800/85 rounded-[2rem] p-5 flex flex-col justify-between flex-grow min-h-[180px]">
            <div className="space-y-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800/70 pb-3">
                <Terminal className="h-4 w-4 text-brand-500" />
                <span>Arena Assertion logs</span>
              </h3>

              <div className="space-y-1.5 font-mono text-[9px] text-slate-450 overflow-y-auto max-h-[150px] text-left leading-normal">
                {terminalOutput.map((log, idx) => (
                  <div key={idx} className="border-b border-slate-850 pb-1 last:border-0 truncate">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Start screen / game over Modals overlay */}
      <AnimatePresence>
        {!gameStarted && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md p-6 sm:p-8 rounded-[2rem] border border-slate-800 shadow-2xl bg-slate-900 space-y-6 text-center"
            >
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-3xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center animate-pulse">
                  <Flame className="h-8 w-8 text-brand-500" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-black text-white tracking-tight">AI Speed Coding Duel</h2>
                <p className="text-xs text-slate-450 leading-normal">
                  Are you prepared to face the AI Copilot? You will be given a JavaScript algorithmic puzzle. Race to compile and pass all 5 test asserts before the AI types its final solution.
                </p>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850 text-left space-y-2 text-[10px]">
                <p className="font-bold text-brand-500 uppercase tracking-wider">CHAMBER CONFIGURATION:</p>
                <div className="grid grid-cols-2 gap-2 text-slate-400 font-semibold">
                  <span>⏱️ Time: 3:00 Minutes</span>
                  <span>🏆 Rewards: +150 XP</span>
                  <span>🔥 Multipliers: Active</span>
                  <span>⚔️ Opponent: AI v1.2</span>
                </div>
              </div>

              <button
                onClick={handleStartGame}
                className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-500/10 flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Commence Code Duel</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}

        {gameOver && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md p-6 sm:p-8 rounded-[2rem] border border-slate-800 shadow-2xl bg-slate-900 space-y-6 text-center"
            >
              <div className="flex justify-center">
                <div className={`h-16 w-16 rounded-3xl flex items-center justify-center border ${
                  winStatus === 'win' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-450' 
                    : 'bg-red-500/10 border-red-500/20 text-red-450'
                }`}>
                  {winStatus === 'win' ? (
                    <Trophy className="h-8 w-8 text-emerald-500 animate-bounce" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-red-500 animate-shake" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-black text-white tracking-tight font-sans">
                  {winStatus === 'win' ? '🏆 Victory Achieved!' : '💀 Defeated in Duel'}
                </h2>
                <p className="text-xs text-slate-400 leading-normal">
                  {winStatus === 'win' 
                    ? 'Excellent compiler speed! You successfully outcoded the AI Copilot and earned full points.'
                    : 'The AI Copilot completed all test suite assertions first. Keep practicing your array reversing split filters!'}
                </p>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850 text-left space-y-2 text-[10px]">
                <p className="font-bold text-brand-500 uppercase tracking-wider">DUEL OUTCOME MATRIX:</p>
                <div className="grid grid-cols-2 gap-2 text-slate-400 font-semibold">
                  <span>🎯 Accuracy: {playerProgress}/5 Asserts</span>
                  <span>⚡ AI Asserts: {aiProgress}/5</span>
                  <span>💎 XP Earned: {winStatus === 'win' ? '+150 XP' : '+15 XP'}</span>
                  <span>🔥 Multipliers: {winStatus === 'win' ? 'Active (2.0x)' : 'Reset'}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 py-3 border border-slate-800 hover:border-slate-700 text-slate-450 hover:text-white font-bold rounded-xl text-xs transition-colors"
                >
                  Dashboard Hub
                </button>
                <button
                  onClick={handleStartGame}
                  className="flex-1 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-500/10 transition-colors"
                >
                  Rematch AI Opponent
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
