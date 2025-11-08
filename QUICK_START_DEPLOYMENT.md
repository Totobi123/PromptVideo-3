# 🚀 Quick Start: Deploy to Vercel in 10 Minutes

## ⚠️ Critical: Read This First!

**Vercel Limitation:** Video rendering with FFmpeg won't work on Vercel's free/hobby tier.

**Recommendation:**
- Deploy to **Railway** or **Render** for full video rendering support
- OR use **Vercel for frontend** + **Railway/Render for backend** (hybrid)

If you still want to deploy to Vercel, this guide will help, but **video rendering will need to be handled externally**.

---

## Step 1: Security Check (2 min)

```bash
# Verify .env is NOT tracked
git status

# .env should NOT appear in output
# If it does:
git rm --cached .env
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Secure environment variables"
```

---

## Step 2: Push to GitHub (3 min)

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit - Tivideo AI Video Platform"

# Create repository on GitHub (github.com/new)
# Then connect and push:
git remote add origin https://github.com/YOUR_USERNAME/tivideo.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Vercel (5 min)

### 3.1 Import Project
1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New..." → "Project"**
3. Import your GitHub repository

### 3.2 Add Environment Variables

Click "Environment Variables" and add:

**Required:**
```
DATABASE_URL=postgresql://postgres.[ref]:[pass]@aws-X-region.pooler.supabase.com:6543/postgres
SUPABASE_DB_URL=[same as above]
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-key
OPENROUTER_API_KEY=sk-or-v1-your-key
MURF_API_KEY=ap2_your-key
PEXELS_API_KEY=your-key
PIXABAY_API_KEY=your-key
FREESOUND_API_KEY=your-key
NODE_ENV=production
APP_URL=https://your-app.vercel.app
PORT=5000
```

### 3.3 Deploy
Click **"Deploy"** and wait 2-3 minutes

---

## ⚠️ Post-Deployment: What Works & What Doesn't

### ✅ Works on Vercel:
- ✅ User authentication
- ✅ Script generation
- ✅ Voiceover generation
- ✅ Media recommendations
- ✅ Background music selection
- ✅ Project management

### ❌ Doesn't Work on Vercel (Free/Hobby):
- ❌ Video rendering (FFmpeg not available)
- ❌ Long-running processes (10s timeout)
- ❌ File storage (ephemeral filesystem)

---

## 💡 Solution: Hybrid Deployment (Recommended)

**Best Approach for Production:**

1. **Frontend + API on Vercel** (FREE)
   - User interface
   - Authentication
   - Script generation
   - API endpoints

2. **Video Rendering on Railway** (FREE $5 credit/month)
   - FFmpeg video processing
   - Long-running render jobs
   - File storage

### How to Set Up Hybrid:

**Deploy to Railway for Rendering:**
1. Go to [railway.app](https://railway.app)
2. Deploy this same repository
3. Add same environment variables
4. Get your Railway URL: `https://your-app.railway.app`

**Update Vercel Environment:**
Add to Vercel environment variables:
```
RENDER_SERVICE_URL=https://your-app.railway.app
```

**Update Code:**
In your frontend, change render API calls to point to Railway:
```js
// Instead of: POST /api/render-video
// Use: POST https://your-app.railway.app/api/render-video
```

---

## Alternative: Full Deployment on Railway

**Easier Option:** Deploy everything to Railway instead of Vercel.

### Why Railway?
- ✅ FFmpeg included
- ✅ No timeout limits  
- ✅ Persistent file storage
- ✅ $5/month free credit
- ✅ PostgreSQL database included

### Deploy to Railway:
1. Go to [railway.app](https://railway.app)
2. **New Project → Deploy from GitHub**
3. Select your repository
4. Add environment variables (same as above)
5. Deploy! ✨

**That's it.** Everything works on Railway without modifications.

---

## Quick Comparison

| Feature | Vercel | Railway | Render |
|---------|--------|---------|--------|
| **FFmpeg** | ❌ No | ✅ Yes | ✅ Yes |
| **Video Rendering** | ❌ No | ✅ Yes | ✅ Yes |
| **Free Tier** | ✅ Good | ✅ $5/month | ✅ 750hrs/month |
| **Timeout** | 10s (hobby) | ♾️ Unlimited | 15 min |
| **File Storage** | Ephemeral | ✅ Persistent | ✅ Persistent |
| **Best For** | Frontend/API | Full-stack | Full-stack |

---

## Recommendation by Use Case

**Just Testing?**
→ Deploy to **Railway** (easiest, everything works)

**Production Ready?**
→ **Hybrid**: Vercel (frontend) + Railway (rendering)

**Need Custom Domain?**
→ **Railway** or **Render** (easier SSL setup)

**Want Maximum Free Tier?**
→ **Vercel** (frontend) + **Railway** (backend)

---

## Need More Details?

- **Full Vercel Guide:** [DEPLOYMENT_VERCEL.md](./DEPLOYMENT_VERCEL.md)
- **Pre-Deployment Checklist:** [PRE_DEPLOYMENT_CHECKLIST.md](./PRE_DEPLOYMENT_CHECKLIST.md)
- **Main README:** [README.md](./README.md)

---

## 🆘 Still Stuck?

**Common Issues:**

**Build Fails:**
- Check all environment variables are set
- Verify database connection string format

**Video Rendering Doesn't Work:**
- Expected on Vercel - use Railway instead
- OR implement external rendering service

**Database Connection Error:**
- Use Transaction Pooler (port 6543)
- Format: `postgres.[project-ref]:password@aws...`

---

**TL;DR:** 
- **Quick test?** → Railway
- **Production?** → Vercel (frontend) + Railway (rendering)  
- **Full features?** → Railway or Render

Choose Railway for simplicity. It just works. 🚀
