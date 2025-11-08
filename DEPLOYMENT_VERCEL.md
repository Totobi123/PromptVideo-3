# 🚀 Deploy Tivideo to Vercel

This guide will walk you through deploying Tivideo to Vercel with GitHub integration.

## Prerequisites

- GitHub account
- Vercel account (sign up free at [vercel.com](https://vercel.com))
- Supabase database set up
- All required API keys

## Step 1: Prepare Your Repository

### 1.1 Initialize Git (if not already done)

```bash
git init
git add .
git commit -m "Initial commit"
```

### 1.2 Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Create a new repository (e.g., `tivideo`)
3. **DO NOT** initialize with README, .gitignore, or license

### 1.3 Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/tivideo.git
git branch -M main
git push -u origin main
```

**⚠️ SECURITY CHECK:** Before pushing, verify `.env` is in `.gitignore` and NOT being committed:

```bash
git status
# .env should NOT appear in the list
```

## Step 2: Deploy to Vercel

### 2.1 Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your GitHub repository (`tivideo`)
5. Click **"Import"**

### 2.2 Configure Project Settings

Vercel will auto-detect the project. Configure the following:

**Framework Preset:** Other (or leave as detected)

**Build & Development Settings:**
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

**Root Directory:** `./` (leave as root)

### 2.3 Add Environment Variables

Click **"Environment Variables"** and add ALL variables from your `.env` file:

#### Required Variables:

```bash
# Database (CRITICAL - use Transaction Pooler port 6543)
DATABASE_URL=postgresql://postgres.[ref]:[pass]@aws-X-region.pooler.supabase.com:6543/postgres
SUPABASE_DB_URL=postgresql://postgres.[ref]:[pass]@aws-X-region.pooler.supabase.com:6543/postgres

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# AI Services
OPENROUTER_API_KEY=sk-or-v1-your-key

# Text-to-Speech
MURF_API_KEY=ap2_your-key

# Media Services
PEXELS_API_KEY=your-key
PIXABAY_API_KEY=your-key
FREESOUND_API_KEY=your-key

# App Configuration
NODE_ENV=production
APP_URL=https://your-app.vercel.app
PORT=5000
```

#### Optional Variables:

```bash
# Cloudflare AI
CLOUDFLARE_API_KEY=your-key
CLOUDFLARE_WORKER_URL=your-worker-url

# YouTube
YOUTUBE_CLIENT_ID=your-client-id
YOUTUBE_CLIENT_SECRET=your-secret
```

**💡 Tip:** Copy-paste from your local `.env` file, but update `APP_URL` to your Vercel domain.

### 2.4 Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Once deployed, you'll get a URL like `https://tivideo-xxxx.vercel.app`

## Step 3: Post-Deployment Setup

### 3.1 Update Supabase Settings

1. Go to your Supabase project
2. Navigate to **Authentication** → **URL Configuration**
3. Add your Vercel URL to **Site URL**: `https://your-app.vercel.app`
4. Add to **Redirect URLs**: `https://your-app.vercel.app/**`

### 3.2 Update YouTube OAuth (if using)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your project → **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client
4. Add **Authorized redirect URIs**:
   - `https://your-app.vercel.app/api/youtube/callback`
5. Save changes

### 3.3 Test Your Deployment

1. Visit your Vercel URL
2. Try signing up/logging in
3. Generate a test video script
4. Verify all features work

## Step 4: Configure Custom Domain (Optional)

### 4.1 Add Domain in Vercel

1. In your Vercel project, go to **Settings** → **Domains**
2. Click **"Add"** and enter your domain
3. Follow DNS configuration instructions

### 4.2 Update Environment Variables

After adding custom domain, update:
- `APP_URL` in Vercel environment variables
- Supabase URL configuration
- YouTube OAuth redirect URIs

## Troubleshooting

### Build Fails

**Error:** `Cannot find module 'tsx'`

**Solution:** Ensure `tsx` is in `dependencies`, not `devDependencies` in `package.json`

---

**Error:** `FFmpeg not found`

**Solution:** Vercel serverless functions don't include FFmpeg by default. You need to add a custom FFmpeg layer or use a serverless-friendly alternative. See [Vercel FFmpeg Layer](https://github.com/Remotion/remotion/tree/main/packages/lambda-ffmpeg).

### Database Connection Issues

**Error:** `Tenant or user not found`

**Solution:** 
1. Verify you're using the **Transaction Pooler** connection string (port 6543)
2. Check username format: `postgres.[project-ref]`
3. Ensure no extra `@` symbols in password

### Environment Variables Not Loading

**Error:** Variables are undefined

**Solution:**
1. Redeploy after adding/changing environment variables
2. Check variable names match exactly (case-sensitive)
3. In Vercel dashboard, verify variables show "Production" environment

### Video Rendering Timeout

**Error:** Function execution timed out

**Solution:** Vercel Pro plan required for longer execution times (300s max on Pro vs 10s on Hobby). Alternative: Use background jobs with a queue service.

## Vercel Limitations & Solutions

### 1. FFmpeg Availability

**Issue:** Vercel serverless doesn't include FFmpeg

**Solutions:**
- Use [Remotion Lambda](https://www.remotion.dev/docs/lambda/) for video rendering
- Deploy video rendering to separate service (AWS Lambda with FFmpeg layer)
- Use third-party video rendering API

### 2. File Storage

**Issue:** Serverless functions have ephemeral storage

**Solutions:**
- Store rendered videos in Supabase Storage
- Use Vercel Blob storage
- Upload directly to cloud storage (AWS S3, Cloudflare R2)

### 3. Execution Time Limits

**Hobby Plan:** 10 seconds max
**Pro Plan:** 60 seconds max (can request up to 900s)

**Solutions:**
- Upgrade to Vercel Pro ($20/month)
- Use background job processing
- Split long-running tasks

## Recommended Production Setup

For production use with video rendering:

1. **Frontend + API:** Vercel
2. **Video Rendering:** 
   - AWS Lambda with FFmpeg layer, OR
   - Dedicated server (DigitalOcean, Railway), OR
   - Remotion Lambda
3. **File Storage:** Supabase Storage or AWS S3
4. **Database:** Supabase PostgreSQL

## Cost Estimates

### Vercel
- **Hobby (Free):** 
  - 100GB bandwidth/month
  - Serverless execution limits
  - Good for testing

- **Pro ($20/month):**
  - 1TB bandwidth
  - 1000 hours compute
  - Extended execution time
  - Better for production

### Alternative: Hybrid Deployment

**Frontend on Vercel Free** + **Video Rendering on Railway Free ($5 credit/month)**
- Best of both worlds
- Use Vercel for static/API routes
- Use Railway for video rendering jobs

## Continuous Deployment

Vercel automatically deploys on every push to `main` branch:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Vercel auto-deploys in ~2 minutes
```

### Preview Deployments

Every pull request gets a preview URL:
1. Create a branch: `git checkout -b feature/new-feature`
2. Push changes: `git push origin feature/new-feature`
3. Create PR on GitHub
4. Vercel creates preview deployment automatically

## Monitoring & Logs

### View Logs
1. Go to Vercel Dashboard
2. Select your project
3. Click on a deployment
4. View **Build Logs** and **Function Logs**

### Common Issues in Logs

**Cold starts:** First request after inactivity may be slow
**Memory limits:** Large operations may fail
**Timeout errors:** Long video processing hits limit

## Next Steps

1. ✅ Set up monitoring with [Vercel Analytics](https://vercel.com/analytics)
2. ✅ Configure error tracking (Sentry, LogRocket)
3. ✅ Set up CI/CD with GitHub Actions
4. ✅ Enable caching for better performance
5. ✅ Configure rate limiting

---

## Support

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Vercel Community:** [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **Project Issues:** Open an issue on your GitHub repo

---

**Need help?** Check the main [README.md](./README.md) for detailed setup instructions.
