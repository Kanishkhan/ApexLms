import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      <Navbar />
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>
      
      {/* Premium minimal footer */}
      <footer className="border-t border-slate-200/50 dark:border-slate-800/50 py-8 px-4 lg:px-8 mt-auto glass">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-slate-400 dark:text-slate-500 text-xs">
          <p className="font-sans">
            &copy; {new Date().getFullYear()} Apex LMS Platform. Built for Enterprise-Scale Learning.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0 font-sans">
            <a href="#" className="hover:text-brand-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-brand-500 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-brand-500 transition-colors">Developer API</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
