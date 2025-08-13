import { Settings } from "@shared/settings";
import { storage } from "./storage";
import { randomUUID } from "crypto";

export interface SearchResult {
  id: string;
  title: string;
  artist?: string;
  duration?: string;
  thumbnail?: string;
  url: string;
  platform: 'youtube' | 'spotify' | 'instagram';
}

export interface DownloadRequest {
  url: string;
  title?: string;
  platform: 'youtube' | 'spotify' | 'instagram';
  userId: string;
  apiKeyId: string;
}

export class DownloadService {
  async searchSongs(query: string, platform: 'youtube' | 'spotify' | 'all' = 'all'): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    if (platform === 'youtube' || platform === 'all') {
      const youtubeResults = await this.searchYouTube(query);
      results.push(...youtubeResults);
    }

    if (platform === 'spotify' || platform === 'all') {
      const spotifyResults = await this.searchSpotify(query);
      results.push(...spotifyResults);
    }

    return results.slice(0, Settings.MAX_RESULTS_PER_PLATFORM);
  }

  async searchYouTube(query: string): Promise<SearchResult[]> {
    if (!Settings.YOUTUBE_API_KEY) {
      return [];
    }

    try {
      const response = await fetch(
        `${Settings.YOUTUBE_API_URL}/search?part=snippet&type=video&videoCategoryId=10&maxResults=10&q=${encodeURIComponent(query)}&key=${Settings.YOUTUBE_API_KEY}`
      );

      if (!response.ok) {
        console.error('YouTube API error:', response.status);
        return [];
      }

      const data = await response.json();
      
      return data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.default.url,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        platform: 'youtube' as const,
      }));
    } catch (error) {
      console.error('YouTube search error:', error);
      return [];
    }
  }

  async searchSpotify(query: string): Promise<SearchResult[]> {
    if (!Settings.SPOTIFY_CLIENT_ID || !Settings.SPOTIFY_CLIENT_SECRET) {
      return [];
    }

    try {
      // Get Spotify access token
      const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(Settings.SPOTIFY_CLIENT_ID + ':' + Settings.SPOTIFY_CLIENT_SECRET).toString('base64')
        },
        body: 'grant_type=client_credentials'
      });

      if (!tokenResponse.ok) {
        console.error('Spotify token error:', tokenResponse.status);
        return [];
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Search for tracks
      const searchResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!searchResponse.ok) {
        console.error('Spotify search error:', searchResponse.status);
        return [];
      }

      const searchData = await searchResponse.json();

      return searchData.tracks.items.map((track: any) => ({
        id: track.id,
        title: track.name,
        artist: track.artists.map((artist: any) => artist.name).join(', '),
        duration: `${Math.floor(track.duration_ms / 60000)}:${Math.floor((track.duration_ms % 60000) / 1000).toString().padStart(2, '0')}`,
        thumbnail: track.album.images[2]?.url,
        url: track.external_urls.spotify,
        platform: 'spotify' as const,
      }));
    } catch (error) {
      console.error('Spotify search error:', error);
      return [];
    }
  }

  async startDownload(request: DownloadRequest): Promise<string> {
    const downloadId = randomUUID();
    
    // Create download request in database
    const downloadRequest = await storage.createDownloadRequest({
      userId: request.userId,
      apiKeyId: request.apiKeyId,
      url: request.url,
      title: request.title || 'Unknown',
      platform: request.platform,
      status: 'pending',
    });

    // Log the download request
    await storage.createLog({
      level: 'info',
      message: 'Download started',
      details: `Started download for ${request.platform}: ${request.title}`,
      userId: request.userId,
      requestId: downloadRequest.id,
    });

    // Start download process (simulate for now)
    this.processDownload(downloadRequest.id, request).catch(error => {
      console.error('Download processing error:', error);
    });

    return downloadRequest.id;
  }

  private async processDownload(requestId: string, request: DownloadRequest) {
    try {
      // Update status to in_progress
      await storage.updateDownloadRequest(requestId, {
        status: 'in_progress',
      });

      // Simulate download progress
      for (let progress = 20; progress <= 90; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Update progress would need a separate field update if supported
      }

      // Complete the download
      const fileName = `${request.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'download'}.${this.getFileExtension(request.platform)}`;
      const filePath = `${Settings.DOWNLOAD_PATH}/${fileName}`;
      const fileSize = Math.floor(Math.random() * 10000000) + 1000000; // Simulate file size

      await storage.updateDownloadRequest(requestId, {
        status: 'completed',
        fileName,
        filePath,
        fileSize,
      });

      await storage.createLog({
        level: 'info',
        message: 'Download completed',
        details: `Successfully downloaded ${request.title} from ${request.platform}`,
        userId: request.userId,
        requestId,
      });

    } catch (error) {
      console.error('Download processing error:', error);
      
      await storage.updateDownloadRequest(requestId, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });

      await storage.createLog({
        level: 'error',
        message: 'Download failed',
        details: `Failed to download ${request.title}: ${error}`,
        userId: request.userId,
        requestId,
      });
    }
  }

  private getFileExtension(platform: string): string {
    switch (platform) {
      case 'youtube':
        return 'mp4';
      case 'spotify':
        return 'mp3';
      case 'instagram':
        return 'mp4';
      default:
        return 'bin';
    }
  }
}

export const downloadService = new DownloadService();