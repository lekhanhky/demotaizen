import axios from 'axios';
import { YOUTUBE_CONFIG } from '../config/youtube';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

// Cache uploads playlist ID
let cachedUploadsPlaylistId = null;

export const youtubeService = {
  // Lấy Uploads Playlist ID từ Channel
  async getUploadsPlaylistId() {
    // Sử dụng cache nếu đã có
    if (cachedUploadsPlaylistId) {
      return cachedUploadsPlaylistId;
    }

    try {
      const response = await axios.get(`${YOUTUBE_API_BASE}/channels`, {
        params: {
          key: YOUTUBE_CONFIG.API_KEY,
          id: YOUTUBE_CONFIG.CHANNEL_ID,
          part: 'contentDetails',
        },
      });

      cachedUploadsPlaylistId = response.data.items[0]?.contentDetails?.relatedPlaylists?.uploads;
      console.log('Uploads Playlist ID:', cachedUploadsPlaylistId);
      return cachedUploadsPlaylistId;
    } catch (error) {
      console.error('Error fetching uploads playlist:', error);
      throw error;
    }
  },

  // Lấy danh sách video từ kênh (sử dụng playlistItems thay vì search)
  async getChannelVideos(pageToken = null) {
    try {
      // Lấy uploads playlist ID
      const uploadsPlaylistId = await this.getUploadsPlaylistId();
      
      if (!uploadsPlaylistId) {
        throw new Error('Không tìm thấy uploads playlist');
      }

      // Lấy videos từ playlist
      const response = await axios.get(`${YOUTUBE_API_BASE}/playlistItems`, {
        params: {
          key: YOUTUBE_CONFIG.API_KEY,
          playlistId: uploadsPlaylistId,
          part: 'snippet,contentDetails',
          maxResults: YOUTUBE_CONFIG.MAX_RESULTS,
          pageToken: pageToken,
        },
      });

      console.log('YouTube API Response:', {
        totalResults: response.data.pageInfo.totalResults,
        resultsPerPage: response.data.pageInfo.resultsPerPage,
        itemsCount: response.data.items.length,
        hasNextPage: !!response.data.nextPageToken,
        pageToken: pageToken || 'first page',
      });

      // Transform data để giống format của search API
      const transformedItems = response.data.items.map(item => ({
        id: {
          videoId: item.contentDetails.videoId,
        },
        snippet: item.snippet,
      }));

      return {
        videos: transformedItems,
        nextPageToken: response.data.nextPageToken,
        totalResults: response.data.pageInfo.totalResults,
      };
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },

  // Lấy thông tin chi tiết video (views, likes, duration)
  async getVideoDetails(videoIds) {
    try {
      const response = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
        params: {
          key: YOUTUBE_CONFIG.API_KEY,
          id: videoIds.join(','),
          part: 'statistics,contentDetails',
        },
      });

      return response.data.items;
    } catch (error) {
      console.error('Error fetching video details:', error);
      throw error;
    }
  },

  // Lấy thông tin kênh
  async getChannelInfo() {
    try {
      const response = await axios.get(`${YOUTUBE_API_BASE}/channels`, {
        params: {
          key: YOUTUBE_CONFIG.API_KEY,
          id: YOUTUBE_CONFIG.CHANNEL_ID,
          part: 'snippet,statistics',
        },
      });

      return response.data.items[0];
    } catch (error) {
      console.error('Error fetching channel info:', error);
      throw error;
    }
  },

  // Format số lượt xem
  formatViewCount(count) {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  },

  // Format thời lượng video
  formatDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');

    if (hours) {
      return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    }
    return `${minutes || '0'}:${seconds.padStart(2, '0')}`;
  },
};
