# Deploying Tivideo to Railway

This guide will help you deploy the Tivideo application to Railway.app with their free trial.

## Why Railway?

- **$5 Free Trial**: Get $5 in free credits to start
- **Easy Setup**: Automatic deployment from GitHub
- **Built-in PostgreSQL**: Optional managed database (or use your Supabase)
- **FFmpeg Support**: FFmpeg is pre-installed on Railway
- **Auto-deploy**: Automatically deploys on git push

## Prerequisites

- A Railway account (sign up at https://railway.app with GitHub)
- Your code pushed to a GitHub repository
- A Supabase account with your database set up
- Your API keys ready (see .env.example)

## Deployment Steps

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### Step 2: Create New Project on Railway

1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select your repository
4. Railway will automatically detect it's a Node.js app

### Step 3: Configure Environment Variables

In the Railway dashboard, go to your service → Variables tab and add:

**Required Variables:**
```
NODE_ENV=production
PORT=5000
APP_URL=https://your-app.up.railway.app
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-X-region.pooler.supabase.com:6543/postgres
SUPABASE_DB_URL=postgresql://postgres.[project-ref]:[password]@aws-X-region.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Optional API Keys (add only what you need):**
```
OPENROUTER_API_KEY=sk-or-v1-your-key
MURF_API_KEY=ap2_your-key
PEXELS_API_KEY=your-pexels-key
PIXABAY_API_KEY=your-pixabay-key
FREESOUND_API_KEY=your-freesound-key
CLOUDFLARE_API_KEY=your-cloudflare-key
CLOUDFLARE_WORKER_URL=https://your-worker.workers.dev
YOUTUBE_CLIENT_ID=your-client-id.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=GOCSPX-your-secret
```

### Step 4: Configure Build & Start Commands

Railway should auto-detect your package.json, but verify in Settings → Deploy:

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Watch Paths**: Leave default or set to `/` to deploy on any changes

### Step 5: Deploy

1. Railway will automatically start deploying
2. Wait for the build to complete (check the deployment logs)
3. Once deployed, Railway will provide you with a URL like `https://your-app.up.railway.app`
4. Update the `APP_URL` environment variable with this URL

## Database Setup

### Option A: Use Supabase (Recommended)
You're already using Supabase, so just use your existing database:
- Set `DATABASE_URL` and `SUPABASE_DB_URL` to your Supabase connection string
- Make sure to use the **Transaction Pooler** (port 6543)

### Option B: Use Railway PostgreSQL
Alternatively, you can use Railway's built-in PostgreSQL:
1. In your Railway project, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically create a `DATABASE_URL` variable
4. Run your migrations (see below)

## Running Database Migrations

If you haven't already set up your Supabase database:

1. Go to your Supabase dashboard → SQL Editor
2. Run the SQL from `SUPABASE_MIGRATION.sql`
3. Verify tables are created

## FFmpeg Availability

Good news! **FFmpeg is pre-installed on Railway**, so video processing will work out of the box. No additional setup needed.

## YouTube OAuth Setup

If using YouTube integration:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your OAuth 2.0 credentials
3. Add authorized redirect URIs:
   - `https://your-app.up.railway.app/api/youtube/callback`
   - Replace `your-app` with your actual Railway domain
4. Save changes

## Important Notes

### Free Trial Information
- **$5 Credit**: Railway gives you $5 in free credits to start
- **Usage-based**: You're charged based on resources used
- **Credit Card Required**: You need to add a payment method to use the trial
- **Monitor Usage**: Check your usage in the Railway dashboard

### Persistent Storage
- Railway provides persistent storage by default
- Generated videos in `/output` will persist between deployments
- Consider implementing cleanup for old files to save space

### Automatic Deployments
Railway automatically deploys when you push to your connected branch:
```bash
git add .
git commit -m "Update feature"
git push origin main
```

### Custom Domain
To use a custom domain:
1. Go to your service → Settings → Domains
2. Click "Custom Domain"
3. Add your domain and configure DNS
4. Update `APP_URL` to your custom domain

## Monitoring & Logs

### View Logs
- Click on your service in Railway dashboard
- Go to "Deployments" tab
- Click on a deployment to view logs
- Use the search feature to filter logs

### Metrics
Railway provides:
- CPU usage
- Memory usage
- Network traffic
- Deployment history

## Troubleshooting

### Build Failures
**Problem**: Build fails during npm install
- **Solution**: Check that Node.js version is compatible (18+)
- Check deployment logs for specific errors

**Problem**: Vite build fails
- **Solution**: Ensure all `VITE_` prefixed environment variables are set

### Runtime Errors
**Problem**: Database connection fails
- **Solution**: Verify `DATABASE_URL` is correct
- Use Transaction Pooler URL (port 6543) for Supabase
- Check that database allows external connections

**Problem**: API requests fail
- **Solution**: Verify all required environment variables are set
- Check API key validity
- Review application logs

**Problem**: Video rendering fails
- **Solution**: FFmpeg is pre-installed, but check logs for specific errors
- Verify file permissions
- Check available disk space

### Port Issues
Railway automatically handles port configuration. Your app should:
- Listen on `process.env.PORT` (set to 5000 in your env vars)
- Bind to `0.0.0.0` (already configured in your code)

## Updating Your App

Simply push to your connected branch:
```bash
git add .
git commit -m "Your update message"
git push origin main
```

Railway will automatically detect the push and redeploy.

## Performance Tips

1. **Monitor Credits**: Keep an eye on your $5 free trial usage
2. **Optimize Video Processing**: Large video files consume more CPU/memory
3. **Implement Caching**: Use Supabase for caching frequently accessed data
4. **Clean Up Files**: Regularly delete old generated videos from `/output`

## Cost Management

After your free trial:
- Railway charges based on usage
- Estimate costs using Railway's pricing calculator
- Set up usage alerts in your account settings
- Consider upgrading to a paid plan for production use

## Getting Help

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: Active community support
- **Application Logs**: Always check logs first for error details

## Next Steps

1. ✅ Deploy to Railway
2. ✅ Verify all environment variables are set
3. ✅ Test video generation functionality
4. ✅ Set up YouTube OAuth if needed
5. ✅ Monitor your credit usage
6. ✅ Configure custom domain (optional)

Your app should now be live at `https://your-app.up.railway.app`! 🚀
