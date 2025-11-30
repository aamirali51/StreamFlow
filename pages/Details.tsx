import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Plus, Clock, Calendar, Star } from 'lucide-react';
import { tmdbService } from '../services/tmdb';
import { MovieDetails } from '../types';
import { BACKDROP_BASE_URL, IMAGE_BASE_URL } from '../constants';
import { STORAGE_KEYS } from '../constants';

export const Details = () => {
  const { type, id } = useParams<{ type: 'movie' | 'tv'; id: string }>();
  const [data, setData] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!type || !id) return;
      setLoading(true);
      const result = await tmdbService.getDetails(type, parseInt(id));
      setData(result);
      
      // Check watchlist
      const watchlist = JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCHLIST) || '[]');
      setIsInWatchlist(watchlist.some((item: any) => item.id === parseInt(id)));
      
      setLoading(false);
    };

    fetchDetails();
  }, [type, id]);

  const toggleWatchlist = () => {
    if (!data) return;
    const watchlist = JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCHLIST) || '[]');
    let newWatchlist;
    
    if (isInWatchlist) {
      newWatchlist = watchlist.filter((item: any) => item.id !== data.id);
    } else {
      newWatchlist = [...watchlist, { 
        id: data.id, 
        title: data.title || data.name, 
        poster_path: data.poster_path, 
        media_type: data.media_type,
        vote_average: data.vote_average 
      }];
    }
    
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(newWatchlist));
    setIsInWatchlist(!isInWatchlist);
  };

  if (loading) {
     return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return <div className="text-center mt-20">Content not found.</div>;

  const title = data.title || data.name;
  const releaseYear = (data.release_date || data.first_air_date || '').split('-')[0];
  const runtime = data.runtime ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m` : null;

  return (
    <div className="min-h-screen pb-10">
      {/* Backdrop */}
      <div className="relative h-[50vh] md:h-[70vh]">
        <div className="absolute inset-0">
          <img
            src={`${BACKDROP_BASE_URL}${data.backdrop_path}`}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 w-full container mx-auto px-4 pb-10 flex flex-col md:flex-row gap-8 items-end">
          {/* Poster (Hidden on mobile usually, or small) */}
          <div className="hidden md:block w-48 lg:w-64 rounded-lg overflow-hidden shadow-2xl border-4 border-secondary flex-shrink-0">
             <img src={`${IMAGE_BASE_URL}${data.poster_path}`} alt={title} className="w-full" />
          </div>

          <div className="flex-1 text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-slate-300 mb-6">
              <span className="flex items-center gap-1 text-yellow-400">
                <Star size={16} fill="currentColor" /> {data.vote_average.toFixed(1)}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={16} /> {releaseYear}
              </span>
              {runtime && (
                <span className="flex items-center gap-1">
                  <Clock size={16} /> {runtime}
                </span>
              )}
              {data.number_of_seasons && (
                <span>{data.number_of_seasons} Seasons</span>
              )}
            </div>

            <div className="flex gap-2 mb-6">
              {data.genres.map(g => (
                <span key={g.id} className="bg-white/10 px-3 py-1 rounded-full text-xs hover:bg-white/20 transition">
                  {g.name}
                </span>
              ))}
            </div>

            <p className="text-slate-200 text-lg leading-relaxed max-w-3xl mb-8">
              {data.overview}
            </p>

            <div className="flex gap-4">
              <Link
                to={`/${type}/${id}/watch`}
                className="flex items-center gap-2 bg-highlight hover:bg-red-600 text-white px-8 py-3 rounded-lg font-bold transition-transform hover:scale-105"
              >
                <Play fill="currentColor" size={20} />
                Watch Now
              </Link>
              <button
                onClick={toggleWatchlist}
                className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold transition-colors border ${isInWatchlist ? 'bg-green-600 border-green-600 text-white' : 'bg-transparent border-slate-400 text-slate-200 hover:bg-white/10'}`}
              >
                {isInWatchlist ? (
                    <>Added to List</>
                ) : (
                    <><Plus size={20} /> Watchlist</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cast Section */}
      <div className="container mx-auto px-4 mt-12">
        <h2 className="text-2xl font-bold mb-6">Top Cast</h2>
        <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
          {data.credits?.cast.slice(0, 10).map(actor => (
            <div key={actor.id} className="w-32 flex-shrink-0">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-3 border-2 border-secondary bg-secondary">
                {actor.profile_path ? (
                  <img src={`${IMAGE_BASE_URL}${actor.profile_path}`} alt={actor.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">No Image</div>
                )}
              </div>
              <p className="font-semibold text-center text-sm truncate">{actor.name}</p>
              <p className="text-xs text-center text-slate-400 truncate">{actor.character}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};