import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import WebTorrent from 'webtorrent';
import mime from 'mime-types';
import pump from 'pump';
import { range } from 'express/lib/request.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const TMDB_API_KEY = process.env.TMDB_API_KEY; 
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

app.use(cors());
app.use(express.json());

// ==========================================
// WebTorrent Configuration (Aggressive Optimization)
// ==========================================
const client = new WebTorrent({
  maxConns: 500,              // 5x standard limit
  dht: {
    maxTables: 10000,
    concurrency: 16,
    bootstrap_interval: 30000
  },
  tracker: {
    getAnnounceOpts: () => ({ numwant: 500, compact: 1, no_peer_id: 1 }),
    wrtc: false // Disable WebRTC for node performance
  },
  webSeeds: true,
  utp: true,
  lsd: true,
  natUpnp: true,
  natPmp: true,
  uploadLimit: -1,
  downloadLimit: -1,
});

const TRACKERS = [
  "udp://tracker.opentrackr.org:1337/announce",
  "udp://open.tracker.cl:1337/announce",
  "udp://p4p.arenabg.com:1337/announce",
  "udp://tracker.torrent.eu.org:451/announce",
  "udp://tracker.dler.org:6969/announce",
  "udp://open.stealth.si:80/announce",
  "https://opentracker.i2p.rocks/announce",
  "udp://tracker.internetwarriors.net:1337/announce"
];

// Activity tracking for cleanup
const torrentActivity = new Map(); // infoHash -> lastAccessedTime

const touchTorrent = (infoHash) => {
  torrentActivity.set(infoHash, Date.now());
};

// Auto-Cleanup Interval (Every 10 mins)
setInterval(() => {
  const now = Date.now();
  const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 mins

  for (const [infoHash, lastActive] of torrentActivity.entries()) {
    if (now - lastActive > IDLE_TIMEOUT) {
      console.log(`[Cleanup] Removing idle torrent: ${infoHash}`);
      client.remove(infoHash, { destroyStore: true }, (err) => {
         if (!err) torrentActivity.delete(infoHash);
      });
    }
  }
}, 10 * 60 * 1000);


// ==========================================
// Torrent API Endpoints
// ==========================================

// 3.1 Add/Get Torrent Metadata
app.get('/api/torrents/metadata', (req, res) => {
  const { magnet } = req.query;
  if (!magnet) return res.status(400).json({ error: "Magnet link required" });

  // Handle existing
  let torrent = client.get(magnet);
  if (torrent && torrent.metadata) {
    touchTorrent(torrent.infoHash);
    return respondMetadata(torrent, res);
  }

  // Add new
  try {
    torrent = client.add(magnet, { announce: TRACKERS, path: './temp_downloads' }); // Use temp path
    
    const timeout = setTimeout(() => {
       if (!res.headersSent) {
         res.status(504).json({ error: "Timeout waiting for metadata" });
       }
    }, 20000); // 20s timeout

    torrent.on('metadata', () => {
      clearTimeout(timeout);
      touchTorrent(torrent.infoHash);
      // CRITICAL: Deselect all files to prevent auto-download
      torrent.deselect(0, torrent.pieces.length - 1, false); 
      respondMetadata(torrent, res);
    });

    torrent.on('error', (err) => {
        console.error('Torrent error:', err);
        if(!res.headersSent) res.status(500).json({ error: err.message });
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function respondMetadata(torrent, res) {
  const files = torrent.files.map((file, index) => ({
    name: file.name,
    index,
    size: file.length,
    path: file.path,
    type: mime.lookup(file.name) || 'application/octet-stream'
  }));

  // Filter for video and subs
  const videoFiles = files.filter(f => f.type.startsWith('video/'));
  const subtitleFiles = files.filter(f => ['text/vtt', 'application/x-subrip', 'text/x-ass'].includes(f.type) || f.name.endsWith('.srt') || f.name.endsWith('.vtt'));

  res.json({
    infoHash: torrent.infoHash,
    name: torrent.name,
    files: videoFiles,
    subtitles: subtitleFiles
  });
}

// 3.2 Stream Video File
app.get('/api/torrents/stream/:infoHash/:fileIndex', (req, res) => {
  const { infoHash, fileIndex } = req.params;
  const torrent = client.get(infoHash);
  
  if (!torrent) return res.status(404).json({ error: "Torrent not found or expired" });
  touchTorrent(infoHash);

  const file = torrent.files[parseInt(fileIndex)];
  if (!file) return res.status(404).json({ error: "File not found" });

  // Exclusive Selection
  torrent.files.forEach(f => f.deselect());
  file.select();

  const rangeHeader = req.headers.range;
  const fileSize = file.length;

  if (rangeHeader) {
    // Parse Range
    const parts = rangeHeader.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;

    // Smart Buffering Strategy
    const startPiece = Math.floor(start / torrent.pieceLength);
    const endPiece = Math.floor(end / torrent.pieceLength);
    
    // Phase 1: Instant Start (Critical priority for first 20MB of request)
    const criticalEnd = Math.min(endPiece, startPiece + Math.ceil((20 * 1024 * 1024) / torrent.pieceLength));
    torrent.critical(startPiece, criticalEnd);

    // Phase 2: Smooth Playback (High priority for next 50MB)
    // Webtorrent handles read stream prioritization, but we can hint
    
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': mime.lookup(file.name) || 'video/mp4',
    };
    
    res.writeHead(206, head);
    const stream = file.createReadStream({ start, end });
    pump(stream, res);

  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': mime.lookup(file.name) || 'video/mp4',
    };
    res.writeHead(200, head);
    const stream = file.createReadStream();
    pump(stream, res);
  }
});

// 3.3 Subtitle Handling
app.get('/api/torrents/subtitles/:infoHash/:fileIndex', (req, res) => {
    const { infoHash, fileIndex } = req.params;
    const torrent = client.get(infoHash);
    if (!torrent) return res.status(404).json({ error: "Torrent not found" });
    
    const file = torrent.files[parseInt(fileIndex)];
    if (!file) return res.status(404).json({ error: "File not found" });

    // Force download of whole subtitle file
    file.select();
    
    // Simple buffer collection
    const stream = file.createReadStream();
    const chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        let content = buffer.toString('utf-8');
        
        // Convert to WebVTT if necessary
        if (file.name.endsWith('.srt')) {
            content = 'WEBVTT\n\n' + content
                .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2')
                .replace(/\{\\([ibu])\}/g, '</$1>')
                .replace(/\{\\([ibu])1\}/g, '<$1>')
                .replace(/\{([ibu])\}/g, '<$1>');
        }
        
        res.setHeader('Content-Type', 'text/vtt');
        res.send(content);
    });
    stream.on('error', (err) => res.status(500).send(err.message));
});

// 3.4 Stats
app.get('/api/torrents/stats/:infoHash', (req, res) => {
    const torrent = client.get(req.params.infoHash);
    if (!torrent) return res.status(404).json({ error: "Torrent not found" });
    
    res.json({
        progress: torrent.progress,
        downloadSpeed: torrent.downloadSpeed,
        uploadSpeed: torrent.uploadSpeed,
        numPeers: torrent.numPeers,
        timeRemaining: torrent.timeRemaining,
        downloaded: torrent.downloaded,
        length: torrent.length
    });
});


// ==========================================
// Existing TMDB Proxy Logic
// ==========================================

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
