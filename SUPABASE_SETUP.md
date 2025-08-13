# Supabase Database Setup Guide

This application has been configured to work with Supabase as the PostgreSQL database provider. Follow these steps to set up your database:

## Step 1: Create a Supabase Project

1. Go to the [Supabase dashboard](https://supabase.com/dashboard/projects)
2. Click "New project" or "Create a new project"
3. Choose your organization or create a new one
4. Enter project details:
   - **Project name**: Choose a meaningful name like "Music Download Manager"
   - **Database password**: Choose a strong password and save it securely
   - **Region**: Select the region closest to your users
5. Click "Create new project"

## Step 2: Get Your Database Connection String

1. Wait for your project to finish setting up (this takes 1-2 minutes)
2. Once ready, click the "Connect" button in the top toolbar
3. Navigate to "Connection string" → "Transaction pooler"
4. Copy the URI value - it will look like:
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with the database password you set in Step 1

## Step 3: Configure Environment Variables

Add your Supabase database URL to your environment variables:

1. In your Replit project, go to "Secrets" (in the Tools panel)
2. Add a new secret:
   - **Key**: `DATABASE_URL`
   - **Value**: Your complete Supabase connection string from Step 2

## Step 4: Initialize Database Schema

The application will automatically create the required database tables when you first run it. The schema includes:

- **users**: User authentication and profile data
- **apiKeys**: API key management for external access
- **downloadRequests**: Track download requests and status
- **systemLogs**: Application logging and monitoring
- **sessions**: Session storage for authentication

## Configuration Features

The application includes a comprehensive settings configuration that supports:

### API Integration
- **YouTube API**: For downloading YouTube content
- **Spotify API**: For audio downloads
- **Instagram API**: For media downloads via AlphaAPIs

### Security Settings
- API key authentication
- Rate limiting (60 requests per minute by default)
- Session management with secure cookies

### Performance Settings
- Maximum concurrent searches: 5
- Search timeout: 10 seconds
- Cache expiration: 300 seconds

### File Management
- Download path configuration
- Maximum file size limits
- Automatic cleanup for old files

## Environment Variables Reference

You can configure these additional environment variables in Replit Secrets:

```bash
# API Keys (Optional - can be configured in dashboard)
YOUTUBE_API_KEY=your_youtube_api_key
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
INSTAGRAM_USERNAME=your_instagram_username
INSTAGRAM_PASSWORD=your_instagram_password
ALPHAAPIS_KEY=your_alphaapis_key

# Security (Optional - has defaults)
SECRET_KEY=your_secret_key_here_make_it_long_and_random
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=3000000000000

# Performance Tuning (Optional)
RATE_LIMIT_PER_MINUTE=60
MAX_FILE_SIZE=100MB
DOWNLOAD_PATH=./downloads
```

## Verification

After setup:

1. Your application should start successfully without database connection errors
2. You can access the admin dashboard at the root URL
3. The database tables will be automatically created on first run
4. You can monitor the application logs for any database-related issues

## Troubleshooting

### Common Issues:

1. **Connection Refused**: Check that your DATABASE_URL is correct and includes the password
2. **SSL Required**: Supabase requires SSL connections - ensure your connection string uses the pooler URL
3. **Authentication Failed**: Verify your database password is correct in the connection string
4. **Table Does Not Exist**: Run `npm run db:push` to ensure all tables are created

### Getting Help:

- Check the application logs in the console for specific error messages
- Verify your Supabase project is active and not paused
- Ensure your connection string format matches the example above
- Test the connection in the Supabase SQL Editor to verify credentials

Your music download management platform is now ready to use with Supabase as the database backend!