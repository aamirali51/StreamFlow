import React, { useEffect, useState } from 'react';
import { tmdbService } from '../services/tmdb';
import { Movie } from '../types';
import { MovieCard } from '../components/MovieCard';
import { GENRES } from '../constants';

export const GenrePage = ({ type }: { type: 'movie' | 'tv' }) => {
  const [selectedGenre, setSelectedGenre] = useState<number>(type === 'movie' ? 28 : 10759); // Default Action
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  const genres = type === 'movie' ? GENRES.MOVIE : GENRES.TV;

  useEffect(() => {
    const fetchGenre = async () => {
        setLoading(true);
        const results = await tmdbService.getByGenre(type, selectedGenre);
        setMovies(results);
        setLoading(false);
    };
    fetchGenre();
  }, [type, selectedGenre]);

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold capitalize">{type === 'movie' ? 'Movies' : 'TV Shows'}</h1>
        
        <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar md:pb-0">
          {genres.map(g => (
            <button
              key={g.id}
              onClick={() => setSelectedGenre(g.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedGenre === g.id ? 'bg-accent text-white' : 'bg-secondary text-slate-300 hover:bg-slate-700'}`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center h-64 items-center">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map(m => <MovieCard key={m.id} movie={m} />)}
        </div>
      )}
    </div>
  );
}