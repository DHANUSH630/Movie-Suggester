import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve static frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
app.use(express.static(rootDir));

// Simple in-memory cache
const cache = new Map();
function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  const { value, ts, ttlMs } = entry;
  if (Date.now() - ts > ttlMs) {
    cache.delete(key);
    return null;
  }
  return value;
}
function setCached(key, value, ttlMs = 1000 * 60 * 10) { // 10 minutes
  cache.set(key, { value, ts: Date.now(), ttlMs });
}

// RapidAPI configuration
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'moviesdatabase.p.rapidapi.com';

if (!RAPIDAPI_KEY) {
  console.warn('Warning: RAPIDAPI_KEY is not set. API routes will fail until configured.');
}

// Fetch helper
async function rapidGet(pathname, searchParams = {}) {
  const url = new URL(`https://${RAPIDAPI_HOST}${pathname}`);
  Object.entries(searchParams).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  });

  const cacheKey = url.toString();
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const res = await fetch(url, {
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': RAPIDAPI_HOST,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`RapidAPI error ${res.status}: ${text}`);
  }
  const data = await res.json();
  setCached(cacheKey, data);
  return data;
}

// Health
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Genres endpoint - using Movies Database API on RapidAPI
// Docs: https://rapidapi.com/SAdrian/api/moviesdatabase
app.get('/api/genres', async (_req, res) => {
  try {
    const data = await rapidGet('/titles/utils/genres');
    // Expected shape: { results: ['Action','Comedy',...]} 
    res.json({ genres: data.results || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch genres', details: String(err) });
  }
});

// Movies by genre endpoint
app.get('/api/movies', async (req, res) => {
  try {
    const { genre, page = 1, limit = 12, minimumRating } = req.query;
    if (!genre) return res.status(400).json({ error: 'genre is required' });

    // Movies Database supports filtering by genre and sorting by rating
    // Endpoint: /titles?genre=<>&page=<>
    const data = await rapidGet('/titles', {
      genre,
      page,
      limit,
      sort: 'rating.desc',
    });

    let items = data.results || [];
    if (minimumRating) {
      const min = Number(minimumRating) || 0;
      items = items.filter((it) => (it?.rating ?? 0) >= min);
    }

    // Normalize response for frontend
    const movies = items.map((it) => {
      const primaryImage = it?.primaryImage;
      const titleText = it?.titleText?.text || it?.title || 'Unknown';
      const releaseYear = it?.releaseYear?.year || it?.year || null;
      const rating = it?.ratingsSummary?.aggregateRating || it?.rating || 0;
      const plot = it?.plot?.plotText?.plainText || '';
      return {
        id: it?.id || it?._id || titleText,
        title: titleText,
        year: releaseYear,
        genre: genre,
        rating: typeof rating === 'number' ? rating : Number(rating) || 0,
        description: plot || 'No description available',
        poster: primaryImage?.url || 'https://via.placeholder.com/300x450?text=No+Image',
      };
    });

    res.json({ movies });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch movies', details: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
