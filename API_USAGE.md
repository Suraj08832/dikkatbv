# Media Download Manager API Documentation

Your API key: `sk-f095862e8a028a1b9e656820ca690913fb7c8011986d8b81ac7f689d2b6d9ee2`

## Base URL
```
https://your-replit-app.replit.app
```

## Authentication
Include your API key in the headers:
```
X-API-Key: sk-f095862e8a028a1b9e656820ca690913fb7c8011986d8b81ac7f689d2b6d9ee2
```

Or as Bearer token:
```
Authorization: Bearer sk-f095862e8a028a1b9e656820ca690913fb7c8011986d8b81ac7f689d2b6d9ee2
```

## Endpoints

### 1. Search Songs
Search for songs across multiple platforms.

**POST** `/api/search`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "X-API-Key": "your-api-key"
}
```

**Body:**
```json
{
  "query": "imagine dragons radioactive",
  "platform": "all"
}
```

**Platform options:**
- `"all"` - Search all platforms
- `"youtube"` - YouTube only
- `"spotify"` - Spotify only

**Response:**
```json
{
  "results": [
    {
      "id": "ktvTqknDobU",
      "title": "Imagine Dragons - Radioactive",
      "artist": "ImagineDragonsVEVO",
      "thumbnail": "https://i.ytimg.com/vi/ktvTqknDobU/default.jpg",
      "url": "https://www.youtube.com/watch?v=ktvTqknDobU",
      "platform": "youtube"
    }
  ]
}
```

### 2. Download Song
Start downloading a song from a URL.

**POST** `/api/download`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "X-API-Key": "your-api-key"
}
```

**Body:**
```json
{
  "url": "https://www.youtube.com/watch?v=ktvTqknDobU",
  "title": "Imagine Dragons - Radioactive",
  "platform": "youtube"
}
```

**Response:**
```json
{
  "downloadId": "123e4567-e89b-12d3-a456-426614174000",
  "message": "Download started"
}
```

### 3. Check Download Status
Check the status of a download.

**GET** `/api/download/{downloadId}/status`

**Headers:**
```json
{
  "X-API-Key": "your-api-key"
}
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "url": "https://www.youtube.com/watch?v=ktvTqknDobU",
  "title": "Imagine Dragons - Radioactive",
  "platform": "youtube",
  "status": "completed",
  "progress": 100,
  "fileSize": 5242880,
  "fileName": "Imagine_Dragons___Radioactive.mp4",
  "filePath": "./downloads/Imagine_Dragons___Radioactive.mp4",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Status values:**
- `"pending"` - Download queued
- `"in_progress"` - Currently downloading
- `"completed"` - Download finished successfully
- `"failed"` - Download failed

## Rate Limits
- **Request Limit:** 10,000 requests per API key
- **Concurrent Downloads:** 5 simultaneous downloads

## Example Usage

### cURL Examples

**Search for a song:**
```bash
curl -X POST https://your-app.replit.app/api/search \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk-f095862e8a028a1b9e656820ca690913fb7c8011986d8b81ac7f689d2b6d9ee2" \
  -d '{"query": "imagine dragons radioactive", "platform": "all"}'
```

**Download a song:**
```bash
curl -X POST https://your-app.replit.app/api/download \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk-f095862e8a028a1b9e656820ca690913fb7c8011986d8b81ac7f689d2b6d9ee2" \
  -d '{"url": "https://www.youtube.com/watch?v=ktvTqknDobU", "title": "Imagine Dragons - Radioactive", "platform": "youtube"}'
```

**Check download status:**
```bash
curl https://your-app.replit.app/api/download/123e4567-e89b-12d3-a456-426614174000/status \
  -H "X-API-Key: sk-f095862e8a028a1b9e656820ca690913fb7c8011986d8b81ac7f689d2b6d9ee2"
```

### JavaScript/Node.js Example

```javascript
const apiKey = 'sk-f095862e8a028a1b9e656820ca690913fb7c8011986d8b81ac7f689d2b6d9ee2';
const baseUrl = 'https://your-app.replit.app';

// Search for songs
async function searchSongs(query, platform = 'all') {
  const response = await fetch(`${baseUrl}/api/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey
    },
    body: JSON.stringify({ query, platform })
  });
  
  return await response.json();
}

// Download a song
async function downloadSong(url, title, platform) {
  const response = await fetch(`${baseUrl}/api/download`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey
    },
    body: JSON.stringify({ url, title, platform })
  });
  
  return await response.json();
}

// Check download status
async function checkStatus(downloadId) {
  const response = await fetch(`${baseUrl}/api/download/${downloadId}/status`, {
    headers: {
      'X-API-Key': apiKey
    }
  });
  
  return await response.json();
}

// Example usage
async function main() {
  // Search for songs
  const searchResults = await searchSongs('imagine dragons radioactive');
  console.log('Search results:', searchResults);
  
  // Download first result
  if (searchResults.results.length > 0) {
    const song = searchResults.results[0];
    const download = await downloadSong(song.url, song.title, song.platform);
    console.log('Download started:', download);
    
    // Check status periodically
    const checkDownload = setInterval(async () => {
      const status = await checkStatus(download.downloadId);
      console.log('Download status:', status.status);
      
      if (status.status === 'completed' || status.status === 'failed') {
        clearInterval(checkDownload);
        console.log('Final status:', status);
      }
    }, 2000);
  }
}

main().catch(console.error);
```

## Error Responses

**401 Unauthorized:**
```json
{
  "message": "API key required"
}
```

**429 Rate Limited:**
```json
{
  "message": "Rate limit exceeded"
}
```

**400 Bad Request:**
```json
{
  "message": "Query is required"
}
```

**500 Server Error:**
```json
{
  "message": "Search failed"
}
```

## Supported Platforms

### YouTube
- **Format:** MP4 video files
- **Quality:** Automatic quality selection
- **Metadata:** Title, channel, duration, thumbnail

### Spotify (requires API credentials)
- **Format:** MP3 audio files
- **Quality:** High quality audio
- **Metadata:** Title, artist, album, duration

### Instagram (requires API credentials)
- **Format:** MP4 video files
- **Quality:** Original quality
- **Metadata:** Title, username, post type

## Setup Requirements

To enable full functionality, configure these API credentials in your environment:

- **YouTube:** `YOUTUBE_API_KEY`
- **Spotify:** `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`
- **Instagram:** `ALPHAAPIS_KEY`, `INSTAGRAM_USERNAME`, `INSTAGRAM_PASSWORD`

Your API key is ready to use for downloading and searching songs!