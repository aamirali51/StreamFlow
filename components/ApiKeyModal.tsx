import React, { useState, useEffect } from 'react';
import { Key, Save } from 'lucide-react';
import { STORAGE_KEYS, DEFAULT_API_KEY } from '../constants';

export const ApiKeyModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const key = localStorage.getItem(STORAGE_KEYS.API_KEY);
    // If no key in storage AND no default key provided, show modal
    if (!key && !DEFAULT_API_KEY) {
        setIsOpen(true);
    }
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
        localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey.trim());
        setIsOpen(false);
        window.location.reload(); // Reload to retry fetches
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-secondary p-6 rounded-lg max-w-md w-full shadow-2xl border border-white/10 animate-fade-in">
        <div className="flex items-center gap-3 mb-4 text-highlight">
            <Key size={24} />
            <h2 className="text-xl font-bold text-white">TMDB API Key Required</h2>
        </div>
        <p className="text-slate-300 mb-4 text-sm">
            To use this demo, you need a free TMDB API Key. 
            This is stored locally in your browser.
        </p>
        <ol className="list-decimal list-inside text-xs text-slate-400 mb-6 space-y-1">
            <li>Go to <a href="https://www.themoviedb.org/signup" target="_blank" rel="noreferrer" className="text-accent hover:underline">themoviedb.org</a> and sign up.</li>
            <li>Go to Settings {'>'} API.</li>
            <li>Copy your API Key (v3 auth) and paste it below.</li>
        </ol>
        
        <input 
            type="text" 
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter TMDB API Key"
            className="w-full bg-primary border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-accent mb-4"
        />
        
        <button 
            onClick={handleSave}
            disabled={!apiKey.trim()}
            className="w-full bg-accent hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
            <Save size={18} />
            Save & Reload
        </button>
      </div>
    </div>
  );
};