import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MovieCard } from '../components/MovieCard';
import { tmdbService } from '../services/tmdb';
import { Movie } from '../types';

export const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const doSearch = async () => {
      if (!query) return;
      setLoading(true);
      const data = await tmdbService.search(query);
      // Filter out people, only keep movies/tv
      const filtered = data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');
      setResults(filtered);
      setLoading(false);
    };

    doSearch();
  }, [query]);

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Results for "{query}"</h2>
      
      {loading ? (
        <div className="flex justify-center mt-20">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {results.map(item => (
            <MovieCard key={item.id} movie={item} />
          ))}
        </div>
      ) : (
        <div className="text-center text-slate-400 mt-20">
          No results found. Try a different term.
        </div>
      )}
    </div>
  );
};