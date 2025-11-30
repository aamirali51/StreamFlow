import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const TMDB_API_KEY = process.env.TMDB_API_KEY; // User must set this in .env
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

app.use(cors());
app.use(express.json());

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 3600 * 1000; // 1 hour

const getCachedData = (key) => {
  if (cache.has(key)) {
    const { data, timestamp } = cache.get(key);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
    cache.delete(key);
  }
  return null;
};

const setCachedData = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Proxy Middleware for TMDB
app.get('/api/tmdb/*', async (req, res) => {
  if (!TMDB_API_KEY) {
    return res.status(500).json({ error: 'Server missing TMDB_API_KEY' });
  }

  const endpoint = req.params[0];
  const queryParams = new URLSearchParams(req.query).toString();
  const url = `${TMDB_BASE_URL}/${endpoint}?api_key=${TMDB_API_KEY}&${queryParams}`;
  
  const cached = getCachedData(url);
  if (cached) {
    return res.json(cached);
  }

  try {
    const response = await axios.get(url);
    setCachedData(url, response.data);
    res.json(response.data);
  } catch (error) {
    console.error('TMDB Error:', error.message);
    res.status(error.response?.status || 500).json({ error: 'Failed to fetch from TMDB' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});