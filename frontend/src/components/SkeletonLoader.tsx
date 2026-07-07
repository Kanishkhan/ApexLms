import React from 'react';

export const CourseCardSkeleton = () => {
  return (
    <div className="rounded-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden bg-white dark:bg-slate-900 animate-pulse">
      {/* Thumbnail image placeholder */}
      <div className="h-44 bg-slate-200 dark:bg-slate-800 w-full" />
      
      {/* Description space */}
      <div className="p-5 space-y-3.5">
        {/* Category tag */}
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
        
        {/* Title */}
        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-11/12" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
        
        {/* Divider */}
        <div className="border-t border-slate-100 dark:border-slate-800/80 my-4" />
        
        {/* Author */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-7 w-7 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-16" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const LessonSkeleton = () => {
  return (
    <div className="rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-4 bg-white dark:bg-slate-900 animate-pulse flex items-center justify-between">
      <div className="flex items-center space-x-3 w-2/3">
        <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="space-y-2 w-full">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
        </div>
      </div>
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-16" />
    </div>
  );
};

export const DashboardStatsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3].map((idx) => (
        <div key={idx} className="rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6 bg-white dark:bg-slate-900 space-y-3">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-full" />
          </div>
          <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
};
