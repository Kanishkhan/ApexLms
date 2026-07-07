import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { logoutSuccess } from '../store/authSlice';
import { toggleDarkMode } from '../store/uiSlice';
import { authService } from '../services/api';
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
  Users,
  Settings,
  PlusCircle,
  ClipboardList,
  Compass,
  Bookmark,
  Award,
  Flame,
  Timer
} from 'lucide-react';

interface SidebarItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { darkMode } = useSelector((state: RootState) => state.ui);
  
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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

  // Define sidebar lists based on user role
  const getSidebarItems = (): SidebarItem[] => {
    if (!user) return [];

    switch (user.role) {
      case 'admin':
        return [
          { label: 'Admin Overview', path: '/admin', icon: LayoutDashboard },
          { label: 'Platform Users', path: '/admin/users', icon: Users },
          { label: 'Lo-Fi Focus Space', path: '/dashboard/focus', icon: Timer },
          { label: 'Course Catalog', path: '/courses', icon: BookOpen },
        ];
      case 'instructor':
        return [
          { label: 'Studio Analytics', path: '/instructor', icon: LayoutDashboard },
          { label: 'My Courses Manager', path: '/instructor/courses', icon: ClipboardList },
          { label: 'Create Course', path: '/instructor/courses/new', icon: PlusCircle },
          { label: 'Lo-Fi Focus Space', path: '/dashboard/focus', icon: Timer },
          { label: 'Course Catalog', path: '/courses', icon: BookOpen },
        ];
      case 'student':
      default:
        return [
          { label: 'Dashboard Hub', path: '/dashboard', icon: LayoutDashboard },
          { label: 'Enrolled Courses', path: '/dashboard/enrolled', icon: Award },
          { label: 'Lo-Fi Focus Space', path: '/dashboard/focus', icon: Timer },
          { label: 'Browse Catalog', path: '/courses', icon: Compass },
          { label: 'My Profile Settings', path: '/profile', icon: UserIcon },
        ];
    }
  };

  const menuItems = getSidebarItems();

  const SidebarContent = () => (
    <div className="h-full flex flex-col justify-between py-6 px-4 font-sans">
      <div className="space-y-6">
        {/* Brand Head */}
        <div className="flex items-center space-x-2.5 px-3">
          <GraduationCap className="h-7 w-7 text-brand-500" />
          <span className="font-extrabold text-lg tracking-tight text-slate-800 dark:text-white">
            Apex<span className="text-brand-500 font-semibold">LMS</span>
          </span>
        </div>

        {/* User Card */}
        {user && (
          <div className="p-3.5 rounded-2xl glass border border-slate-200/40 dark:border-slate-800/40 flex items-center space-x-3 shadow-sm">
            <img 
              src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} 
              alt={user.name} 
              className="h-10 w-10 rounded-full border border-slate-100 dark:border-slate-800 object-cover"
            />
            <div className="overflow-hidden">
              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{user.name}</h4>
              <p className="text-[10px] text-slate-400 capitalize truncate">{user.role} role</p>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-4">
        {/* Toggle Theme / Logout */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4">
          <button 
            onClick={() => dispatch(toggleDarkMode())}
            className="flex items-center space-x-2.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            {darkMode ? (
              <>
                <Sun className="h-4 w-4" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
          
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-1.5 text-xs font-medium text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Desktop Left Drawer Panel */}
      <aside className="hidden md:block w-64 border-r border-slate-200/50 dark:border-slate-800/50 h-screen sticky top-0 bg-white dark:bg-slate-950 z-40 transition-colors">
        <SidebarContent />
      </aside>

      {/* Main Right Area */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="md:hidden glass border-b border-slate-200/50 dark:border-slate-800/50 px-4 py-3 flex items-center justify-between z-30">
          <Link to="/" className="flex items-center space-x-1.5 text-brand-600 dark:text-brand-400 font-extrabold text-lg">
            <GraduationCap className="h-6 w-6 text-brand-500" />
            <span>Apex</span>
          </Link>
          <button 
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {mobileSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </header>

        {/* Mobile Drawer */}
        {mobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            {/* Overlay */}
            <div 
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />
            {/* Sidebar drawer content */}
            <div className="relative w-64 max-w-xs bg-white dark:bg-slate-950 h-full shadow-2xl z-50 border-r border-slate-200 dark:border-slate-850">
              <SidebarContent />
            </div>
          </div>
        )}

        {/* Dynamic Nested Content */}
        <main className="flex-grow p-4 md:p-8 lg:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
