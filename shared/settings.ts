// Configuration settings based on the user's provided Settings class
export class Settings {
  // API Security
  static readonly API_KEY = process.env.API_KEY || "";
  static readonly SECRET_KEY = process.env.SECRET_KEY || "your_secret_key_here_make_it_long_and_random";
  static readonly ALGORITHM = process.env.ALGORITHM || "HS256";
  static readonly ACCESS_TOKEN_EXPIRE_MINUTES = parseInt(process.env.ACCESS_TOKEN_EXPIRE_MINUTES || "3000000000000");
  
  // YouTube API Configuration
  static readonly YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "";
  static readonly YOUTUBE_API_URL = process.env.YOUTUBE_API_URL || "https://www.googleapis.com/youtube/v3";
  
  // Supabase (optional - for future integration)
  static readonly SUPABASE_URL = process.env.SUPABASE_URL || "";
  static readonly SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";

  // Stripe (optional - for future integration)
  static readonly STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || "";
  static readonly STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
  static readonly STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

  // Spotify API Configuration (leave blank by default to avoid invalid_client spam)
  static readonly SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || "";
  static readonly SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || "";
  
  // Instagram Configuration
  static readonly INSTAGRAM_USERNAME = process.env.INSTAGRAM_USERNAME || "";
  static readonly INSTAGRAM_PASSWORD = process.env.INSTAGRAM_PASSWORD || "";
  static readonly ALPHAAPIS_INSTAGRAM_URL = process.env.ALPHAAPIS_INSTAGRAM_URL || "https://www.alphaapis.org/Instagram/dl/v1";
  static readonly ALPHAAPIS_KEY = process.env.ALPHAAPIS_KEY || "";
  
  // Database - Using PostgreSQL instead of SQLite
  static readonly DATABASE_URL = process.env.DATABASE_URL || "";
  
  // File Storage
  static readonly DOWNLOAD_PATH = process.env.DOWNLOAD_PATH || "./downloads";
  static readonly MAX_FILE_SIZE = process.env.MAX_FILE_SIZE || "900MB";
  
  // Rate Limiting
  static readonly RATE_LIMIT_PER_MINUTE = parseInt(process.env.RATE_LIMIT_PER_MINUTE || "60");
  
  // Cookie File Path
  static readonly COOKIE_FILE_PATH = process.env.COOKIE_FILE_PATH || 
    (process.env.DYNO ? "/tmp/cookies.txt" : "./cookies.txt");
  
  // Performance Settings
  static readonly MAX_CONCURRENT_SEARCHES = 5;
  static readonly SEARCH_TIMEOUT = 10;
  static readonly CACHE_EXPIRE_SECONDS = 300;
  
  // Search Settings
  static readonly FUZZY_MATCH_THRESHOLD = 80;
  static readonly MAX_RESULTS_PER_PLATFORM = 20;
  static readonly ENABLE_SEARCH_SUGGESTIONS = true;
}

export const settings = new Settings();