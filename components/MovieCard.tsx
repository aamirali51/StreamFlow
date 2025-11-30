import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Movie } from '../types';
import { IMAGE_BASE_URL } from '../constants';

interface MovieCardProps {
  movie: Movie;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const title = movie.title || movie.name || 'Untitled';
  const releaseDate = movie.release_date || movie.first_air_date || '';
  const year = releaseDate.split('-')[0];
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'NR';

  return (
    <Link 
      to={`/${movie.media_type}/${movie.id}`} 
      className="group relative block rounded-lg overflow-hidden bg-secondary transition-transform hover:scale-105 hover:z-10 focus:outline-none focus:ring-2 focus:ring-accent"
    >
      <div className="aspect-[2/3] w-full bg-slate-800 relative">
        {movie.poster_path ? (
          <img
            src={`${IMAGE_BASE_URL}${movie.poster_path}`}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-80"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            No Image
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black/70 px-1.5 py-0.5 rounded text-xs font-bold text-yellow-400 flex items-center gap-1">
          <Star size={10} fill="currentColor" />
          {rating}
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm truncate text-white group-hover:text-accent">
          {title}
        </h3>
        <p className="text-xs text-slate-400 mt-1 flex justify-between">
          <span>{year}</span>
          <span className="uppercase border border-slate-600 px-1 rounded-[2px] text-[10px]">
            {movie.media_type}
          </span>
        </p>
      </div>
    </Link>
  );
};