import axios from 'axios';
import { Movie, MovieDetails, SearchResult } from '../types';
import { PROXY_BASE_URL, API_BASE_URL, STORAGE_KEYS, DEFAULT_API_KEY } from '../constants';

// Simple check to see if we should use proxy or direct
// In a real deployed static app, you might want to force one or the other
const USE_PROXY = false; // Set to true if running server.js
const DIRECT_API_KEY = DEFAULT_API_KEY; // Use the default key provided

const client = axios.create({
  baseURL: USE_PROXY ? PROXY_BASE_URL : API_BASE_URL,
  params: {
    language: 'en-US',
  }
});

// Add interceptor to inject key dynamically
client.interceptors.request.use((config) => {
    if (USE_PROXY) return config;
    
    // Check if key is already in params (from DIRECT_API_KEY if set) or inject it
    if (!config.params) config.params = {};
    
    if (DIRECT_API_KEY) {
        config.params.api_key = DIRECT_API_KEY;
    } else {
        const localKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
        if (localKey) {
            config.params.api_key = localKey;
        }
    }
    return config;
});

// Helper to validate key existence
const hasApiKey = () => {
    if (USE_PROXY) return true;
    return !!(DIRECT_API_KEY || localStorage.getItem(STORAGE_KEYS.API_KEY));
};

export const tmdbService = {
  getTrending: async (mediaType: 'movie' | 'tv' = 'movie', timeWindow: 'day' | 'week' = 'week'): Promise<Movie[]> => {
    try {
      if (!hasApiKey()) throw new Error("Missing API Key");
      const response = await client.get(`/trending/${mediaType}/${timeWindow}`);
      return response.data.results.map((item: any) => ({ ...item, media_type: mediaType }));
    } catch (error) {
      console.error('Error fetching trending:', error);
      return [];
    }
  },

  getPopular: async (mediaType: 'movie' | 'tv' = 'movie'): Promise<Movie[]> => {
    try {
      if (!hasApiKey()) throw new Error("Missing API Key");
      const response = await client.get(`/${mediaType}/popular`);
      return response.data.results.map((item: any) => ({ ...item, media_type: mediaType }));
    } catch (error) {
      console.error('Error fetching popular:', error);
      return [];
    }
  },

  getTopRated: async (mediaType: 'movie' | 'tv' = 'movie'): Promise<Movie[]> => {
    try {
      if (!hasApiKey()) throw new Error("Missing API Key");
      const response = await client.get(`/${mediaType}/top_rated`);
      return response.data.results.map((item: any) => ({ ...item, media_type: mediaType }));
    } catch (error) {
      console.error('Error fetching top rated:', error);
      return [];
    }
  },

  getDetails: async (mediaType: 'movie' | 'tv', id: number): Promise<MovieDetails | null> => {
    try {
      if (!hasApiKey()) throw new Error("Missing API Key");
      const response = await client.get(`/${mediaType}/${id}`, {
        params: { append_to_response: 'credits,videos,external_ids' }
      });
      return { ...response.data, media_type: mediaType };
    } catch (error) {
      console.error('Error fetching details:', error);
      return null;
    }
  },

  search: async (query: string): Promise<SearchResult> => {
    try {
      if (!hasApiKey()) throw new Error("Missing API Key");
      const response = await client.get(`/search/multi`, {
        params: { query, include_adult: false }
      });
      return response.data;
    } catch (error) {
      console.error('Search error:', error);
      return { page: 1, results: [], total_pages: 0 };
    }
  },
  
  getByGenre: async (mediaType: 'movie' | 'tv', genreId: number): Promise<Movie[]> => {
      try {
        if (!hasApiKey()) throw new Error("Missing API Key");
        const response = await client.get(`/discover/${mediaType}`, {
            params: { with_genres: genreId }
        });
        return response.data.results.map((item: any) => ({...item, media_type: mediaType}));
      } catch (error) {
          console.error('Genre fetch error', error);
          return [];
      }
  }
};