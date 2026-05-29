import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authStart, authSuccess, authFailure, clearError } from '../store/authSlice';
import { toggleDarkMode } from '../store/uiSlice';
import { authService } from '../services/api';
import type { RootState } from '../store';
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  User, 
  UserCheck, 
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Sun,
  Moon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { pageVariants } from '../animations/variants';

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const { darkMode } = useSelector((state: RootState) => state.ui);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'instructor'>('student');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    dispatch(clearError());

    if (!name || !email || !password) {
      setValidationError('Please fill in all details');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    dispatch(authStart());
    try {
      const res = await authService.register({ name, email, password, role });
      
      // Extract from standardized nested data envelope
      const { user, accessToken } = res.data;

      // Dispatch authSuccess with the correct expected payload structure
      dispatch(authSuccess({ user, accessToken }));
      
      if (role === 'instructor') navigate('/instructor');
      else navigate('/dashboard');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Registration failed. Try a different email.';
      dispatch(authFailure(errMsg));
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300 relative overflow-hidden bg-grid bg-mesh"
    >
      {/* Background glowing decorations */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-brand-500/5 dark:bg-brand-500/10 rounded-full blur-[100px] -z-10 animate-pulse-slow" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500/5 rounded-full blur-[80px] -z-10" />

      <div className="w-full max-w-md space-y-6 z-10 relative">
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center space-x-2 text-brand-650 dark:text-brand-400 font-extrabold text-3xl tracking-tight">
            <GraduationCap className="h-9 w-9 text-brand-500 fill-brand-500/5 shrink-0" />
            <span>Apex<span className="text-slate-900 dark:text-slate-100 font-semibold font-sans">LMS</span></span>
          </Link>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-3">Create Free Account</h2>
          <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-sans max-w-xs mx-auto">Join thousands of software engineers leveling up their system architecture skills today.</p>
        </div>

        {/* Glassmorphic Form Card */}
        <div className="p-6 sm:p-8 rounded-[2.5rem] bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/55 dark:border-slate-800/60 shadow-2xl space-y-6 glow-effect">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Display error messages */}
            {(validationError || error) && (
              <div className="p-3.5 bg-red-500/10 text-red-650 dark:text-red-400 text-xs rounded-xl border border-red-500/20 font-bold flex items-center">
                <ShieldCheck className="h-4.5 w-4.5 mr-2 text-red-500 shrink-0 animate-bounce" />
                <span>{validationError || error}</span>
              </div>
            )}

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-350">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <User className="h-4 w-4 shrink-0" />
                </span>
                <input
                  type="text"
                  placeholder="Sarah Connor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800/80 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-350">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <Mail className="h-4 w-4 shrink-0" />
                </span>
                <input
                  type="email"
                  placeholder="sarah@future.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800/80 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-350">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <Lock className="h-4 w-4 shrink-0" />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800/80 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Premium Role Card Selector */}
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-350 flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-brand-500" />
                <span>Choose Account Role</span>
              </label>
              <div className="grid grid-cols-2 gap-3.5">
                {[
                  { id: 'student', label: 'Student Learner', desc: 'Study and take assessments' },
                  { id: 'instructor', label: 'Instructor Studio', desc: 'Author curriculum drafts' }
                ].map((item) => {
                  const isSelected = role === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setRole(item.id as any)}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm ${
                        isSelected
                          ? 'bg-brand-500/10 border-brand-500 text-brand-700 dark:text-brand-350 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-400 bg-transparent hover:bg-slate-100/50 dark:hover:bg-slate-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <UserCheck className={`h-4 w-4 ${isSelected ? 'text-brand-500' : 'text-slate-450'}`} />
                        <div className={`h-3 w-3 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-300 dark:border-slate-750'
                        }`}>
                          {isSelected && <div className="h-1 w-1 bg-white rounded-full" />}
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-[10px] font-black uppercase tracking-wider leading-none">{item.label}</p>
                        <p className="text-[8px] font-bold text-slate-400 mt-1 leading-normal">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center space-x-2 w-full py-3.5 text-xs font-bold text-white bg-gradient-to-r from-brand-650 to-indigo-650 hover:from-brand-600 hover:to-indigo-600 disabled:bg-brand-500/50 rounded-xl transition-all shadow-md shadow-brand-500/10 hover:-translate-y-0.5"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Free Account</span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-450 px-4">
          <p>
            Have an account?{' '}
            <Link to="/login" className="text-brand-600 dark:text-brand-450 hover:underline font-bold">
              Sign in
            </Link>
          </p>
          
          <button 
            type="button"
            onClick={() => dispatch(toggleDarkMode())}
            className="flex items-center space-x-1.5 font-bold hover:text-brand-500 transition-colors"
          >
            {darkMode ? (
              <>
                <Sun className="h-3.5 w-3.5" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5" />
                <span>Dark</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
