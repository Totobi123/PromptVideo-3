# ✅ Pre-Deployment Checklist for GitHub → Vercel

Complete these steps **BEFORE** pushing to GitHub and deploying to Vercel.

## 🔒 Step 1: Security Check (CRITICAL)

### Verify .env is NOT committed

```bash
# Check git status
git status

# .env should NOT appear in the list
# If it does, it means it's being tracked by git
```

If `.env` appears:
```bash
# Remove from git tracking
git rm --cached .env

# Add to .gitignore if not already there
echo ".env" >> .gitignore

# Commit the change
git add .gitignore
git commit -m "Remove .env from tracking"
```

### Check .gitignore includes:

```
node_modules
dist
.DS_Store
.env
.env.local
.env.production
output/
temp/
```

### ⚠️ If .env was previously committed:

**You MUST revoke all API keys immediately!**

1. **OpenRouter** - [openrouter.ai/keys](https://openrouter.ai/keys) → Delete old key, create new
2. **Murf.ai** - Dashboard → Delete old key, create new
3. **Pexels** - [pexels.com/api](https://www.pexels.com/api/) → Regenerate key
4. **Supabase** - Settings → Database → Reset password
5. **All other services** - Rotate keys

## 📋 Step 2: Prepare Repository

### Initialize Git Repository

```bash
# If not already initialized
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - Tivideo AI Video Platform"
```

### Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `tivideo` (or your preferred name)
3. Description: "AI-powered video generation platform"
4. **Visibility:** Public or Private (your choice)
5. **DO NOT** check "Initialize with README"
6. Click **"Create repository"**

### Connect to GitHub

```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Verify remote is added
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🗄️ Step 3: Set Up Supabase Database

### Get Connection Strings

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Database**
3. Scroll to **Connection string** section
4. Select **Transaction** mode tab
5. Copy the connection string (should include port 6543)

Format: `postgresql://postgres.[project-ref]:[password]@aws-X-region.pooler.supabase.com:6543/postgres`

### Run Database Migrations Locally

```bash
# Test connection first
npm run db:push
```

Should see: `✓ Changes applied`

### Get Supabase API Keys

1. Go to **Settings** → **API**
2. Copy:
   - Project URL: `https://your-project.supabase.co`
   - `anon` `public` key
   - `service_role` `secret` key

## 📝 Step 4: Prepare Environment Variables

Create a file `VERCEL_ENV_VARS.txt` (for reference only, don't commit):

```bash
# Copy this template and fill in your values

DATABASE_URL=postgresql://postgres.[ref]:[pass]@aws-X-region.pooler.supabase.com:6543/postgres
SUPABASE_DB_URL=postgresql://postgres.[ref]:[pass]@aws-X-region.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
OPENROUTER_API_KEY=sk-or-v1-your-key
MURF_API_KEY=ap2_your-key
PEXELS_API_KEY=your-key
PIXABAY_API_KEY=your-key
FREESOUND_API_KEY=your-key
NODE_ENV=production
APP_URL=https://your-app.vercel.app
PORT=5000
```

### Optional Variables:

```bash
CLOUDFLARE_API_KEY=your-key
CLOUDFLARE_WORKER_URL=your-worker-url
YOUTUBE_CLIENT_ID=your-client-id
YOUTUBE_CLIENT_SECRET=your-secret
```

**Delete `VERCEL_ENV_VARS.txt` after copying to Vercel!**

## 🚀 Step 5: Deploy to Vercel

### 5.1 Sign Up / Log In to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (recommended)

### 5.2 Import Project

1. Click **"Add New..."** → **"Project"**
2. Find and select your GitHub repository
3. Click **"Import"**

### 5.3 Configure Build Settings

**Framework Preset:** Other

**Build Command:** `npm run build`
**Output Directory:** `dist`
**Install Command:** `npm install`

### 5.4 Add Environment Variables

1. Expand **"Environment Variables"** section
2. Add each variable from your `VERCEL_ENV_VARS.txt`:
   - **Key:** Variable name (e.g., `DATABASE_URL`)
   - **Value:** Your actual value
   - **Environment:** Check all three (Production, Preview, Development)
3. Repeat for ALL variables

**💡 Tip:** You can bulk import by clicking "Bulk Edit" and pasting all at once.

### 5.5 Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. If successful, you'll see: **"Your project is ready!"**
4. Click **"Visit"** to see your live app

## 🔧 Step 6: Post-Deployment Configuration

### Update Supabase URLs

1. Copy your Vercel deployment URL (e.g., `https://tivideo-abc123.vercel.app`)
2. Go to Supabase → **Authentication** → **URL Configuration**
3. Update:
   - **Site URL:** `https://your-vercel-url.vercel.app`
   - **Redirect URLs:** Add `https://your-vercel-url.vercel.app/**`

### Update YouTube OAuth (if using)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Your Project → **APIs & Services** → **Credentials**
3. Edit OAuth 2.0 Client
4. Add to **Authorized redirect URIs:**
   - `https://your-vercel-url.vercel.app/api/youtube/callback`
5. Save

### Update Vercel Environment Variable

1. Go back to Vercel project settings
2. Find **Environment Variables**
3. Update `APP_URL` to your actual Vercel URL
4. Click **"Save"**
5. Redeploy: **Deployments** → latest → **"Redeploy"**

## ✅ Step 7: Verify Deployment

### Test Core Features:

- [ ] Homepage loads
- [ ] Sign up / Login works
- [ ] Generate script works
- [ ] Voiceover generation works
- [ ] Video rendering works (⚠️ May have issues on Vercel - see solutions below)

## ⚠️ Known Vercel Limitations

### FFmpeg Video Rendering

**Problem:** Vercel serverless functions don't include FFmpeg by default.

**Solutions:**

**Option A: Use External Service for Rendering**
- Keep frontend + API on Vercel
- Deploy video rendering to Railway or Render
- Update render endpoint to call external service

**Option B: Use Remotion Lambda**
- Replace FFmpeg with Remotion
- Deploy rendering to AWS Lambda
- See: [remotion.dev/docs/lambda](https://www.remotion.dev/docs/lambda/)

**Option C: Hybrid Deployment**
- Frontend on Vercel
- Backend with video rendering on Railway/Render
- Update API routes accordingly

## 📊 Monitoring

### View Logs:
1. Vercel Dashboard → Your Project
2. **Deployments** tab
3. Click on a deployment
4. View **Build Logs** and **Function Logs**

### Common Issues:

**Build fails:**
- Check build logs for errors
- Verify all environment variables are set
- Ensure dependencies are in `package.json`

**Runtime errors:**
- Check function logs
- Verify database connection string
- Check API key permissions

## 🔄 Continuous Deployment

After initial setup, any push to `main` branch automatically deploys:

```bash
# Make changes
git add .
git commit -m "Your commit message"
git push origin main

# Vercel automatically deploys in ~2 minutes
```

## 📧 Custom Domain (Optional)

1. Vercel → Your Project → **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain
4. Follow DNS configuration instructions
5. Update all URLs in:
   - Vercel environment variables
   - Supabase settings
   - YouTube OAuth settings

## ✅ Final Checklist

Before going live:

- [ ] .env is NOT in git repository
- [ ] All API keys are valid and active
- [ ] Database connection works
- [ ] Supabase URLs configured
- [ ] Environment variables set in Vercel
- [ ] YouTube OAuth configured (if using)
- [ ] Test all major features
- [ ] Monitor logs for errors
- [ ] Set up error tracking (optional)
- [ ] Configure custom domain (optional)

## 🆘 Need Help?

- **Vercel Deployment Guide:** [DEPLOYMENT_VERCEL.md](./DEPLOYMENT_VERCEL.md)
- **Main README:** [README.md](./README.md)
- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)

---

**You're all set! 🎉**

Push to GitHub → Deploy to Vercel → Your app is live!
