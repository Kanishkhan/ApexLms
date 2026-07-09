import React from 'react';
import { Play } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  onEnded?: () => void;
}

export default function VideoPlayer({ url, onEnded }: VideoPlayerProps) {
  const getFullUrl = (videoUrl: string) => {
    if (!videoUrl) return '';
    if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
      return videoUrl;
    }
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    const baseUrl = apiUrl.replace('/api/v1', '');
    const cleanUrl = videoUrl.startsWith('/') ? videoUrl : `/${videoUrl}`;
    return `${baseUrl}${cleanUrl}`;
  };

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-xl group">
      <video
        src={getFullUrl(url)}
        controls
        onEnded={onEnded}
        className="w-full h-full object-cover"
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
