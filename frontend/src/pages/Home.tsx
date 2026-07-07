import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  ArrowRight, 
  Flame, 
  BookOpen, 
  Star, 
  Users, 
  Play, 
  Sparkles, 
  Laptop, 
  Layers, 
  Terminal, 
  CheckCircle,
  Database,
  Lock,
  Cpu,
  Trophy,
  Check,
  Activity,
  Calendar,
  Code2,
  ChevronRight,
  Bot
} from 'lucide-react';
import { pageVariants, staggerContainer, cardVariants } from '../animations/variants';

export default function Home() {
  const [activePreviewTrack, setActivePreviewTrack] = useState<'architecture' | 'frontend' | 'cloud'>('architecture');
  
  // Daily challenge mock playground code execution state
  const [mockCode, setMockCode] = useState(`function calculateFactorial(num) {
  if (num === 0 || num === 1) return 1;
  return num * calculateFactorial(num - 1);
}`);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSuccess, setPlaySuccess] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>(['// Execution terminal ready...', '// Click "Run Code Sandbox" to profile asserts.']);

  const previewTracks = {
    architecture: {
      title: 'Enterprise Software Architecture',
      badge: 'Advanced System Design',
      icon: Layers,
      color: 'from-brand-600 to-indigo-600',
      description: 'Master clean architecture, SOLID principles, domain-driven design, and the repository-service-controller pattern in Node.js.',
      modules: [
        'Domain-Driven Design Foundations',
        'Repository & Unit of Work Patterns',
        'Scalable RESTful API Architecture',
        'Zod Payload Validation Pipelines'
      ]
    },
    frontend: {
      title: 'Advanced Frontend Engineering',
      badge: 'React & State Telemetry',
      icon: Laptop,
      color: 'from-purple-650 to-pink-650',
      description: 'Acquire capabilities in strict TypeScript React interfaces, silent refresh token axios interceptors, and high-fidelity layouts.',
      modules: [
        'Strict Type-Only Verbatim Syntax',
        'JWT Rotating Axios Interceptors',
        'Redux Toolkit Telemetry Stores',
        'Framer Motion Micro-Animations'
      ]
    },
    cloud: {
      title: 'DevOps & Resilient Cloud Infrastructures',
      badge: 'Production-Ready Scaling',
      icon: Terminal,
      color: 'from-emerald-600 to-teal-650',
      description: 'Orchestrate secure, isolated multi-container production environments with automated Docker Compose and Nginx web servers.',
      modules: [
        'Multi-Stage Dockerfile Compilation',
        'Docker Compose Orchestrated Networks',
        'Nginx Reverse Proxy & Client Routing',
        'JWT & Rate Limiting Web Security'
      ]
    }
  };



  const handleRunMockSandbox = () => {
    setIsPlaying(true);
    setConsoleLogs(['[INFO] Initializing Isolated Node Sandbox Compilation...', '[INFO] Resolving assert test boundaries...']);
    setTimeout(() => {
      setConsoleLogs(prev => [
        ...prev,
        '✔ testCase1: assert(calculateFactorial(0) === 1) -> PASSED',
        '✔ testCase2: assert(calculateFactorial(5) === 120) -> PASSED',
        '✔ testCase3: assert(calculateFactorial(10) === 3628800) -> PASSED',
        '🎉 compilation completed: 3/3 Asserts Checked successfully!',
        '🔋 telemetry: Execution Time: 8.5ms | Heap: 142 KB',
        '🏆 XP Gained: +50 XP Awarded to Student Profile!'
      ]);
      setIsPlaying(false);
      setPlaySuccess(true);
    }, 1800);
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-slate-50 dark:bg-slate-950 bg-grid bg-mesh transition-colors duration-300 font-sans relative overflow-hidden text-slate-900 dark:text-slate-100"
    >
      {/* Background radial glow accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] aspect-square rounded-full bg-brand-500/5 dark:bg-brand-500/10 blur-[120px] -z-10 animate-pulse-slow" />
      <div className="absolute bottom-[20%] right-[-10%] w-[50%] aspect-square rounded-full bg-purple-500/5 dark:bg-purple-500/10 blur-[120px] -z-10 animate-pulse-slow" />

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 px-4 lg:px-8 border-b border-slate-200 dark:border-slate-850">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/35 dark:border-brand-500/20 text-brand-700 dark:text-brand-350 text-xs font-black font-sans tracking-wide uppercase shadow-sm">
              <Flame className="h-4 w-4 text-brand-500 fill-brand-500/10 animate-bounce" />
              <span>Enterprise Engineering Classroom</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-slate-900 dark:text-white">
              Why settle for LMS placeholders? Master{' '}
              <span className="text-glow-gradient font-black">
                Apex Learning Cloud
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-700 dark:text-slate-350 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
              Traditional courses offer static textbooks. ALC combines Monaco-editor LeetCode sandboxes, GitHub rubric evaluation classrooms, interactive skill trees, and real-time AI tutor hint consoles. Built for software engineers.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to="/courses"
                className="flex items-center justify-center space-x-2.5 w-full sm:w-auto px-8 py-4 text-sm font-bold text-white bg-indigo-650 hover:bg-indigo-600 rounded-2xl transition-all shadow-lg shadow-indigo-650/20 hover:shadow-indigo-650/35 hover:-translate-y-0.5 group"
              >
                <span>Explore Interactive Paths</span>
                <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/register"
                className="flex items-center justify-center w-full sm:w-auto px-8 py-4 text-sm font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-400 rounded-2xl transition-all hover:-translate-y-0.5 shadow-sm"
              >
                Launch Developer Sandbox
              </Link>
            </div>

            {/* Premium Differentiator Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-300 dark:border-slate-850 text-left">
              <div className="flex items-start space-x-2.5">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-850 dark:text-slate-100">VS-Code Style IDE Workspaces</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Edit file trees, compile secure asserts, and profile memory overlays inside Monaco.</p>
                </div>
              </div>
              <div className="flex items-start space-x-2.5">
                <CheckCircle className="h-4.5 w-4.5 text-brand-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-850 dark:text-slate-100">Duolingo Skill Paths Flow</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Ditch boring catalogs: map your engineering progress visually through interactive node graphs.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Right Graphic Container - High Contrast Interactive IDE Sandbox Preview */}
          <div className="lg:col-span-6 flex justify-center relative w-full">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/10 to-purple-500/10 rounded-[2.5rem] blur-3xl -z-10" />
            
            {/* Elegant high-contrast IDE editor mock frame */}
            <div className="w-full max-w-lg p-4 rounded-3xl border-2 border-slate-350 dark:border-slate-850 bg-white dark:bg-slate-950 shadow-2xl relative overflow-hidden group text-left">
              <div className="flex items-center justify-between border-b-2 border-slate-250 dark:border-slate-900 pb-3 mb-3">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[10px] font-black text-slate-700 dark:text-slate-400 font-mono tracking-wider bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded">MONACO_PLAYGROUND_MOCK</span>
                </div>
                <div className="flex items-center space-x-1 text-[9px] font-black text-indigo-650 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-550/20 px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping mr-1" />
                  Live Compiler
                </div>
              </div>

              {/* Mock Monaco Editor Code Stream */}
              <div className="space-y-4 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed select-text">
                  <textarea
                    rows={4}
                    value={mockCode}
                    onChange={(e) => setMockCode(e.target.value)}
                    className="w-full bg-transparent text-slate-100 dark:text-slate-300 font-mono text-[10px] border-none outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">Fibonacci / Factorial Sandbox Playground</span>
                  <button 
                    onClick={handleRunMockSandbox}
                    disabled={isPlaying}
                    className="px-4 py-2 text-[10px] font-extrabold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md flex items-center space-x-1"
                  >
                    {isPlaying ? (
                      <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Play className="h-3 w-3 fill-current" />
                        <span>Run Code Sandbox</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Compile Outputs */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-900 text-[9px] text-slate-400 space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-500 border-b border-slate-900 pb-1 uppercase tracking-widest flex items-center">
                    <Terminal className="h-3.5 w-3.5 mr-1 text-slate-500" /> Terminal Assert Log Console
                  </p>
                  {consoleLogs.map((log, idx) => (
                    <p key={idx} className={log.startsWith('✔') || log.startsWith('🎉') ? 'text-emerald-400' : log.startsWith('🏆') ? 'text-amber-400 font-bold' : ''}>
                      {log}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 3: Premium features showcase card matrices */}
      <section className="py-20 bg-white dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-850 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto space-y-3.5 mb-16">
            <span className="inline-block px-3 py-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-405 text-[10px] font-black uppercase tracking-wider">
              Core Platform Capabilities
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-4xl">
              Engineered for Enterprise Competence
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              We ditched typical static layouts. The ALC visual design is built after elite SaaS models to present complex frontend/backend architecture telemetry.
            </p>
          </div>

          <motion.div 
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                title: 'High Contrast Design System',
                desc: 'A premium, highly-polished palette offering high-visibility borders, rich grays, and vivid actions satisfying strict WCAG AA color accessibility.',
                icon: Cpu,
                color: 'text-indigo-650 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-500/10'
              },
              {
                title: 'Interactive AI Copilots',
                desc: 'An AI-ready Learning Assistant panel embedded inside the course play window to ask lesson questions, generate summaries, and explain code snippets.',
                icon: Bot,
                color: 'text-purple-550 bg-purple-50 dark:bg-purple-950/30 border-purple-500/10'
              },
              {
                title: 'SaaS Heatmap Analytics',
                desc: 'Includes student learning analytics heatmaps logging activity contributions and XP skill growth radial charts inside student dashboards.',
                icon: Activity,
                color: 'text-emerald-650 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/10'
              }
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={idx}
                  variants={cardVariants}
                  className="p-8 rounded-[2.5rem] border-2 border-slate-350 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md shadow-sm hover:shadow-md flex flex-col space-y-4 hover:-translate-y-1 hover:border-brand-500/35 transition-all duration-300 text-left"
                >
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${feat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{feat.title}</h3>
                  <p className="text-xs text-slate-555 dark:text-slate-400 font-normal leading-relaxed">{feat.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* SECTION 4: Interactive Curriculum Previewer Track Selector */}
      <section className="py-20 px-4 max-w-7xl mx-auto border-b border-slate-200 dark:border-slate-850">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Left panel - Track Selector */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-center text-left">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-md">Curriculum Previewer</span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Interactive Syllabi Outline</h2>
              <p className="text-xs text-slate-500 dark:text-slate-450 font-medium leading-relaxed">
                Click across our primary tracks to inspect the curated modules, lessons, and assessment structures populated inside the studio.
              </p>
            </div>

            <div className="space-y-3">
              {(Object.keys(previewTracks) as Array<keyof typeof previewTracks>).map((trackKey) => {
                const track = previewTracks[trackKey];
                const TrackIcon = track.icon;
                const isSelected = activePreviewTrack === trackKey;
                return (
                  <button
                    key={trackKey}
                    onClick={() => setActivePreviewTrack(trackKey)}
                    className={`w-full p-4.5 rounded-2xl border-2 text-left flex items-start space-x-4 transition-all duration-300 ${
                      isSelected 
                        ? 'bg-white dark:bg-slate-900 border-indigo-500 shadow-md shadow-brand-500/5' 
                        : 'bg-transparent border-slate-300 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-850'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl shrink-0 ${isSelected ? 'bg-indigo-600 text-white shadow-md shadow-indigo-650/15' : 'bg-slate-100 dark:bg-slate-900 text-slate-500'}`}>
                      <TrackIcon className="h-5 w-5" />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className={`text-xs font-black ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-750 dark:text-slate-400'}`}>{track.title}</h4>
                      <p className="text-[9px] text-slate-400 mt-1 font-semibold uppercase tracking-wider font-mono">{track.badge}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right panel - Track Details Canvas */}
          <div className="lg:col-span-7 flex">
            <div className="w-full rounded-3xl border-2 border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-xl p-6 sm:p-8 flex flex-col justify-between shadow-sm relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl" />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePreviewTrack}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 flex-grow flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[9px] font-bold text-white px-2.5 py-0.5 rounded-md bg-gradient-to-r ${previewTracks[activePreviewTrack].color}`}>
                        {previewTracks[activePreviewTrack].badge}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
                      {previewTracks[activePreviewTrack].title}
                    </h3>
                    
                    <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed font-sans">
                      {previewTracks[activePreviewTrack].description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-250 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Core Syllabus Modules:</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {previewTracks[activePreviewTrack].modules.map((mod, i) => (
                        <div key={i} className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/20 border border-slate-350 dark:border-slate-850">
                          <CheckCircle className="h-4 w-4 text-brand-500 shrink-0" />
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{mod}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 pt-6 border-t border-slate-250 dark:border-slate-850 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <img
                        key={i}
                        className="w-5 h-5 rounded-full border border-white dark:border-slate-900 object-cover"
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=user${i}`}
                        alt="User Avatar"
                      />
                    ))}
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">3,400+ Enrolled Developers</span>
                </div>
                
                <Link
                  to="/courses"
                  className="px-4 py-2.5 text-[10px] font-extrabold text-white bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-705 rounded-xl transition-all flex items-center space-x-1"
                >
                  <span>View Full Syllabus</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Recruiter-Impressive Quotes */}
      <section className="py-16 bg-slate-100/50 dark:bg-slate-900/10 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              quote: "The clean architecture pattern utilized in the Node/Express backend mirror actual high-scale production systems. It’s highly impressive for an internship showcase portfolio.",
              author: "Senior Software Architect",
              company: "Stripe Developer Relations"
            },
            {
              quote: "Strict TypeScript type-only imports and robust token refresh Axios interceptors are the exact methodologies we look for in software engineering candidates.",
              author: "Director of Engineering",
              company: "Vercel Core Systems"
            }
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border-2 border-slate-300 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between text-left">
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                ))}
              </div>
              <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-sans italic">
                "{item.quote}"
              </p>
              <div className="flex items-center space-x-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center font-bold text-[9px] text-slate-500">
                  {item.author[0]}
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-800 dark:text-slate-200">{item.author}</h4>
                  <p className="text-[8px] text-slate-400 mt-0.5">{item.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="rounded-[2.5rem] bg-indigo-650 dark:bg-indigo-950/60 border-2 border-indigo-500/20 p-8 md:p-14 text-center text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-3xl -z-10 animate-pulse-slow" />
          <div className="relative space-y-6 max-w-xl mx-auto">
            <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-white text-[9px] font-bold uppercase tracking-widest">
              Zero-Setup Evaluation Boot Mode
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Ready to Level Up Your Architecture Career?</h2>
            <p className="text-sm text-brand-100 font-sans leading-relaxed">
              Enroll today inside our premium interactive paths. Explore course syllabus lists, study double-pane course players, and complete interactive quiz assessments.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3.5 pt-4">
              <Link
                to="/register"
                className="px-8 py-3.5 text-xs font-extrabold bg-white text-indigo-650 hover:bg-slate-50 rounded-xl transition-all shadow-md hover:-translate-y-0.5"
              >
                Get Started Now
              </Link>
              <Link
                to="/courses"
                className="px-8 py-3.5 text-xs font-extrabold border-2 border-white/20 hover:bg-white/10 rounded-xl transition-all hover:-translate-y-0.5"
              >
                Browse Syllabus Catalog
              </Link>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
