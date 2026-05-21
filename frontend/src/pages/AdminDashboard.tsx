import React, { useEffect, useState } from 'react';
import { dashboardService } from '../services/api';
import { 
  ShieldCheck, 
  Users, 
  BookOpen, 
  Search, 
  Star,
  Activity,
  Terminal,
  Server
} from 'lucide-react';
import { motion } from 'framer-motion';
import { pageVariants } from '../animations/variants';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAdminConsole();
  }, []);

  const fetchAdminConsole = async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getAdminDashboard();
      setMetrics(res.data);
    } catch (err) {
      console.error('Failed to load admin telemetry: ', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = metrics?.users?.filter((u: any) => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="space-y-8 font-sans max-w-6xl mx-auto p-6 md:p-8 animate-pulse bg-grid">
        <div className="space-y-2">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-8 font-sans max-w-6xl mx-auto px-4 py-6 md:py-8 bg-grid transition-all duration-300"
    >
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/60 pb-6">
        <div>
          <span className="text-[9px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest bg-brand-500/10 px-2.5 py-0.5 rounded-md">
            Platform Command Center
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight flex items-center space-x-2.5">
            <ShieldCheck className="h-8 w-8 text-brand-500" />
            <span>Admin Platform Console</span>
          </h1>
          <p className="text-xs text-slate-555 dark:text-slate-450 mt-1 font-sans">Review aggregate usage tallies, platform role scopes, and system catalog configurations.</p>
        </div>
        <div className="flex items-center space-x-2 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20">
          <Server className="w-4.5 h-4.5 mr-1 text-emerald-500 animate-pulse" />
          <span>Gateway Online</span>
        </div>
      </div>

      {/* Aggregate Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Platform Users Count', count: metrics?.totalUsers || 0, icon: Users, color: 'text-brand-500 bg-brand-50 dark:bg-brand-950/30 border-brand-500/15' },
          { label: 'Student Accounts', count: metrics?.studentCount || 0, icon: Star, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/15' },
          { label: 'Instructor Registers', count: metrics?.instructorCount || 0, icon: ShieldCheck, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30 border-purple-500/15' },
          { label: 'Catalog Course Nodes', count: metrics?.courseCount || 0, icon: BookOpen, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-500/15' }
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx} 
              className="rounded-3xl border border-slate-200/50 dark:border-slate-800/60 p-5 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md flex items-center justify-between shadow-sm hover:border-brand-500/20 hover:shadow-md transition-all duration-300 group"
            >
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{card.label}</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors">{card.count}</h3>
              </div>
              <div className={`h-11 w-11 rounded-2xl flex items-center justify-center border ${card.color} shrink-0`}>
                <Icon className="h-5.5 w-5.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid for platform logs and users control table */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Table panel */}
        <div className="rounded-[2rem] border border-slate-200/55 dark:border-slate-800/60 p-6 sm:p-8 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/30 dark:border-slate-800/50 pb-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4.5 w-4.5 text-brand-500 shrink-0" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Registered Credentials Telemetry</h2>
            </div>
            
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-450 dark:text-slate-500">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search user name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none dark:text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500 dark:text-slate-400">
              <thead className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-550 border-b border-slate-200/50 dark:border-slate-850">
                <tr>
                  <th className="py-3.5 px-4">User Name</th>
                  <th className="py-3.5 px-4">Email Address</th>
                  <th className="py-3.5 px-4 text-center">Auth Scope Role</th>
                  <th className="py-3.5 px-4 text-right">Created Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {filteredUsers.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/30 transition-colors">
                    <td className="py-4 px-4 font-extrabold text-slate-900 dark:text-white">{item.name}</td>
                    <td className="py-4 px-4 font-medium">{item.email}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wide ${
                        item.role === 'admin' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' :
                        item.role === 'instructor' ? 'bg-brand-500/10 text-brand-600 dark:text-brand-450' : 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                      }`}>
                        {item.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-medium">{new Date(item.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </motion.div>
  );
}
