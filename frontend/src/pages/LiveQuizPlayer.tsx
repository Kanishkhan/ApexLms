import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import type { RootState } from '../store';
import { dailyQuizService } from '../services/api';
import {
  Play,
  Users,
  Trophy,
  Award,
  AlertTriangle,
  ArrowLeft,
  Clock,
  CheckCircle,
  HelpCircle,
  Hash,
  ChevronRight,
  Shield,
  Sparkles,
  Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants } from '../animations/variants';

export default function LiveQuizPlayer() {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Socket reference
  const socketRef = useRef<Socket | null>(null);

  // States
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [status, setStatus] = useState<'lobby' | 'waiting' | 'active' | 'leaderboard' | 'finished'>('lobby');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Active session data
  const [sessionData, setSessionData] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [answersStatus, setAnswersStatus] = useState<any>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [availableQuizzes, setAvailableQuizzes] = useState<any[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [timeStarted, setTimeStarted] = useState<number | null>(null);

  // Timer Ref
  const timerIntervalRef = useRef<any>(null);

  useEffect(() => {
    // Initialize socket connection
    const socketUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api/v1', '') 
      : 'http://localhost:5000';
    
    const socket = io(socketUrl, {
      transports: ['websocket'],
      withCredentials: true
    });
    socketRef.current = socket;

    // Load available quizzes if instructor
    if (user?.role === 'instructor' || user?.role === 'admin') {
      fetchQuizzes();
    }

    // Socket Event listeners
    socket.on('room_created', ({ roomCode, session }) => {
      setRoomCode(roomCode);
      setSessionData(session);
      setStatus('waiting');
    });

    socket.on('room_update', (session) => {
      setSessionData(session);
    });

    socket.on('next_question', (questionData) => {
      setCurrentQuestion(questionData);
      setSelectedAnswers([]);
      setHasAnswered(false);
      setTimeRemaining(questionData.timeLimit || 30);
      setTimeStarted(Date.now());
      setStatus('active');
      
      // Start client timer countdown
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    socket.on('answers_status', (data) => {
      setAnswersStatus(data);
    });

    socket.on('all_answered', () => {
      if (user?.role === 'instructor' || user?.role === 'admin') {
        // Automatically reveal results or alert the host
      }
    });

    socket.on('leaderboard', ({ leaderboard, answersReceived }) => {
      setLeaderboard(leaderboard);
      setStatus('leaderboard');
    });

    socket.on('quiz_end', ({ leaderboard }) => {
      setLeaderboard(leaderboard);
      setStatus('finished');
    });

    socket.on('error', (err) => {
      setErrorMsg(err.message || 'An error occurred');
    });

    return () => {
      socket.disconnect();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [user]);

  const fetchQuizzes = async () => {
    try {
      const res = await dailyQuizService.getDailyQuizToday();
      if (res.data?.dailyQuiz) {
        setAvailableQuizzes([res.data.dailyQuiz]);
        setSelectedQuizId(res.data.dailyQuiz._id);
      }
    } catch (e) {
      console.log('No daily quiz found or server not responding.');
    }
  };

  // Host Action: Create Room
  const handleHostCreateRoom = () => {
    if (!selectedQuizId) {
      setErrorMsg('Please select a quiz to host.');
      return;
    }
    setErrorMsg('');
    socketRef.current?.emit('host_create_room', {
      quizId: selectedQuizId,
      userId: user?._id
    });
  };

  // Student Action: Join Room
  const handleStudentJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) {
      setErrorMsg('Room Code is required.');
      return;
    }
    setErrorMsg('');
    socketRef.current?.emit('student_join_room', {
      roomCode: inputCode.toUpperCase().trim(),
      userId: user?._id,
      username: user?.name || 'Student'
    });
    setRoomCode(inputCode.toUpperCase().trim());
    setStatus('waiting');
  };

  // Host Action: Start Live Quiz
  const handleHostStartQuiz = () => {
    if (!roomCode) return;
    socketRef.current?.emit('host_start_quiz', { roomCode });
  };

  // Host Action: Show Leaderboard
  const handleHostShowLeaderboard = () => {
    if (!roomCode) return;
    socketRef.current?.emit('host_show_leaderboard', { roomCode });
  };

  // Host Action: Trigger Next Question (or end)
  const handleHostNextQuestion = () => {
    if (!roomCode) return;
    socketRef.current?.emit('host_next_question', { roomCode });
  };

  // Student Action: Submit Answer Choice
  const handleStudentSubmitAnswer = (optionValue: string) => {
    if (hasAnswered || timeRemaining <= 0) return;

    let updated = [...selectedAnswers];
    if (currentQuestion.questionType === 'multiple-choice') {
      if (updated.includes(optionValue)) {
        updated = updated.filter(v => v !== optionValue);
      } else {
        updated.push(optionValue);
      }
      setSelectedAnswers(updated);
    } else {
      updated = [optionValue];
      setSelectedAnswers(updated);
      submitToSocket(updated);
    }
  };

  const submitMultipleChoiceAnswers = () => {
    if (selectedAnswers.length === 0) return;
    submitToSocket(selectedAnswers);
  };

  const submitToSocket = (answersList: string[]) => {
    const timeTaken = timeStarted ? (Date.now() - timeStarted) / 1000 : 0;
    setHasAnswered(true);
    socketRef.current?.emit('student_submit_answer', {
      roomCode,
      userId: user?._id,
      answerValues: answersList,
      timeTaken: Math.min(timeRemaining, timeTaken)
    });
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-[calc(100vh-64px)] bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans border-t-2 border-slate-900"
    >
      {/* Dynamic Header */}
      <div className="max-w-4xl w-full flex justify-between items-center mb-6">
        <Link to="/dashboard" className="flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-brand-400 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Leave Room</span>
        </Link>
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
          <Shield className="h-4 w-4 text-brand-400" />
          <span className="text-xs font-bold text-slate-300 capitalize">{user?.role} Mode</span>
        </div>
      </div>

      {/* Main Glassmorphic Arena Card */}
      <div className="max-w-4xl w-full bg-slate-900/60 backdrop-blur-xl border-2 border-slate-850 rounded-3xl p-8 relative overflow-hidden shadow-2xl flex flex-col min-h-[480px] justify-center items-center">
        
        {/* Error Alert Display */}
        {errorMsg && (
          <div className="absolute top-4 left-4 right-4 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-2xl flex items-center space-x-2 text-xs font-medium animate-pulse">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* LOBBY / INITIAL JOIN STATE */}
          {status === 'lobby' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full flex flex-col items-center text-center max-w-md space-y-6"
            >
              <div className="h-16 w-16 bg-brand-500/10 rounded-3xl border border-brand-500/20 flex items-center justify-center text-brand-400 mb-2">
                <Users className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-glow-gradient tracking-tight">Kahoot Classroom Mode</h1>
                <p className="text-slate-400 text-sm mt-2">Join live classroom quizzes hosted by instructors, compete on leaderboards, and rack up bonus XP points.</p>
              </div>

              {/* INSTRUCTOR / ADMIN: Host Room panel */}
              {(user?.role === 'instructor' || user?.role === 'admin') ? (
                <div className="w-full bg-slate-950/40 p-5 rounded-2xl border border-slate-850 space-y-4">
                  <h3 className="text-xs font-bold text-left text-slate-400 uppercase tracking-wider">Host Dashboard</h3>
                  {availableQuizzes.length > 0 ? (
                    <div className="space-y-3">
                      <label className="block text-left text-xs text-slate-500">Select Active Quiz:</label>
                      <select
                        value={selectedQuizId}
                        onChange={(e) => setSelectedQuizId(e.target.value)}
                        className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                      >
                        {availableQuizzes.map(q => (
                          <option key={q._id} value={q._id}>{q.title}</option>
                        ))}
                      </select>
                      <button
                        onClick={handleHostCreateRoom}
                        className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 text-xs"
                      >
                        <Play className="h-4 w-4 fill-current" />
                        <span>Create Live Host Room</span>
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 py-4 font-mono">// Loading active quizzes...</p>
                  )}
                </div>
              ) : (
                /* STUDENT: Join Room Panel */
                <form onSubmit={handleStudentJoin} className="w-full space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="ENTER 6-DIGIT ROOM CODE"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      maxLength={6}
                      className="w-full bg-slate-950 border-2 border-slate-800 focus:border-brand-500 text-center tracking-widest text-xl font-black py-4 rounded-2xl text-white outline-none transition-all placeholder:tracking-normal placeholder:font-bold placeholder:text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-brand-500 hover:bg-brand-600 text-white font-extrabold py-3.5 rounded-2xl transition-all shadow-md text-xs tracking-wider uppercase"
                  >
                    Enter Live Arena
                  </button>
                </form>
              )}
            </motion.div>
          )}

          {/* WAITING ROOM / LOBBY SYNC STATE */}
          {status === 'waiting' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center justify-between text-center space-y-6"
            >
              <div>
                <span className="text-[10px] font-black text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
                  {user?.role === 'instructor' ? 'Hosting Session' : 'Connected to Lobby'}
                </span>
                <h2 className="text-5xl font-black mt-4 text-white tracking-widest bg-slate-900 border border-slate-800 px-8 py-3 rounded-3xl inline-block shadow-inner select-all">
                  {roomCode}
                </h2>
                <p className="text-slate-400 text-xs mt-3">Share this code with students to join the classroom quiz.</p>
              </div>

              {/* Connected Users list */}
              <div className="w-full max-w-md bg-slate-950/40 p-6 rounded-2xl border border-slate-850">
                <div className="flex justify-between items-center mb-4 border-b border-slate-850 pb-2">
                  <span className="text-xs font-bold text-slate-400 flex items-center space-x-1.5">
                    <Users className="h-4 w-4 text-brand-400" />
                    <span>Lobby Members</span>
                  </span>
                  <span className="text-xs font-mono font-black text-white bg-slate-900 px-2.5 py-0.5 rounded-md border border-slate-800">
                    {sessionData?.participants?.length || 0} Joined
                  </span>
                </div>
                {sessionData?.participants?.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {sessionData.participants.map((p: any, idx: number) => (
                      <div key={idx} className="flex items-center space-x-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-850 text-left">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                        <span className="text-xs font-semibold text-slate-200 truncate">{p.username}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic py-6">Waiting for participants to connect...</p>
                )}
              </div>

              {/* Host Start controls */}
              {(user?.role === 'instructor' || user?.role === 'admin') && (
                <button
                  onClick={handleHostStartQuiz}
                  disabled={!sessionData?.participants?.length}
                  className="px-8 py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-extrabold rounded-xl transition-all shadow-md text-xs uppercase"
                >
                  Start Live Quiz Now
                </button>
              )}
            </motion.div>
          )}

          {/* ACTIVE QUESTION SCREEN */}
          {status === 'active' && currentQuestion && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col h-full"
            >
              {/* Question metadata / Timer */}
              <div className="flex justify-between items-center mb-6 w-full">
                <span className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
                  Question {currentQuestion.questionIndex + 1}
                </span>

                <div className="flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-1.5 rounded-xl">
                  <Clock className="h-4 w-4 animate-spin-slow" />
                  <span className="text-xs font-mono font-black">{timeRemaining}s left</span>
                </div>
              </div>

              {/* Question Text */}
              <h2 className="text-2xl font-extrabold text-white text-center leading-normal mb-8">
                {currentQuestion.questionText}
              </h2>

              {/* Quiz option buttons */}
              {user?.role === 'student' ? (
                <div className="w-full">
                  {!hasAnswered && timeRemaining > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {currentQuestion.options?.map((opt: string, idx: number) => {
                        const colors = ['bg-rose-600 hover:bg-rose-500', 'bg-blue-600 hover:bg-blue-500', 'bg-amber-600 hover:bg-amber-500', 'bg-emerald-600 hover:bg-emerald-500'];
                        const col = colors[idx % colors.length];
                        const isSelected = selectedAnswers.includes(opt);
                        return (
                          <button
                            key={idx}
                            onClick={() => handleStudentSubmitAnswer(opt)}
                            className={`p-5 rounded-2xl text-left text-white font-extrabold transition-all border-2 text-sm shadow-md flex items-center justify-between ${col} ${isSelected ? 'border-white scale-[1.02] shadow-2xl' : 'border-transparent'}`}
                          >
                            <span>{opt}</span>
                            {isSelected && <CheckCircle className="h-4 w-4" />}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="w-full flex flex-col items-center justify-center space-y-4 py-12">
                      <div className="h-12 w-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-slate-400 text-sm font-medium">Answer submitted. Waiting for other players to finish...</p>
                    </div>
                  )}

                  {/* Multiple Choice manual submit button */}
                  {currentQuestion.questionType === 'multiple-choice' && !hasAnswered && (
                    <button
                      onClick={submitMultipleChoiceAnswers}
                      className="mt-6 w-full py-3 bg-brand-500 text-white font-bold rounded-xl text-xs uppercase"
                    >
                      Confirm Selections
                    </button>
                  )}
                </div>
              ) : (
                /* INSTRUCTOR VIEW during active question */
                <div className="w-full flex flex-col items-center space-y-6">
                  <div className="w-full max-w-md bg-slate-950/40 p-6 rounded-2xl border border-slate-850">
                    <span className="text-xs font-bold text-slate-400">Response Status:</span>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 text-center">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Submissions</p>
                        <p className="text-2xl font-black text-white mt-1">
                          {answersStatus?.answersCount || 0} / {answersStatus?.totalParticipants || 0}
                        </p>
                      </div>
                      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 text-center">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Time Elapsed</p>
                        <p className="text-2xl font-black text-white mt-1">
                          {Math.max(0, (currentQuestion.timeLimit || 30) - timeRemaining)}s
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleHostShowLeaderboard}
                    className="px-8 py-3 bg-brand-500 hover:bg-brand-600 text-white font-extrabold rounded-xl transition-all shadow-md text-xs uppercase"
                  >
                    Lock answers & Show Leaderboard
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* LEADERBOARD BETWEEN QUESTIONS */}
          {status === 'leaderboard' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center space-y-6"
            >
              <div className="text-center space-y-2">
                <Trophy className="h-10 w-10 text-amber-500 mx-auto animate-bounce" />
                <h2 className="text-3xl font-black text-white tracking-tight">Leaderboard Standings</h2>
                <p className="text-slate-400 text-xs">Fastest correct submissions receive extra points.</p>
              </div>

              {/* Leaderboard Table */}
              <div className="w-full max-w-md bg-slate-950/40 p-6 rounded-2xl border border-slate-850 divide-y divide-slate-850">
                {leaderboard.slice(0, 5).map((p: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center space-x-3">
                      <span className={`h-6 w-6 rounded-lg flex items-center justify-center font-bold text-xs ${idx === 0 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' : idx === 1 ? 'bg-slate-300/10 text-slate-350 border border-slate-350/25' : 'bg-slate-900 text-slate-400'}`}>
                        {idx + 1}
                      </span>
                      <span className="text-xs font-extrabold text-slate-200">{p.username}</span>
                    </div>
                    <span className="text-xs font-mono font-black text-brand-400">{p.score} pts</span>
                  </div>
                ))}
              </div>

              {/* Host Next Slide button */}
              {(user?.role === 'instructor' || user?.role === 'admin') && (
                <button
                  onClick={handleHostNextQuestion}
                  className="px-8 py-3 bg-brand-500 hover:bg-brand-600 text-white font-extrabold rounded-xl transition-all shadow-md text-xs uppercase flex items-center space-x-1.5"
                >
                  <span>Next Question</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </motion.div>
          )}

          {/* FINISHED ROOM STATE */}
          {status === 'finished' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full flex flex-col items-center justify-center text-center space-y-6"
            >
              <div className="h-16 w-16 bg-emerald-500/10 rounded-full border-2 border-emerald-500 flex items-center justify-center text-emerald-400 animate-pulse">
                <Award className="h-9 w-9" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white">Quiz Finished!</h2>
                <p className="text-slate-400 text-xs mt-2">Classroom session ended. Scores have been updated.</p>
              </div>

              {/* Final Podium */}
              <div className="w-full max-w-sm bg-slate-950/40 p-6 rounded-2xl border border-slate-850">
                <h3 className="text-xs font-bold text-slate-450 uppercase mb-4 tracking-wider">Podium Standings</h3>
                <div className="space-y-3">
                  {leaderboard.slice(0, 3).map((p: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-900 border border-slate-850">
                      <div className="flex items-center space-x-2">
                        <Sparkles className={`h-4 w-4 ${idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-350' : 'text-amber-600'}`} />
                        <span className="text-xs font-bold text-white">{p.username}</span>
                      </div>
                      <span className="text-xs font-mono font-black text-brand-400">{p.score} pts</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Link
                  to="/dashboard"
                  className="px-6 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 font-bold rounded-xl text-xs transition-all"
                >
                  Return to Syllabus
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
}
