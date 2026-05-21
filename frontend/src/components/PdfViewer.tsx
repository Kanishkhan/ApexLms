import React from 'react';
import { FileText, Download, ExternalLink } from 'lucide-react';

interface PdfViewerProps {
  url: string;
  title: string;
}

export default function PdfViewer({ url, title }: PdfViewerProps) {
  return (
    <div className="rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6 md:p-8 bg-white dark:bg-slate-900 shadow-sm flex flex-col items-center justify-center text-center space-y-6 max-w-xl mx-auto">
      <div className="h-16 w-16 bg-brand-50 dark:bg-brand-950/50 rounded-2xl flex items-center justify-center text-brand-600 dark:text-brand-400">
        <FileText className="h-8 w-8" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h3>
        <p className="text-sm text-slate-400 mt-1">This module includes a PDF reading resource. Tap below to preview or download it.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center space-x-2 w-full px-5 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-md shadow-brand-500/10"
        >
          <ExternalLink className="h-4 w-4" />
          <span>Open PDF in Tab</span>
        </a>
        <a
          href={url}
          download
          className="flex items-center justify-center space-x-2 w-full px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-all"
        >
          <Download className="h-4 w-4" />
          <span>Download PDF</span>
        </a>
      </div>

      {/* Embedded Iframe fallback */}
      <div className="w-full h-80 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 mt-4">
        <iframe
          src={`${url}#toolbar=0`}
          title={title}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
