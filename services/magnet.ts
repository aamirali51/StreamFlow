import axios from 'axios';
import { TorrentMetadata, TorrentStats } from '../types';

// Detect if running locally or not for the API URL
const API_URL = 'http://localhost:3001/api/torrents';

export const magnetService = {
  getMetadata: async (magnet: string): Promise<TorrentMetadata | null> => {
    try {
      const response = await axios.get(`${API_URL}/metadata`, {
        params: { magnet },
        timeout: 25000 // Slightly longer than backend timeout
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching magnet metadata:', error);
      return null;
    }
  },

  getStats: async (infoHash: string): Promise<TorrentStats | null> => {
    try {
      const response = await axios.get(`${API_URL}/stats/${infoHash}`);
      return response.data;
    } catch (error) {
      return null;
    }
  },

  getStreamUrl: (infoHash: string, fileIndex: number) => {
    return `${API_URL}/stream/${infoHash}/${fileIndex}`;
  },

  getSubtitleUrl: (infoHash: string, fileIndex: number) => {
    return `${API_URL}/subtitles/${infoHash}/${fileIndex}`;
  }
};