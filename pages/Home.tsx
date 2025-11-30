import React, { useEffect, useState } from 'react';
import { Hero } from '../components/Hero';
import { MovieCard } from '../components/MovieCard';
import { tmdbService } from '../services/tmdb';
import { Movie } from '../types';

export const Home = () => {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [popularTV, setPopularTV] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [trend, popMov, popTV] = await Promise.all([
        tmdbService.getTrending('movie', 'day'),
        tmdbService.getPopular('movie'),
        tmdbService.getPopular('tv')
      ]);
      setTrending(trend);
      setPopularMovies(popMov);
      setPopularTV(popTV);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const featured = trending.length > 0 ? trending[0] : null;

  return (
    <div className="pb-20">
      <Hero movie={featured} />
      
      <section className="container mx-auto px-4 mt-8">
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-white border-l-4 border-highlight pl-3">Trending Now</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {trending.slice(1, 11).map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 mt-12">
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-white border-l-4 border-accent pl-3">Popular Movies</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {popularMovies.slice(0, 10).map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 mt-12">
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-white border-l-4 border-green-500 pl-3">Hit TV Shows</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {popularTV.slice(0, 10).map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>
    </div>
  );
};