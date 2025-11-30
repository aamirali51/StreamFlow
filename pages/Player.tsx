import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, AlertTriangle, MonitorPlay } from 'lucide-react';
import { StreamSource } from '../types';

export const Player = () => {
  const { type, id } = useParams<{ type: 'movie' | 'tv'; id: string }>();
  const navigate = useNavigate();
  
  // State for TV shows
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  
  // Source State
  const [source, setSource] = useState<StreamSource>(StreamSource.VIDSRC);
  
  const handleGoBack = () => navigate(-1);

  const getSourceUrl = () => {
    if (!id) return '';

    switch (source) {
      case StreamSource.VIDSRC:
        // VidSrc.xyz is generally reliable for TMDB IDs
        return type === 'movie'
          ? `https://vidsrc.xyz/embed/movie/${id}`
          : `https://vidsrc.xyz/embed/tv/${id}/${season}/${episode}`;
          
      case StreamSource.SUPEREMBED:
        // Multiembed.mov supports TMDB ID via 'tmdb=1' param
        return type === 'movie'
          ? `https://multiembed.mov/?video_id=${id}&tmdb=1`
          : `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`;
          
      case StreamSource.TWO_EMBED:
        // AutoEmbed.co is a solid fallback for 2Embed
        return type === 'movie'
          ? `https://autoembed.co/movie/tmdb/${id}`
          : `https://autoembed.co/tv/tmdb/${id}-${season}-${episode}`;

      case StreamSource.NUVIO:
         // VidLink.pro is high quality
         return type === 'movie' 
           ? `https://vidlink.pro/movie/${id}`
           : `https://vidlink.pro/tv/${id}/${season}/${episode}`;
           
      default:
        // Fallback to VidSrc
        return type === 'movie'
          ? `https://vidsrc.xyz/embed/movie/${id}`
          : `https://vidsrc.xyz/embed/tv/${id}/${season}/${episode}`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Player Header */}
      <div className="bg-black/80 p-4 flex items-center justify-between absolute top-0 left-0 w-full z-10 backdrop-blur-sm">
        <button 
          onClick={handleGoBack}
          className="text-white hover:text-accent flex items-center gap-2 transition-colors font-medium"
        >
          <ArrowLeft size={20} /> <span className="hidden sm:inline">Back</span>
        </button>
        
        <div className="flex items-center gap-4">
          {type === 'tv' && (
            <div className="flex items-center gap-2 text-sm bg-slate-900/80 p-1.5 rounded-lg border border-slate-700">
              <div className="flex items-center gap-1">
                <span className="text-slate-400 font-bold px-1">S</span>
                <input 
                  type="number" 
                  min="1" 
                  value={season} 
                  onChange={(e) => setSeason(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-10 bg-slate-800 border border-slate-600 rounded px-1 text-center text-white focus:outline-none focus:border-accent"
                />
              </div>
              <div className="w-px h-4 bg-slate-700"></div>
              <div className="flex items-center gap-1">
                <span className="text-slate-400 font-bold px-1">E</span>
                <input 
                  type="number" 
                  min="1" 
                  value={episode} 
                  onChange={(e) => setEpisode(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-10 bg-slate-800 border border-slate-600 rounded px-1 text-center text-white focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          )}
          
          <div className="relative group">
            <button className="flex items-center gap-2 text-sm bg-accent hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20">
              <Settings size={16} /> 
              <span className="hidden sm:inline">{source}</span>
              <span className="sm:hidden">Source</span>
            </button>
            <div className="absolute right-0 top-full mt-2 w-56 bg-secondary rounded-lg shadow-xl hidden group-hover:block border border-slate-700 overflow-hidden">
              <div className="p-2 bg-slate-900/50 border-b border-slate-700 text-xs text-slate-400 font-medium">
                Select Stream Server
              </div>
              {Object.values(StreamSource).map((src) => (
                <button
                  key={src}
                  onClick={() => setSource(src)}
                  className={`block w-full text-left px-4 py-3 text-sm hover:bg-slate-700 transition-colors flex items-center gap-2 ${source === src ? 'text-accent bg-slate-800/50 font-medium' : 'text-slate-200'}`}
                >
                  <MonitorPlay size={14} className={source === src ? 'opacity-100' : 'opacity-50'} />
                  {src}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Iframe Player */}
      <div className="flex-1 w-full h-full relative bg-black flex items-center justify-center">
        <iframe
          key={`${source}-${id}-${season}-${episode}`} // Force re-render on change
          src={getSourceUrl()}
          className="w-full h-full border-0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          title="Video Player"
          scrolling="no"
        />
      </div>

      <div className="bg-secondary p-3 text-center text-xs text-slate-400 border-t border-slate-700">
        <p className="flex items-center justify-center gap-2 flex-wrap">
          <AlertTriangle size={14} className="text-yellow-500" />
          <span>If the video doesn't load, try switching <strong>Servers</strong> (top right) or disable AdBlocker.</span>
          <span className="hidden sm:inline opacity-50">|</span>
          <span className="opacity-75">This is a demo using third-party embeds.</span>
        </p>
      </div>
    </div>
  );
};