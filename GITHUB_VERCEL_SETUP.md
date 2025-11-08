# 📝 Complete GitHub + Vercel Deployment Guide

## 📚 Documentation Index

This project includes several deployment guides. Here's what each one covers:

1. **[QUICK_START_DEPLOYMENT.md](./QUICK_START_DEPLOYMENT.md)** ⚡
   - 10-minute quick start
   - Platform comparison
   - Recommendations by use case
   - **START HERE if you want the fastest path to deployment**

2. **[PRE_DEPLOYMENT_CHECKLIST.md](./PRE_DEPLOYMENT_CHECKLIST.md)** ✅
   - Complete pre-flight checklist
   - Security verification steps
   - Environment variable preparation
   - Step-by-step deployment process

3. **[DEPLOYMENT_VERCEL.md](./DEPLOYMENT_VERCEL.md)** 🚀
   - In-depth Vercel deployment guide
   - Vercel limitations and solutions
   - Troubleshooting section
   - Production setup recommendations

4. **[README.md](./README.md)** 📖
   - Project overview
   - Local development setup
   - Feature documentation
   - All deployment options

---

## 🎯 Your Deployment Path

### Step 1: Choose Your Platform

**Option A: Railway (Recommended for Full Features)**
- Everything works out of the box
- FFmpeg included
- Video rendering works
- $5/month free credit
- ✅ **Best choice for complete functionality**

**Option B: Vercel (Frontend Only)**
- Great for static sites
- ❌ Video rendering won't work
- Requires external service for rendering
- ⚠️ **Only choose if you understand the limitations**

**Option C: Hybrid (Advanced)**
- Vercel for frontend
- Railway/Render for backend
- Best performance
- 🔧 **Requires additional configuration**

---

## 🚀 Quick Deployment (Railway - Recommended)

### Why Railway?
Unlike Vercel, Railway includes:
- ✅ FFmpeg (video rendering works!)
- ✅ No timeout limits
- ✅ Persistent file storage
- ✅ PostgreSQL included
- ✅ Simple deployment

### Deploy to Railway in 5 Minutes:

```bash
# 1. Push to GitHub
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/tivideo.git
git push -u origin main

# 2. Deploy to Railway
# - Go to railway.app
# - Click "New Project"
# - Select "Deploy from GitHub"
# - Choose your repository
# - Add environment variables
# - Deploy!
```

**Environment Variables for Railway:**
Copy all variables from your `.env` file to Railway's environment variables section.

---

## 📋 Pre-Deployment Checklist

Before pushing to GitHub:

### Security ⚠️
- [ ] `.env` is in `.gitignore`
- [ ] `.env` is NOT tracked by git
- [ ] No API keys in code
- [ ] `.env.example` has placeholder values only

### Database 🗄️
- [ ] Supabase database created
- [ ] Tables created (`npm run db:push`)
- [ ] Connection string is Transaction Pooler (port 6543)
- [ ] Connection tested locally

### API Keys 🔑
- [ ] OpenRouter API key
- [ ] Murf.ai API key
- [ ] Pexels API key
- [ ] Pixabay API key
- [ ] FreeSound API key
- [ ] Supabase credentials
- [ ] YouTube credentials (optional)

### Code 💻
- [ ] Application builds successfully (`npm run build`)
- [ ] Application runs locally (`npm run dev`)
- [ ] All features tested

---

## 🔐 Critical: Security Before Push

### Verify .env is NOT committed:

```bash
# Check git status
git status

# .env should NOT appear in the output
# If it does, remove it:
git rm --cached .env
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Secure environment variables"
```

### ⚠️ If .env was previously committed:

**YOU MUST revoke ALL API keys immediately:**

1. **OpenRouter**: https://openrouter.ai/keys
2. **Murf.ai**: Dashboard → API Keys
3. **Pexels**: https://www.pexels.com/api/
4. **Supabase**: Settings → Database → Reset Password
5. **All other services**: Regenerate keys

Then generate new keys and never commit them.

---

## 📤 GitHub Setup

### Create Repository:

1. Go to https://github.com/new
2. Repository name: `tivideo`
3. Description: "AI-powered video generation platform"
4. Visibility: Public or Private
5. **DO NOT** initialize with README
6. Click "Create repository"

### Push Code:

```bash
# Initialize git (if not already done)
git init

# Add files
git add .

# Commit
git commit -m "Initial commit - Tivideo AI Video Platform"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/tivideo.git

# Push
git branch -M main
git push -u origin main
```

---

## 🚀 Vercel Deployment (If You Choose Vercel)

### ⚠️ Before You Deploy to Vercel:

**Understand these limitations:**
- ❌ Video rendering WON'T work (no FFmpeg)
- ❌ 10-second timeout on free tier
- ❌ Ephemeral file storage
- ✅ Frontend works perfectly
- ✅ API endpoints work
- ✅ Script generation works
- ✅ Authentication works

