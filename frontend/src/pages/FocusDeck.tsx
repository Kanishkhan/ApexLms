import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Timer as TimerIcon, 
  Volume2, 
  VolumeX, 
  CheckSquare, 
  Square, 
  Plus, 
  Trash2, 
  Music, 
  Sliders,
  Sparkles,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SoundChannel {
  name: string;
  icon: string;
  synthType: 'rain' | 'lofi' | 'click';
  volume: number;
  active: boolean;
}

export default function FocusDeck() {
  const navigate = useNavigate();
  
  // Pomodoro states
  const [timerMode, setTimerMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  // Soundscape states
  const [masterMuted, setMasterMuted] = useState(false);
  const [soundChannels, setSoundChannels] = useState<SoundChannel[]>([
    { name: 'Cyberpunk Rain', icon: '🌧️', synthType: 'rain', volume: 0.4, active: false },
    { name: 'Deep Lo-Fi Pads', icon: '🎹', synthType: 'lofi', volume: 0.3, active: false },
    { name: 'Mechanical Ticks', icon: '⌨️', synthType: 'click', volume: 0.2, active: false }
  ]);

  // Task sheet states
  const [tasks, setTasks] = useState<{ id: string; text: string; completed: boolean }[]>([
    { id: '1', text: 'Solve Monaco Event Sourcing Challenge', completed: false },
    { id: '2', text: 'Structure curriculum video upload schema', completed: true },
    { id: '3', text: 'Optimize Redux user UI reducer hooks', completed: false }
  ]);
  const [newTaskInput, setNewTaskInput] = useState('');

  // Audio refs for browser native Web Audio API synthesis
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  // Synthesis nodes references
  const rainGainRef = useRef<GainNode | null>(null);
  const lofiGainRef = useRef<GainNode | null>(null);
  const clickGainRef = useRef<GainNode | null>(null);
  const synthIntervalRef = useRef<any>(null);

  // Main countdown timer interval
  useEffect(() => {
    let interval: any = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerExpiry();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timerMode]);

  // Clean up synthesis loops on unmount
  useEffect(() => {
    return () => {
      stopSynthesizers();
    };
  }, []);

  const handleTimerExpiry = () => {
    setTimerRunning(false);
    alert(`🎉 Interval completed!`);
    
    if (timerMode === 'focus') {
      setCompletedSessions(prev => prev + 1);
      // switch to short break
      setTimerMode('shortBreak');
      setTimeLeft(5 * 60);
    } else {
      setTimerMode('focus');
      setTimeLeft(25 * 60);
    }
  };

  const handleTimerToggle = () => {
    setTimerRunning(!timerRunning);
  };

  const handleTimerReset = () => {
    setTimerRunning(false);
    if (timerMode === 'focus') setTimeLeft(25 * 60);
    else if (timerMode === 'shortBreak') setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const handleModeChange = (mode: 'focus' | 'shortBreak' | 'longBreak') => {
    setTimerRunning(false);
    setTimerMode(mode);
    if (mode === 'focus') setTimeLeft(25 * 60);
    else if (mode === 'shortBreak') setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  // WEB AUDIO SYNTHESIZER LOOPS
  // Dynamically synthesizes cyberpunk rain and lofi synth beats in browser
  const initAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const startSynthesizers = () => {
    initAudioContext();
    const ctx = audioCtxRef.current!;

    // 1. Rain Synthesizer (Filtered Brown Noise Buffer)
    if (!rainGainRef.current) {
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        // Brown noise filter approximation
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // boost rain volume
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      const rainGain = ctx.createGain();
      rainGain.gain.setValueAtTime(0, ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(rainGain);
      rainGain.connect(ctx.destination);
      noiseSource.start();

      rainGainRef.current = rainGain;
    }

    // 2. Lo-Fi Chord Synthesizer (Oscillators schedule)
    if (!lofiGainRef.current) {
      const lofiGain = ctx.createGain();
      lofiGain.gain.setValueAtTime(0, ctx.currentTime);
      lofiGain.connect(ctx.destination);
      lofiGainRef.current = lofiGain;

      // Chord arrays (Fmaj7 - Em7 - Am7)
      const chords = [
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [164.81, 196.00, 246.94, 293.66], // Em7
        [220.00, 261.63, 329.63, 392.00]  // Am7
      ];
      
      let chordIdx = 0;
      const playChord = () => {
        if (!lofiGainRef.current || soundChannels[1].volume === 0 || masterMuted) return;
        const currentChord = chords[chordIdx];
        
        currentChord.forEach((freq) => {
          const osc = ctx.createOscillator();
          const amp = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          amp.gain.setValueAtTime(0, ctx.currentTime);
          amp.gain.linearRampToValueAtTime(0.04 * soundChannels[1].volume, ctx.currentTime + 1.5);
          amp.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 7.5);

          osc.connect(amp);
          amp.connect(lofiGainRef.current!);
          osc.start();
          osc.stop(ctx.currentTime + 8);
        });

        // Trigger dynamic mock vinyl crackle pop
        const crackle = ctx.createOscillator();
        const crackleAmp = ctx.createGain();
        crackle.type = 'triangle';
        crackle.frequency.setValueAtTime(12000, ctx.currentTime);
        crackleAmp.gain.setValueAtTime(0, ctx.currentTime);
        crackleAmp.gain.linearRampToValueAtTime(0.0008, ctx.currentTime + 0.1);
        crackleAmp.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.4);
        crackle.connect(crackleAmp);
        crackleAmp.connect(lofiGainRef.current!);
        crackle.start();
        crackle.stop(ctx.currentTime + 0.5);

        chordIdx = (chordIdx + 1) % chords.length;
      };

      // Play initial chord immediately, then schedule
      playChord();
      synthIntervalRef.current = setInterval(playChord, 8000);
    }

    // 3. Mechanical Click Synthesizer
    if (!clickGainRef.current) {
      const clickGain = ctx.createGain();
      clickGain.gain.setValueAtTime(0, ctx.currentTime);
      clickGain.connect(ctx.destination);
      clickGainRef.current = clickGain;
    }

    // Apply active volume properties E2E
    updateSynthesizerVolumes();
  };

  const stopSynthesizers = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    rainGainRef.current = null;
    lofiGainRef.current = null;
    clickGainRef.current = null;
  };

  const updateSynthesizerVolumes = () => {
    const isMuted = masterMuted;
    
    if (rainGainRef.current) {
      const targetVol = isMuted || !soundChannels[0].active ? 0 : soundChannels[0].volume;
      rainGainRef.current.gain.setTargetAtTime(targetVol, audioCtxRef.current!.currentTime, 0.5);
    }
    if (lofiGainRef.current) {
      const targetVol = isMuted || !soundChannels[1].active ? 0 : soundChannels[1].volume;
      lofiGainRef.current.gain.setTargetAtTime(targetVol, audioCtxRef.current!.currentTime, 0.5);
    }
  };

  const handleToggleChannel = (index: number) => {
    initAudioContext();
    startSynthesizers();

    setSoundChannels(prev => {
      const copy = [...prev];
      copy[index].active = !copy[index].active;
      return copy;
    });

    // Short timeout to let state update before volume change
    setTimeout(updateSynthesizerVolumes, 50);
  };

  const handleChannelVolume = (index: number, vol: number) => {
    setSoundChannels(prev => {
      const copy = [...prev];
      copy[index].volume = vol;
      return copy;
    });
    setTimeout(updateSynthesizerVolumes, 50);
  };

  const triggerKeyboardClick = () => {
    // Generate a simple high-quality mechanical click sound on-demand
    if (!clickGainRef.current || !soundChannels[2].active || masterMuted) return;
    initAudioContext();
    const ctx = audioCtxRef.current!;

    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.05);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);

    amp.gain.setValueAtTime(0.06 * soundChannels[2].volume, ctx.currentTime);
    amp.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);

    osc.connect(filter);
    filter.connect(amp);
    amp.connect(clickGainRef.current!);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    setTasks(prev => [
      ...prev,
      { id: Date.now().toString(), text: newTaskInput.trim(), completed: false }
    ]);
    setNewTaskInput('');
    triggerKeyboardClick();
  };

  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    triggerKeyboardClick();
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    triggerKeyboardClick();
  };

  const formatTimerTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getProgressPercentage = () => {
    const total = timerMode === 'focus' ? 25 * 60 : timerMode === 'shortBreak' ? 5 * 60 : 15 * 60;
    return ((total - timeLeft) / total) * 100;
  };

  return (
    <div className="space-y-8 font-sans max-w-5xl mx-auto px-4 py-6 md:py-8 bg-grid transition-all duration-300">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/60 pb-6 text-left">
        <div>
          <span className="text-[9px] font-bold text-brand-650 dark:text-brand-400 uppercase tracking-widest bg-brand-500/10 px-2.5 py-0.5 rounded-md">
            Productivity Hack Chamber
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">Lo-Fi Study Focus Space</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Immerse yourself in procedurally synthesized cyber acoustics, Pomodoro trackers, and task management sheets.</p>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          Return to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Animated SVG Pomodoro timer card */}
        <div className="lg:col-span-7 rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 p-6 sm:p-8 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md shadow-sm space-y-6 flex flex-col items-center">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800/80 pb-4 w-full justify-between">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <TimerIcon className="h-4.5 w-4.5 text-brand-500" />
              <span>Pomodoro focus track</span>
            </h2>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Intervals completed: {completedSessions}</span>
          </div>

          {/* Mode Switchers */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200/20 w-full sm:w-auto">
            {[
              { id: 'focus', label: '🎯 Focus (25m)' },
              { id: 'shortBreak', label: '☕ Break (5m)' },
              { id: 'longBreak', label: '🌴 Long Break (15m)' }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => handleModeChange(btn.id as any)}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${
                  timerMode === btn.id
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* SVG Animated timer circle wrapper */}
          <div className="relative h-64 w-64 my-4 flex items-center justify-center">
            {/* SVG circle meter */}
            <svg className="absolute inset-0 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-slate-100 dark:stroke-slate-850"
                strokeWidth="5"
                fill="transparent"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-brand-500"
                strokeWidth="5"
                fill="transparent"
                strokeDasharray="276"
                animate={{ strokeDashoffset: 276 - (276 * getProgressPercentage()) / 100 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </svg>

            {/* In-circle timer text */}
            <div className="space-y-1 text-center z-10">
              <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-widest font-mono">
                {formatTimerTime(timeLeft)}
              </h3>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {timerMode === 'focus' ? 'Deep Focus Session' : 'Recharge Break'}
              </p>
            </div>
          </div>

          {/* Timer controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleTimerReset}
              className="p-3 border border-slate-200 dark:border-slate-850 text-slate-400 hover:text-slate-850 dark:hover:text-white rounded-xl transition-all"
              title="Reset Pomodoro Timer"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            
            <button
              onClick={handleTimerToggle}
              className={`px-8 py-3 rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5 transition-all ${
                timerRunning 
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950' 
                  : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-500/10'
              }`}
            >
              {timerRunning ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span>Pause Session</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  <span>Commence Session</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Procedural Soundscapes & Focus Tasks */}
        <div className="lg:col-span-5 space-y-8 flex flex-col">
          
          {/* Soundscapes synthesis board */}
          <div className="rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 p-6 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md shadow-sm space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Music className="h-4.5 w-4.5 text-brand-500" />
                <span>Lo-Fi Soundscapes Synth</span>
              </h3>

              <button
                onClick={() => {
                  setMasterMuted(!masterMuted);
                  setTimeout(updateSynthesizerVolumes, 50);
                }}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400"
              >
                {masterMuted ? <VolumeX className="h-4.5 w-4.5 text-red-500" /> : <Volume2 className="h-4.5 w-4.5" />}
              </button>
            </div>

            {/* Channels lists */}
            <div className="space-y-4 font-sans">
              {soundChannels.map((chan, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleToggleChannel(idx)}
                      className={`flex items-center space-x-2 font-bold transition-colors ${
                        chan.active ? 'text-brand-500' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      <span className="text-sm">{chan.icon}</span>
                      <span>{chan.name}</span>
                    </button>
                    <span className="text-[10px] text-slate-400 font-mono font-bold">
                      {chan.active ? `${Math.round(chan.volume * 100)}%` : 'MUTED'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      disabled={!chan.active}
                      value={chan.volume}
                      onChange={(e) => handleChannelVolume(idx, parseFloat(e.target.value))}
                      className="flex-grow accent-brand-500 h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer disabled:opacity-30"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-150 dark:border-slate-800/80">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest font-mono">Web Audio procedural synth looping</span>
            </div>
          </div>

          {/* Focus Tasks manager */}
          <div className="rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 p-6 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md shadow-sm space-y-4 text-left flex-grow">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <CheckSquare className="h-4.5 w-4.5 text-brand-500" />
              <span>Interval Study checklist</span>
            </h3>

            {/* Task adder form */}
            <form onSubmit={handleAddTask} className="flex gap-2">
              <input
                type="text"
                placeholder="Add focus objective..."
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                className="flex-grow px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none dark:text-white"
              />
              <button
                type="submit"
                className="p-2 bg-slate-900 hover:bg-slate-850 dark:bg-slate-100 dark:hover:bg-slate-50 text-white dark:text-slate-950 rounded-xl transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </form>

            {/* Tasks list */}
            <div className="space-y-2 overflow-y-auto max-h-[180px] font-sans pr-1">
              {tasks.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-400">All set! No pending focus items.</p>
              ) : (
                tasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="flex items-center justify-between p-2.5 bg-slate-50/50 dark:bg-slate-955/40 border border-slate-200/40 dark:border-slate-800/50 rounded-xl hover:border-slate-250 dark:hover:border-slate-800 transition-all group"
                  >
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className="flex items-center space-x-2.5 text-left text-xs text-slate-700 dark:text-slate-350 cursor-pointer overflow-hidden flex-grow"
                    >
                      {task.completed ? (
                        <CheckSquare className="h-4 w-4 text-brand-500 shrink-0" />
                      ) : (
                        <Square className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0" />
                      )}
                      <span className={`truncate leading-normal font-semibold ${task.completed ? 'line-through text-slate-400' : ''}`}>
                        {task.text}
                      </span>
                    </button>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 hover:bg-red-500/10 text-red-500 rounded-lg md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
