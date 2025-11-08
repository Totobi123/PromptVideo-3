# Deploying Tivideo to Render

This guide will help you deploy the Tivideo application to Render.com.

## Prerequisites

- A Render account (sign up at https://render.com)
- A Supabase account with your database set up
- Your API keys ready (see .env.example for the full list)

## Deployment Steps

### Option 1: Deploy with render.yaml (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Create a new Web Service on Render**
   - Go to https://dashboard.render.com
   - Click "New +" and select "Web Service"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

3. **Configure Environment Variables**
   
   In the Render dashboard, add the following environment variables:

   **Required Variables:**
   - `APP_URL` - Your Render app URL (e.g., `https://your-app.onrender.com`)
   - `DATABASE_URL` - Your Supabase database URL (Transaction mode, port 6543)
   - `SUPABASE_DB_URL` - Same as DATABASE_URL
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
   - `VITE_SUPABASE_URL` - Same as SUPABASE_URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

   **Optional API Keys (add only what you need):**
   - `OPENROUTER_API_KEY` - For AI script generation
   - `MURF_API_KEY` - For text-to-speech
   - `PEXELS_API_KEY` - For stock videos/photos
   - `PIXABAY_API_KEY` - For audio assets
   - `FREESOUND_API_KEY` - For sound effects
   - `CLOUDFLARE_API_KEY` - For AI image generation
   - `CLOUDFLARE_WORKER_URL` - Your Cloudflare worker URL
   - `YOUTUBE_CLIENT_ID` - For YouTube integration
   - `YOUTUBE_CLIENT_SECRET` - For YouTube integration

4. **Install FFmpeg (Required for video processing)**
   
   Since Render doesn't include FFmpeg by default, you need to add a build script:
   
   - In your Render dashboard, go to your service settings
   - Update the **Build Command** to:
     ```bash
     apt-get update && apt-get install -y ffmpeg && npm install && npm run build
     ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your application
   - Your app will be available at `https://your-app-name.onrender.com`

### Option 2: Manual Setup (Without render.yaml)

1. **Create a new Web Service**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your repository

2. **Configure Settings**
   - **Name**: tivideo (or your preferred name)
   - **Region**: Oregon (or closest to you)
   - **Branch**: main
   - **Runtime**: Node
   - **Build Command**: 
     ```bash
     apt-get update && apt-get install -y ffmpeg && npm install && npm run build
     ```
   - **Start Command**: `npm start`
   - **Plan**: Starter (or higher for production)

3. **Add Environment Variables** (same as Option 1, step 3)

4. **Deploy**: Click "Create Web Service"

## Important Notes

### FFmpeg Installation
This application requires FFmpeg for video processing. The build command includes FFmpeg installation. If you encounter issues:
- Ensure the build command includes: `apt-get update && apt-get install -y ffmpeg`
- For paid plans, you can use a Dockerfile for better control

### Database Setup
1. Make sure your Supabase database is set up with all necessary tables
2. Run the SQL migrations found in `SUPABASE_MIGRATION.sql` in your Supabase dashboard
3. Use the **Transaction Pooler** connection string (port 6543) for `DATABASE_URL`

### YouTube OAuth Setup
If using YouTube integration:
1. Go to Google Cloud Console
2. Add your Render URL to authorized redirect URIs:
   - `https://your-app.onrender.com/api/youtube/callback`
3. Update `APP_URL` environment variable with your Render URL

### Performance Tips
- **Free Plan**: Render free plans spin down after inactivity. First request may be slow.
- **Persistent Storage**: Render free plans have ephemeral storage. Generated videos in `/output` will be lost on restart.
- **Upgrade**: For production use, consider the Starter plan or higher with persistent disks.

### File Storage Considerations
The application stores generated videos in the `output` directory. On Render's free tier, this storage is ephemeral and will be cleared when the service restarts. For production:

1. **Upgrade to a paid plan** with persistent disks, OR
2. **Use cloud storage** (S3, Cloudflare R2, etc.) to store generated videos
3. **Implement cleanup** to delete old videos regularly

## Troubleshooting

### Build Fails
- **FFmpeg not found**: Ensure `apt-get install -y ffmpeg` is in your build command
- **Out of memory**: Upgrade your Render plan
- **Dependencies fail**: Clear build cache in Render dashboard

### Runtime Errors
- **Database connection fails**: Verify `DATABASE_URL` uses port 6543 (Transaction Pooler)
- **API errors**: Check that all required environment variables are set
- **Video rendering fails**: Verify FFmpeg is installed (check deploy logs)

### Checking Logs
- View logs in Render Dashboard → Your Service → Logs
- Look for FFmpeg installation confirmation during build
- Check for database connection errors on startup

## Monitoring

Render provides:
- **Logs**: Real-time application logs
- **Metrics**: CPU, memory, and bandwidth usage
- **Alerts**: Set up notifications for downtime

## Updating Your App

Render automatically deploys when you push to your connected branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Or manually deploy from the Render dashboard.

## Custom Domain

To use a custom domain:
1. Go to your service settings
2. Click "Custom Domain"
3. Add your domain and follow DNS instructions
4. Update `APP_URL` environment variable to your custom domain

## Need Help?

- Render Documentation: https://render.com/docs
- Supabase Documentation: https://supabase.com/docs
- Check application logs for specific error messages