**Recommendation:** Use Railway instead for full functionality.

### If You Still Want Vercel:

1. **Import Project:**
   - Go to vercel.com
   - Click "Add New → Project"
   - Select your GitHub repository

2. **Configure:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add ALL variables from your `.env` file
   - Update `APP_URL` to your Vercel URL

4. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes

5. **Post-Deployment:**
   - Update Supabase redirect URLs
   - Update YouTube OAuth URLs (if using)
   - Test all features (video rendering will fail)

**For complete Vercel guide:** See [DEPLOYMENT_VERCEL.md](./DEPLOYMENT_VERCEL.md)

---

## 🔧 Post-Deployment Configuration

### Update Supabase:

1. Go to Supabase Dashboard
2. **Authentication → URL Configuration**
3. Update Site URL: `https://your-app-url.com`
4. Add Redirect URL: `https://your-app-url.com/**`

### Update YouTube OAuth (if using):

1. Google Cloud Console
2. Your Project → APIs & Services → Credentials
3. Edit OAuth 2.0 Client
4. Add Authorized Redirect URI:
   - `https://your-app-url.com/api/youtube/callback`

---

## ✅ Verification Checklist

After deployment:

- [ ] Homepage loads
- [ ] Sign up works
- [ ] Login works
- [ ] Script generation works
- [ ] Voiceover generation works
- [ ] Video rendering works (Railway/Render only)
- [ ] YouTube integration works (if enabled)
- [ ] Analytics dashboard works

---

## 🆘 Troubleshooting

### Build Fails
**Check:**
- All environment variables are set
- `DATABASE_URL` format is correct
- Dependencies are installed

### Database Connection Error
**Solution:**
- Use Transaction Pooler connection string (port 6543)
- Format: `postgresql://postgres.[project-ref]:[password]@aws-X-region.pooler.supabase.com:6543/postgres`
- Verify project ref matches your Supabase project

### Video Rendering Doesn't Work
**On Vercel:**
- Expected - use Railway or Render instead
- OR deploy rendering service separately

**On Railway/Render:**
- Check FFmpeg is available: `ffmpeg -version`
- Check render job logs
- Verify media URLs are accessible

---

## 📊 Platform Comparison

| Feature | Vercel | Railway | Render |
|---------|--------|---------|--------|
| **Setup Complexity** | Easy | Easy | Medium |
| **FFmpeg Support** | ❌ No | ✅ Yes | ✅ Yes |
| **Video Rendering** | ❌ No | ✅ Yes | ✅ Yes |
| **Free Tier** | Generous | $5/mo credit | 750 hrs/mo |
| **Timeout** | 10s (hobby) | Unlimited | 15 min |
| **Storage** | Ephemeral | Persistent | Persistent |
| **Database** | External only | ✅ Included | External |
| **Custom Domain** | ✅ Easy | ✅ Easy | ✅ Easy |
| **SSL** | ✅ Auto | ✅ Auto | ✅ Auto |
| **Best For** | Static/API | Full-stack | Full-stack |

---

## 💡 Recommended Setup by Goal

**🎯 Just Testing?**
→ Railway (everything works, simple setup)

**🎯 Production Ready?**
→ Railway or Hybrid (Vercel + Railway)

**🎯 Need Scalability?**
→ Hybrid (Vercel frontend + Railway/AWS backend)

**🎯 Maximum Free Tier?**
→ Vercel (frontend) + Railway (rendering)

---

## 📚 Next Steps

1. ✅ Deploy your application
2. ✅ Test all features
3. ✅ Configure custom domain (optional)
4. ✅ Set up monitoring (recommended)
5. ✅ Configure analytics (recommended)
6. ✅ Set up error tracking (recommended)

---

## 🔗 Useful Links

- **Railway**: https://railway.app
- **Vercel**: https://vercel.com
- **Render**: https://render.com
- **Supabase**: https://supabase.com
- **GitHub**: https://github.com

---

## 📞 Support

**Issues or Questions?**
- Check [QUICK_START_DEPLOYMENT.md](./QUICK_START_DEPLOYMENT.md)
- Review [DEPLOYMENT_VERCEL.md](./DEPLOYMENT_VERCEL.md)
- Read [PRE_DEPLOYMENT_CHECKLIST.md](./PRE_DEPLOYMENT_CHECKLIST.md)
- Open GitHub issue

---

## ✨ You're Ready!

**Choose your path:**

1. **Quick & Easy:** [QUICK_START_DEPLOYMENT.md](./QUICK_START_DEPLOYMENT.md) → Railway
2. **Vercel (with limitations):** [DEPLOYMENT_VERCEL.md](./DEPLOYMENT_VERCEL.md)
3. **Complete Checklist:** [PRE_DEPLOYMENT_CHECKLIST.md](./PRE_DEPLOYMENT_CHECKLIST.md)

**Recommended:** Start with Railway for the smoothest experience. Everything works, no configuration needed.

---

**Good luck! 🚀**
