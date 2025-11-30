// NOTE: In a real app, API Key should come from env or proxy
// For this demo, we allow the user to input it in the UI or fallback to the proxy
export const API_BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
export const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

// Default API Key provided by user
export const DEFAULT_API_KEY = '4bca5d76e0a759b19eb5df80fbd9492c';

// If running locally with server.js
export const PROXY_BASE_URL = 'http://localhost:3001/api/tmdb';

export const STORAGE_KEYS = {
  WATCHLIST: 'streamflow_watchlist',
  HISTORY: 'streamflow_history',
  SETTINGS: 'streamflow_settings',
  API_KEY: 'streamflow_tmdb_key'
};

export const GENRES = {
  MOVIE: [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 18, name: "Drama" },
    { id: 27, name: "Horror" },
    { id: 878, name: "Sci-Fi" },
  ],
  TV: [
    { id: 10759, name: "Action & Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 18, name: "Drama" },
    { id: 10765, name: "Sci-Fi & Fantasy" },
  ]
};