### Deploying to Heroku

1. Create app and set buildpack (Node):
   - heroku create
   - heroku buildpacks:set heroku/nodejs

2. Procfile (web dyno):
   - web: npm run start

3. Set Config Vars (Settings → Config Vars):
   - DATABASE_URL (from Supabase: Transaction pooler URI)
   - SESSION_SECRET (random string)
   - REPLIT_DOMAINS, REPL_ID, ISSUER_URL (only if using Replit OIDC)
   - API_KEY (optional for internal features)
   - YOUTUBE_API_KEY
   - SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET (optional)
   - SUPABASE_URL / SUPABASE_ANON_KEY (optional)
   - STRIPE_PUBLISHABLE_KEY (optional)
   - STRIPE_SECRET_KEY (optional)
   - STRIPE_WEBHOOK_SECRET (optional)
   - COOKIE_FILE_PATH=/tmp/cookies.txt

4. Cookies (optional):
   - Commit a local cookies.txt for dev
   - On Heroku, the app copies root cookies.txt to /tmp at boot automatically

5. Build and run on deploy:
   - heroku config:set NPM_CONFIG_PRODUCTION=false
   - git push heroku main

6. Open:
   - heroku open
