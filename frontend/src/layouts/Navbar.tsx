import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { logoutSuccess } from '../store/authSlice';
import { toggleDarkMode } from '../store/uiSlice';
import { authService, gamificationService } from '../services/api';
import { 
  BookOpen, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  LayoutDashboard, 
  GraduationCap,
  Bell
} from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { darkMode } = useSelector((state: RootState) => state.ui);
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  React.useEffect(() => {
    if (isAuthenticated && user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 15000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);

  const fetchUnreadCount = async () => {
    try {
      const res = await gamificationService.getNotifications();
      const count = res.data.filter((n: any) => !n.isRead).length;
      setUnreadCount(count);
    } catch {
      // Ignore
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(logoutSuccess());
      navigate('/login');
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'instructor') return '/instructor';
    return '/dashboard';
  };

  return (
    <nav className="glass-nav sticky top-0 z-50 w-full px-4 lg:px-8 py-3 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 text-brand-600 dark:text-brand-400 font-extrabold text-xl tracking-tight">
          <GraduationCap className="h-7 w-7 text-brand-500" />
          <span className="font-sans">Apex<span className="text-slate-900 dark:text-slate-100 font-semibold font-sans">LMS</span></span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/courses" className="text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors">
            Explore Courses
          </Link>
          {isAuthenticated && (
            <Link to={getDashboardLink()} className="text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors">
              My Dashboard
            </Link>
          )}
        </div>

        {/* Desktop Right Side Panel */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Dark Mode toggle */}
          <button 
            onClick={() => dispatch(toggleDarkMode())}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {isAuthenticated && user && (
            <Link 
              to="/dashboard"
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
              title="View Alerts Feed"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </Link>
          )}

          {isAuthenticated && user ? (
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <img 
                  src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} 
                  alt={user.name} 
                  className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{user.name.split(' ')[0]}</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl glass shadow-xl border border-slate-200/50 dark:border-slate-800/50 py-2 transition-all duration-200 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/80">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm font-semibold truncate text-slate-700 dark:text-slate-200">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-brand-100 text-brand-800 dark:bg-brand-950/80 dark:text-brand-300">
                      {user.role}
                    </span>
                  </div>
                  
                  <Link 
                    to={getDashboardLink()} 
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>

                  <Link 
                    to="/profile" 
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <UserIcon className="h-4 w-4" />
                    <span>Account Profile</span>
                  </Link>

                  <button 
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-md shadow-brand-500/10">
                Join Free
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex items-center space-x-2 md:hidden">
          <button 
            onClick={() => dispatch(toggleDarkMode())}
            className="p-2 text-slate-500 dark:text-slate-400"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-slate-700 dark:text-slate-300"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden mt-3 pt-3 pb-4 border-t border-slate-100 dark:border-slate-800 flex flex-col space-y-4">
          <Link 
            to="/courses" 
            onClick={() => setMenuOpen(false)}
            className="text-slate-700 dark:text-slate-300 font-medium px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Explore Courses
          </Link>
          {isAuthenticated && (
            <Link 
              to={getDashboardLink()} 
              onClick={() => setMenuOpen(false)}
              className="text-slate-700 dark:text-slate-300 font-medium px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              My Dashboard
            </Link>
          )}

          {isAuthenticated && user ? (
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex flex-col space-y-3">
              <div className="flex items-center space-x-2 px-2">
                <img 
                  src={user.avatarUrl} 
                  alt={user.name} 
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
              </div>
              <Link 
                to="/profile" 
                onClick={() => setMenuOpen(false)}
                className="flex items-center space-x-2 px-2 py-1.5 text-sm text-slate-600 dark:text-slate-400"
              >
                <UserIcon className="h-4 w-4" />
                <span>Account Profile</span>
              </Link>
              <button 
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center space-x-2 px-2 py-1.5 text-sm text-red-600 text-left w-full"
              >
                <LogOut className="h-4 w-4" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <Link 
                to="/login" 
                onClick={() => setMenuOpen(false)}
                className="text-center py-2 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                onClick={() => setMenuOpen(false)}
                className="text-center py-2 text-white bg-brand-600 rounded-xl shadow-md"
              >
                Join Free
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
