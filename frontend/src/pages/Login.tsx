import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authService } from '../services/api';
import { authStart, authSuccess, authFailure } from '../store/authSlice';
import { toggleDarkMode } from '../store/uiSlice';
import type { RootState } from '../store';
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  LogIn, 
  UserCheck, 
  Sun, 
  Moon, 
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion } from 'framer-motion';
import { pageVariants } from '../animations/variants';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error } = useSelector((state: RootState) => state.auth);
  const { darkMode } = useSelector((state: RootState) => state.ui);

  const [email, setEmail] = useState(localStorage.getItem('rememberedEmail') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(!!localStorage.getItem('rememberedEmail'));
  const [validationError, setValidationError] = useState('');

  const validateForm = (): boolean => {
    if (!email || !password) {
      setValidationError('Please specify both your email address and password.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError('Please enter a valid email address format.');
      return false;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!validateForm()) {
      return;
    }

    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    dispatch(authStart());
    try {
      const res = await authService.login({ email, password });
      
      // Extract from standardized nested data envelope
      const { user, accessToken } = res.data;

      // Dispatch authSuccess with the correct expected payload structure
      dispatch(authSuccess({ user, accessToken }));

      // Redirect by role
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'instructor') navigate('/instructor');
      else navigate('/dashboard');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Authentication failed. Please verify credentials.';
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
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-3">Welcome Back</h2>
          <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-sans max-w-xs mx-auto">Master advanced system engineering, react telemetry architecture, and secure cloud platforms.</p>
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
              <label className="text-xs font-bold text-slate-650 dark:text-slate-350">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <Mail className="h-4 w-4 shrink-0" />
                </span>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800/80 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-350">Password</label>
                <a href="#" className="text-[10px] text-brand-600 dark:text-brand-400 font-bold hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <Lock className="h-4 w-4 shrink-0" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800/80 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none dark:text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-4.5 w-4.5 shrink-0" />
                  ) : (
                    <Eye className="h-4.5 w-4.5 shrink-0" />
                  )}
                </button>
              </div>
                {/* Remember Me Checkbox */}
            <div className="flex items-center text-left py-1">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-350 text-brand-600 focus:ring-brand-500 h-3.5 w-3.5"
                />
                <span className="text-[11px] font-bold text-slate-550 dark:text-slate-355">Remember my email</span>
              </label>
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
                  <LogIn className="h-4 w-4 shrink-0" />
                  <span>Sign In to Studio</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-450 px-4">
          <p>
            New to Apex?{' '}
            <Link to="/register" className="text-brand-600 dark:text-brand-450 hover:underline font-bold">
              Register free
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
