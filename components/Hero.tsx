import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Info } from 'lucide-react';
import { Movie } from '../types';
import { BACKDROP_BASE_URL } from '../constants';

interface HeroProps {
  movie: Movie | null;
}

export const Hero: React.FC<HeroProps> = ({ movie }) => {
  if (!movie) return <div className="h-[60vh] bg-secondary animate-pulse" />;

  const title = movie.title || movie.name;
  
  return (
    <div className="relative h-[60vh] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={`${BACKDROP_BASE_URL}${movie.backdrop_path}`}
          alt={title}
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 pb-12 flex flex-col items-start gap-4 max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
          {title}
        </h1>
        <p className="text-slate-200 line-clamp-3 md:line-clamp-2 text-sm md:text-base drop-shadow-md max-w-xl">
          {movie.overview}
        </p>
        
        <div className="flex items-center gap-4 mt-4">
          <Link
            to={`/${movie.media_type}/${movie.id}/watch`}
            className="flex items-center gap-2 bg-highlight hover:bg-red-600 text-white px-6 py-3 rounded-md font-bold transition-colors"
          >
            <Play size={20} fill="currentColor" />
            Watch Now
          </Link>
          <Link
            to={`/${movie.media_type}/${movie.id}`}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-md font-bold transition-colors"
          >
            <Info size={20} />
            More Info
          </Link>
        </div>
      </div>
    </div>
  );
};