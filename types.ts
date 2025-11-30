export interface Movie {
  id: number;
  title: string;
  name?: string; // For TV shows
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string; // For TV shows
  media_type: 'movie' | 'tv';
  genre_ids?: number[];
}

export interface MovieDetails extends Movie {
  genres: { id: number; name: string }[];
  runtime?: number;
  number_of_seasons?: number;
  credits?: {
    cast: CastMember[];
  };
  videos?: {
    results: Video[];
  };
  external_ids?: {
    imdb_id?: string;
  };
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface Video {
  id: string;
  key: string;
  site: string;
  type: string;
}

export interface SearchResult {
  page: number;
  results: Movie[];
  total_pages: number;
}

export enum StreamSource {
  VIDSRC = 'Server 1 (VidSrc)',
  SUPEREMBED = 'Server 2 (MultiEmbed)',
  TWO_EMBED = 'Server 3 (AutoEmbed)',
  NUVIO = 'Server 4 (VidLink)'
}

export interface WatchHistoryItem {
  id: number;
  title: string;
  poster_path: string | null;
  media_type: 'movie' | 'tv';
  timestamp: number;
  progress: number; // 0 to 1
}

export interface TorrentFile {
  name: string;
  index: number;
  size: number;
  path: string;
  type: string;
}

export interface TorrentMetadata {
  infoHash: string;
  name: string;
  files: TorrentFile[];
  subtitles: TorrentFile[];
}

export interface TorrentStats {
  progress: number;
  downloadSpeed: number;
  uploadSpeed: number;
  numPeers: number;
  timeRemaining: number;
  downloaded: number;
  length: number;
}