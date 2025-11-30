import React, { useState, useEffect, useRef } from 'react';
import { Magnet, Play, FileVideo, Captions, AlertTriangle } from 'lucide-react';
import { magnetService } from '../services/magnet';
import { TorrentMetadata, TorrentStats } from '../types';

export const MagnetPlayer = () => {
  const [magnetInput, setMagnetInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<TorrentMetadata | null>(null);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null);
  const [stats, setStats] = useState<TorrentStats | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Poll for stats when playing
  useEffect(() => {
    if (!metadata || selectedFileIndex === null) return;

    const interval = setInterval(async () => {
      const s = await magnetService.getStats(metadata.infoHash);
      if (s) setStats(s);
    }, 1000);

    return () => clearInterval(interval);
  }, [metadata, selectedFileIndex]);

  const handleLoadMagnet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!magnetInput.trim()) return;

    setLoading(true);
    setError(null);
    setMetadata(null);
    setSelectedFileIndex(null);
    setStats(null);

    try {
      const data = await magnetService.getMetadata(magnetInput);
      if (data) {
        setMetadata(data);
        // Auto-select first video if only one
        if (data.files.length === 1) {
            setSelectedFileIndex(data.files[0].index);
        }
      } else {
        setError("Failed to retrieve metadata. The torrent might have 0 peers or the backend timed out.");
      }
    } catch (err) {
      setError("An error occurred while loading the magnet.");
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSec: number) => {
      return `${formatBytes(bytesPerSec)}/s`;
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-white flex items-center gap-3">
        <Magnet className="text-highlight" /> Magnet Player <span className="text-xs bg-accent px-2 py-1 rounded text-white">BETA</span>
      </h1>

      {/* Input Section */}
      <form onSubmit={handleLoadMagnet} className="mb-10 relative">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={magnetInput}
            onChange={(e) => setMagnetInput(e.target.value)}
            placeholder="Paste Magnet URI (magnet:?xt=urn:btih:...)"
            className="flex-1 bg-secondary border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent font-mono text-sm"
          />
          <button
            type="submit"
            disabled={loading || !magnetInput}
            className="bg-highlight hover:bg-red-600 text-white px-8 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><Play size={20} /> Load Stream</>
            )}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2 ml-1">
          Requires the local backend server to be running on port 3001.
        </p>
      </form>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg mb-8 flex items-center gap-3">
            <AlertTriangle />
            {error}
        </div>
      )}

      {/* Player Section */}
      {metadata && selectedFileIndex !== null && (
        <div className="mb-12 animate-fade-in">
          <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-2xl relative">
             <video
                ref={videoRef}
                controls
                autoPlay
                className="w-full h-full"
                crossOrigin="anonymous"
             >
                <source 
                    src={magnetService.getStreamUrl(metadata.infoHash, selectedFileIndex)} 
                    type="video/mp4" 
                />
                {metadata.subtitles.map(sub => (
                    <track 
                        key={sub.index}
                        label={sub.name}
                        kind="subtitles"
                        src={magnetService.getSubtitleUrl(metadata.infoHash, sub.index)}
                    />
                ))}
                Your browser does not support the video tag.
             </video>
          </div>
          
          {/* Stats Bar */}
          {stats && (
             <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 bg-secondary p-4 rounded-lg text-sm text-slate-300">
                <div className="flex flex-col">
                    <span className="text-xs text-slate-500 uppercase">Download Speed</span>
                    <span className="font-mono text-green-400">{formatSpeed(stats.downloadSpeed)}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-slate-500 uppercase">Upload Speed</span>
                    <span className="font-mono text-blue-400">{formatSpeed(stats.uploadSpeed)}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-slate-500 uppercase">Peers</span>
                    <span className="font-mono text-white">{stats.numPeers}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-slate-500 uppercase">Progress</span>
                    <span className="font-mono text-yellow-400">{(stats.progress * 100).toFixed(1)}%</span>
                </div>
             </div>
          )}
        </div>
      )}

      {/* File Selection */}
      {metadata && (
        <div className="bg-secondary rounded-lg p-6 border border-white/5 animate-fade-in">
            <h2 className="text-xl font-bold mb-4 border-b border-white/10 pb-2">{metadata.name}</h2>
            
            <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-semibold text-accent mb-2 flex items-center gap-2">
                        <FileVideo size={16} /> Video Files
                    </h3>
                    <div className="space-y-2">
                        {metadata.files.map(file => (
                            <button
                                key={file.index}
                                onClick={() => setSelectedFileIndex(file.index)}
                                className={`w-full text-left p-3 rounded flex items-center justify-between transition-colors ${selectedFileIndex === file.index ? 'bg-accent/20 border border-accent text-white' : 'bg-primary hover:bg-white/5 text-slate-300'}`}
                            >
                                <span className="truncate pr-4">{file.name}</span>
                                <span className="text-xs font-mono whitespace-nowrap opacity-60">{formatBytes(file.size)}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {metadata.subtitles.length > 0 && (
                     <div>
                        <h3 className="text-sm font-semibold text-yellow-500 mb-2 flex items-center gap-2">
                            <Captions size={16} /> Subtitles (Auto-loaded)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {metadata.subtitles.map(file => (
                                <div key={file.index} className="bg-primary/50 p-2 rounded text-xs text-slate-400 flex items-center gap-2">
                                    <Captions size={12} /> {file.name}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};