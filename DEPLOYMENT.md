# Deployment Guide

This guide will help you deploy this application to any hosting platform outside of Replit.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Supabase recommended)
- API keys for the services you want to use

## Environment Setup

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your environment variables in the `.env` file:

### Required Variables

- `DATABASE_URL` - Your PostgreSQL connection string (used for both runtime and migrations)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `VITE_SUPABASE_URL` - Same as SUPABASE_URL (for frontend)
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Optional Database Variables

- `SUPABASE_DB_URL` - Override the runtime database connection string if different from DATABASE_URL

### Optional API Keys

Configure only the services you plan to use:

- `OPENROUTER_API_KEY` - For AI script generation
- `MURF_API_KEY` - For text-to-speech voiceovers
- `PEXELS_API_KEY` - For stock photos/videos
- `PIXABAY_API_KEY` - For audio assets
- `FREESOUND_API_KEY` - For sound effects
- `CLOUDFLARE_API_KEY` - For AI image generation
- `CLOUDFLARE_WORKER_URL` - Your Cloudflare worker URL
- `YOUTUBE_CLIENT_ID` - For YouTube integration
- `YOUTUBE_CLIENT_SECRET` - For YouTube integration

### Server Configuration

- `PORT` - Port to run the server on (default: 5000)
- `NODE_ENV` - Set to `production` for production deployments
- `APP_URL` - Your application's public URL (e.g., `https://yourdomain.com`)

## Database Setup

1. Create a Supabase project at https://supabase.com
2. Run the database migrations in your Supabase dashboard:
   - Navigate to the SQL Editor
   - Run the migration file found in your project (check for SUPABASE_MIGRATION.sql)

3. The application uses the following tables:
   - `generation_history` - Stores user generation history
   - `users` - User profiles and settings
   - `youtube_channels` - YouTube channel connections

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the application:
   ```bash
   npm run build
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
NODE_ENV=production npm start
```

The server will run on the port specified in your `PORT` environment variable (default: 5000).

## Deployment Platforms

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project directory
3. Add environment variables in the Vercel dashboard
4. Deploy with `vercel --prod`

### Heroku

1. Create a new Heroku app: `heroku create your-app-name`
2. Add PostgreSQL addon: `heroku addons:create heroku-postgresql:mini`
3. Set environment variables: `heroku config:set SUPABASE_URL=your-url ...`
4. Deploy: `git push heroku main`

### DigitalOcean App Platform

1. Connect your GitHub repository
2. Set environment variables in the App Platform dashboard
3. Configure build command: `npm install && npm run build`
4. Configure run command: `npm start`

### Railway

1. Create new project from GitHub repo
2. Add environment variables in Railway dashboard
3. Railway will auto-detect and deploy your app

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
ENV NODE_ENV=production
EXPOSE 5000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t your-app-name .
docker run -p 5000:5000 --env-file .env your-app-name
```

## Important Notes

- Make sure your `APP_URL` environment variable matches your production domain
- All API keys should be kept secure and never committed to version control
- The application serves both frontend and backend on the same port (5000 by default)
- Ensure your database migrations are run before starting the application
- For YouTube integration, make sure to configure OAuth redirect URIs in your Google Cloud Console

## Troubleshooting

### Database Connection Issues
- Verify your DATABASE_URL is correct
- Check that your database allows connections from your hosting IP
- Ensure database migrations have been run

### API Key Issues
- Verify all required API keys are set in your environment
- Check that keys have the necessary permissions
- Some features will be disabled if optional API keys are missing

### Build Errors
- Ensure Node.js version is 18 or higher
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check that all environment variables prefixed with `VITE_` are set for frontend builds

## Support

For issues or questions, please check the application logs and ensure all environment variables are properly configured.
