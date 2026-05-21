import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  ArrowRight, 
  ShieldCheck, 
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
  Cpu
} from 'lucide-react';
import { pageVariants, staggerContainer, cardVariants } from '../animations/variants';

export default function Home() {
  const [activePreviewTrack, setActivePreviewTrack] = useState<'architecture' | 'frontend' | 'cloud'>('architecture');

  const previewTracks = {
    architecture: {
      title: 'Enterprise Software Architecture',
      badge: 'Advanced System Design',
      icon: Layers,
      color: 'from-brand-500 to-indigo-500',
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
      color: 'from-purple-500 to-pink-500',
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
      color: 'from-emerald-500 to-teal-500',
      description: 'Orchestrate secure, isolated multi-container production environments with automated Docker Compose and Nginx web servers.',
      modules: [
        'Multi-Stage Dockerfile Compilation',
        'Docker Compose Orchestrated Networks',
        'Nginx Reverse Proxy & Client Routing',
        'JWT & Rate Limiting Web Security'
      ]
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-slate-50 dark:bg-slate-950 bg-grid bg-mesh transition-colors duration-300 font-sans relative overflow-hidden"
    >
      {/* Background radial glow accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] aspect-square rounded-full bg-brand-500/5 dark:bg-brand-500/10 blur-[120px] -z-10 animate-pulse-slow" />
      <div className="absolute bottom-[20%] right-[-10%] w-[50%] aspect-square rounded-full bg-purple-500/5 dark:bg-purple-500/10 blur-[120px] -z-10 animate-pulse-slow" />

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/25 dark:border-brand-500/20 text-brand-700 dark:text-brand-350 text-xs font-bold font-sans tracking-wide uppercase shadow-sm">
              <Flame className="h-4 w-4 text-brand-500 fill-brand-500/10 animate-bounce" />
              <span>Next-Gen Enterprise EdTech</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-slate-900 dark:text-white">
              Upgrade Your Skills With{' '}
              <span className="text-glow-gradient font-black">
                Apex LMS
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-650 dark:text-slate-350 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Master modern software architecture, advanced frontend engineering, and orchestrated cloud platforms with our production-ready curriculum. Designed specifically for ambitious developers.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to="/courses"
                className="flex items-center justify-center space-x-2.5 w-full sm:w-auto px-8 py-4 text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 rounded-2xl transition-all shadow-lg shadow-brand-500/20 hover:shadow-brand-500/35 hover:-translate-y-0.5 group"
              >
                <span>Explore Interactive Syllabus</span>
                <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/register"
                className="flex items-center justify-center w-full sm:w-auto px-8 py-4 text-sm font-bold text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900 rounded-2xl transition-all hover:-translate-y-0.5 shadow-sm"
              >
                Create Free Account
              </Link>
            </div>

            {/* Premium Micro Telemetry Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200/50 dark:border-slate-800/50 max-w-lg mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <p className="text-2xl font-black text-slate-800 dark:text-white">10K+</p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">Active Engineers</p>
              </div>
              <div className="text-center lg:text-left border-l border-slate-200/50 dark:border-slate-850 pl-6">
                <p className="text-2xl font-black text-slate-800 dark:text-white">99.4%</p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">Completion Rate</p>
              </div>
              <div className="text-center lg:text-left border-l border-slate-200/50 dark:border-slate-850 pl-6">
                <p className="text-2xl font-black text-slate-800 dark:text-white">25+</p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">Advanced Tracks</p>
              </div>
            </div>
          </div>

          {/* Hero Right Graphic Container - State-of-the-Art Dashboard Mockup */}
          <div className="lg:col-span-6 flex justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/10 to-purple-500/10 rounded-[2.5rem] blur-3xl -z-10" />
            
            {/* Elegant glowing frame */}
            <div className="w-full max-w-lg p-3 sm:p-4 rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl shadow-2xl relative overflow-hidden transition-all hover:scale-[1.01] hover:border-brand-500/35 duration-500 group">
              <div className="absolute -top-32 -left-32 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl group-hover:bg-brand-500/15 transition-all duration-500" />
              
              {/* Fake dashboard headers */}
              <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono tracking-wider bg-slate-100 dark:bg-slate-950 px-2.5 py-0.5 rounded-md">APEX_STUDIO_V1</span>
                </div>
                <div className="flex items-center space-x-1 text-[10px] font-semibold text-emerald-500 dark:text-emerald-450 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping mr-1" />
                  Live Sync
                </div>
              </div>

              {/* Fake Interactive Studio Canvas mockup */}
              <div className="space-y-4 font-sans text-left">
                {/* Active user status card */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
                  <div className="flex items-center space-x-3.5">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-500 flex items-center justify-center text-white text-xs font-black shadow-md shadow-brand-500/10">
                      JD
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Jane Developer</h4>
                      <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Track: Enterprise Software Architect</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-brand-600 dark:text-brand-400">76%</p>
                    <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-0.5">Overall Progress</p>
                  </div>
                </div>

                {/* Course outline module interactive preview */}
                <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/30 border border-slate-200/50 dark:border-slate-800/30 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Current Study Modules</span>
                    <span className="text-[9px] font-semibold text-brand-500 dark:text-brand-450 hover:underline cursor-pointer flex items-center">
                      Explore All <ArrowRight className="h-2.5 w-2.5 ml-0.5" />
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { title: 'SOLID & Clean Architecture Principles', duration: '45 mins', completed: true, icon: CheckCircle, iconColor: 'text-emerald-500' },
                      { title: 'The Repository-Service Pattern Blueprint', duration: '58 mins', completed: false, icon: Play, iconColor: 'text-brand-500' }
                    ].map((mod, i) => {
                      const Icon = mod.icon;
                      return (
                        <div key={i} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/30 dark:border-slate-800/40 shadow-sm flex items-center justify-between transition-colors hover:border-brand-500/30">
                          <div className="flex items-center space-x-3 overflow-hidden">
                            <div className={`h-7 w-7 rounded-lg bg-slate-50 dark:bg-slate-950 flex items-center justify-center shrink-0`}>
                              <Icon className={`h-3.5 w-3.5 ${mod.iconColor}`} />
                            </div>
                            <div className="overflow-hidden">
                              <h5 className="text-[11px] font-bold text-slate-700 dark:text-slate-350 truncate">{mod.title}</h5>
                              <p className="text-[9px] text-slate-400 mt-0.5">{mod.duration}</p>
                            </div>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${mod.completed ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' : 'bg-brand-50 dark:bg-brand-950/30 text-brand-600'}`}>
                            {mod.completed ? 'Finished' : 'Resume'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Micro Assessment Prompt */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-900/5 to-indigo-900/5 dark:from-purple-950/20 dark:to-indigo-950/20 border border-purple-500/20 dark:border-purple-500/10 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                      <Sparkles className="h-4.5 w-4.5 animate-pulse" />
                    </div>
                    <div>
                      <h5 className="text-[10px] font-bold text-purple-950 dark:text-purple-300">Ready for Domain Assessment?</h5>
                      <p className="text-[8px] text-slate-400 mt-0.5">Attempt the System Design architecture quiz</p>
                    </div>
                  </div>
                  <button className="px-3.5 py-1.5 text-[9px] font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors shadow-sm">
                    Start Quiz
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Grid / Capabilities Section */}
      <section className="py-20 bg-white dark:bg-slate-900/40 border-y border-slate-250/20 dark:border-slate-800/30 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto space-y-3.5 mb-16">
            <div className="inline-block px-3 py-1 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[10px] font-bold uppercase tracking-wider">
              Comprehensive Platform Capabilities
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-4xl">
              Engineered for Real-World Showcase
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Unlike academic CRUD projects, Apex LMS is engineered from the ground up to present startup-level architecture patterns.
            </p>
          </div>

          <motion.div 
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                title: 'Dual-Mode Database Fallback',
                desc: 'Operates in pure Mongoose mode or silently shifts to an in-memory repository layer if databases are offline. Ensures seamless sandbox evaluations.',
                icon: Database,
                color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/10'
              },
              {
                title: 'Double-Token Security Guards',
                desc: 'Secure rotating JWT schemas featuring short-lived access payloads and secure sliding refresh tokens with automated Axios token request retry.',
                icon: Lock,
                color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30 border-purple-500/10'
              },
              {
                title: 'Strict Verbatim Type Safety',
                desc: 'Engineered with comprehensive TypeScript type specifications and verbatim compiler settings to guarantee complete runtime reliability.',
                icon: Cpu,
                color: 'text-brand-500 bg-brand-50 dark:bg-brand-950/30 border-brand-500/10'
              }
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={idx}
                  variants={cardVariants}
                  className="p-8 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/30 backdrop-blur-md shadow-sm hover:shadow-md flex flex-col space-y-4 hover:-translate-y-1 hover:border-brand-500/35 transition-all duration-300"
                >
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${feat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{feat.title}</h3>
                  <p className="text-xs text-slate-550 dark:text-slate-400 font-normal leading-relaxed">{feat.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Interactive Curriculum Previewer Section (WOW Factor!) */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Left panel - Track Selector */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-center">
            <div className="space-y-3 text-center lg:text-left">
              <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest bg-brand-500/10 px-3 py-1 rounded-md">Curriculum Previewer</span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Interactive Syllabi Outline</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
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
                    className={`w-full p-4 rounded-2xl border text-left flex items-start space-x-4 transition-all duration-300 ${
                      isSelected 
                        ? 'bg-white dark:bg-slate-900 border-brand-500 shadow-md shadow-brand-500/5' 
                        : 'bg-transparent border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl shrink-0 ${isSelected ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10' : 'bg-slate-100 dark:bg-slate-900 text-slate-500'}`}>
                      <TrackIcon className="h-5 w-5" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="flex items-center space-x-2">
                        <h4 className={`text-xs font-bold ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-750 dark:text-slate-400'}`}>{track.title}</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold uppercase tracking-wider">{track.badge}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right panel - Track Details Canvas */}
          <div className="lg:col-span-7 flex">
            <div className="w-full rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-6 sm:p-8 flex flex-col justify-between shadow-sm relative overflow-hidden">
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

                  <div className="space-y-3 pt-4 border-t border-slate-250/20 dark:border-slate-850">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Core Syllabus Modules:</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {previewTracks[activePreviewTrack].modules.map((mod, i) => (
                        <div key={i} className="flex items-center space-x-2.5 p-2 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/30 dark:border-slate-800/40">
                          <CheckCircle className="h-4 w-4 text-brand-500 shrink-0" />
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-350">{mod}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 pt-6 border-t border-slate-250/20 dark:border-slate-850 flex items-center justify-between">
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
                  className="px-4 py-2 text-[10px] font-extrabold text-white bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-705 rounded-xl transition-all flex items-center space-x-1"
                >
                  <span>View Full Syllabus</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Testimonials Banner (recruiter-impressive highlight quotes) */}
      <section className="py-16 bg-slate-100/50 dark:bg-slate-900/10 border-t border-slate-250/10 dark:border-slate-850 px-4">
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
            <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/80 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                ))}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-sans italic">
                "{item.quote}"
              </p>
              <div className="flex items-center space-x-2 pt-2 border-t border-slate-100 dark:border-slate-850">
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
        <div className="rounded-[2.5rem] bg-gradient-to-r from-brand-650 to-indigo-650 dark:from-brand-900/60 dark:to-indigo-950/60 border border-brand-500/20 p-8 md:p-14 text-center text-white relative overflow-hidden shadow-xl">
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
                className="px-8 py-3.5 text-xs font-extrabold bg-white text-brand-600 hover:bg-slate-50 rounded-xl transition-all shadow-md hover:-translate-y-0.5"
              >
                Get Started Now
              </Link>
              <Link
                to="/courses"
                className="px-8 py-3.5 text-xs font-extrabold border border-white/20 hover:bg-white/10 rounded-xl transition-all hover:-translate-y-0.5"
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
