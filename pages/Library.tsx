import React, { useEffect, useState } from 'react';
import { MovieCard } from '../components/MovieCard';
import { Movie } from '../types';
import { STORAGE_KEYS } from '../constants';
import { Trash2 } from 'lucide-react';

export const Library = () => {
  const [watchlist, setWatchlist] = useState<Movie[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCHLIST) || '[]');
    setWatchlist(saved);
  }, []);

  const removeFromList = (id: number) => {
    const updated = watchlist.filter(m => m.id !== id);
    setWatchlist(updated);
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(updated));
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 border-b border-slate-700 pb-4">My Library</h1>
      
      <h2 className="text-xl font-semibold mb-4 text-accent">Watchlist</h2>
      
      {watchlist.length === 0 ? (
        <div className="bg-secondary p-8 rounded-lg text-center text-slate-400">
          Your watchlist is empty. Add movies and shows to keep track of what you want to watch.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {watchlist.map(movie => (
            <div key={movie.id} className="relative group">
              <MovieCard movie={movie} />
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  removeFromList(movie.id);
                }}
                className="absolute top-2 left-2 bg-red-600 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-red-700"
                title="Remove from watchlist"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};