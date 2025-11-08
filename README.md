# 🎬 Tivideo - AI-Powered Video Generation Platform

Transform text prompts into professional videos with AI-generated scripts, voiceovers, stock media, and automatic rendering.

## ✨ Features

- **AI Video Script Generation** - Generate engaging video scripts from simple prompts
- **Automatic Voiceover** - AI-powered text-to-speech with multiple voices and paces
- **Smart Media Selection** - Auto-fetch stock videos/images or generate AI images
- **Background Music** - Royalty-free background music matching your video mood
- **Professional Video Rendering** - FFmpeg-powered rendering with transitions and effects
- **YouTube Integration** - Connect your channel for analytics and direct uploads
- **Project Management** - Track all your video generations with automatic history
- **Analytics Dashboard** - View usage statistics and generation insights

## 🛠️ Tech Stack

### Frontend
- **React** + **TypeScript** - Modern UI development
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first styling
- **Shadcn/ui** - Beautiful component library
- **TanStack Query** - Server state management
- **Wouter** - Lightweight routing

### Backend
- **Node.js** + **Express** - Server framework
- **Drizzle ORM** - Type-safe database queries
- **PostgreSQL** (Supabase) - Database
- **FFmpeg** - Video processing
- **OpenRouter API** - AI script generation
- **Murf.ai** - Text-to-speech
- **Pexels API** - Stock media
- **FreeSound API** - Background music
- **YouTube Data API** - Channel integration

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **FFmpeg** installed ([Installation guide](https://ffmpeg.org/download.html))
- **Supabase account** ([Sign up free](https://supabase.com))
- **API Keys** for:
  - OpenRouter ([Get key](https://openrouter.ai/))
  - Murf.ai ([Get key](https://murf.ai/))
  - Pexels ([Get key](https://www.pexels.com/api/))
  - Pixabay ([Get key](https://pixabay.com/api/docs/))
  - FreeSound ([Get key](https://freesound.org/apiv2/apply/))
  - YouTube API (optional, [Get credentials](https://console.cloud.google.com/))

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd tivideo
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase Database

#### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to **Settings** → **Database**
3. Copy your **Transaction Pooler** connection string (port 6543)
   - Format: `postgresql://postgres.[project-ref]:[password]@aws-X-region.pooler.supabase.com:6543/postgres`

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development
APP_URL=http://localhost:5000

# Database Configuration (use Transaction Pooler from Supabase)
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-X-region.pooler.supabase.com:6543/postgres
SUPABASE_DB_URL=postgresql://postgres.[project-ref]:[password]@aws-X-region.pooler.supabase.com:6543/postgres

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# AI Services
OPENROUTER_API_KEY=your-openrouter-key

# Text-to-Speech
MURF_API_KEY=your-murf-key

# Media Services
PEXELS_API_KEY=your-pexels-key
PIXABAY_API_KEY=your-pixabay-key
FREESOUND_API_KEY=your-freesound-key

# Cloudflare AI (Optional - for AI image generation)
CLOUDFLARE_API_KEY=your-cloudflare-key
CLOUDFLARE_WORKER_URL=your-worker-url

# YouTube API (Optional)
YOUTUBE_CLIENT_ID=your-youtube-client-id
YOUTUBE_CLIENT_SECRET=your-youtube-client-secret
```

### 5. Initialize Database

Push the database schema to Supabase:

```bash
npm run db:push
```

This creates all required tables:
- `users` - User accounts
- `render_jobs` - Video rendering queue
- `youtube_channels` - Connected YouTube channels
- `youtube_uploads` - Upload history
- `generation_history` - Project history

### 6. Verify FFmpeg Installation

Check if FFmpeg is installed:

```bash
ffmpeg -version
```

If not installed:
- **macOS**: `brew install ffmpeg`
- **Ubuntu/Debian**: `sudo apt install ffmpeg`
- **Windows**: Download from [ffmpeg.org](https://ffmpeg.org/download.html)

## 🏃 Running Locally

### Development Mode

Start the development server (hot-reload enabled):

```bash
npm run dev
```

The app will be available at: `http://localhost:5000`

### Production Build

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## 🌐 Deployment to Vercel (Recommended)

### Quick Deploy to Vercel

**For complete step-by-step Vercel deployment guide, see [DEPLOYMENT_VERCEL.md](./DEPLOYMENT_VERCEL.md)**

#### Quick Steps:
1. Push your code to GitHub
2. Connect GitHub repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

**⚠️ Important:** Vercel has limitations with FFmpeg video rendering. See [DEPLOYMENT_VERCEL.md](./DEPLOYMENT_VERCEL.md) for solutions and alternative architectures.

---

## 🌐 Alternative Free Deployment Options

### Option 1: Deploy on Replit (Best for Full Video Rendering)

Replit provides free hosting with automatic deployments.

#### Steps:
1. Fork this project on Replit
2. Add your environment variables in Replit Secrets:
   - Go to **Tools** → **Secrets**
   - Add all variables from your `.env` file
3. Click **Deploy** → **Create Deployment**
4. Your app will be live at `https://your-repl.replit.app`

**Benefits:**
- ✅ Free hosting
- ✅ Automatic SSL/HTTPS
- ✅ Built-in database support
- ✅ Auto-restart on crashes
- ✅ Easy environment management

### Option 2: Deploy on Render

[Render](https://render.com) offers free web services with automatic deploys from Git.

#### Steps:
1. Create account on [render.com](https://render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Add all your `.env` variables
5. Click **Create Web Service**

**Free Tier Includes:**
- 750 hours/month
- Auto-sleep after 15 min inactivity
- Custom domains (with upgrade)

### Option 3: Deploy on Railway

[Railway](https://railway.app) provides $5/month free credit.

#### Steps:
1. Create account on [railway.app](https://railway.app)
2. Click **New Project** → **Deploy from GitHub**
3. Select your repository
4. Railway auto-detects Node.js and builds automatically
5. Add environment variables in **Variables** tab
6. Get your deployed URL

**Free Tier:**
- $5 credit/month
- Automatic deployments
- PostgreSQL database included

### Option 4: Deploy on Fly.io

[Fly.io](https://fly.io) offers generous free tier for hobby projects.

#### Steps:
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Login: `fly auth login`
3. Launch app: `fly launch`
4. Set secrets: `fly secrets set KEY=value`
5. Deploy: `fly deploy`

**Free Tier:**
- Up to 3 VMs
- 3GB persistent storage
- Shared CPU

## 🔒 Security Warning

**⚠️ NEVER commit your `.env` file to version control!**

Your `.env` file contains sensitive API keys and database credentials. To protect your accounts:

1. Ensure `.env` is in your `.gitignore` file
2. Never share your `.env` file publicly
3. Rotate API keys immediately if accidentally exposed
4. Use environment variables or secrets managers in production

```bash
# Add to .gitignore if not present
echo ".env" >> .gitignore
```

## 🔧 Troubleshooting

### Database Connection Errors

**Error**: `getaddrinfo ENOTFOUND` or `Tenant or user not found`

**Solution:**
1. Verify you're using the **Transaction Pooler** connection string (port 6543)
2. Check the username format: `postgres.[project-ref]` (not just `postgres`)
3. Ensure the region matches your Supabase project (e.g., `aws-1-eu-west-1`)
4. Get the correct string from Supabase Dashboard → Settings → Database → Connection String → Transaction mode

### FFmpeg Not Found

**Error**: `ffmpeg: command not found`

**Solution:**
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

### API Rate Limits

If you hit API rate limits:
- **OpenRouter**: Upgrade plan or use different model
- **Pexels**: Free tier allows 200 requests/hour
- **Murf.ai**: Check your subscription limits
- **FreeSound**: 2000 requests/day on free tier

### Video Rendering Fails

**Common issues:**
1. Insufficient disk space - Free up storage
2. Invalid media URLs - Check if URLs are accessible
3. FFmpeg memory limits - Reduce video resolution or length
4. Timeout errors - Increase timeout in production settings

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Kill process on port 5000
# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

## 📁 Project Structure

```
tivideo/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   └── lib/           # Utilities
├── server/                 # Express backend
│   ├── services/          # Business logic
│   │   ├── openrouter.ts  # AI script generation
│   │   ├── murf.ts        # Text-to-speech
│   │   ├── pexels.ts      # Stock media
│   │   ├── videoRenderer.ts # FFmpeg rendering
│   │   └── youtube.ts     # YouTube integration
│   ├── routes.ts          # API endpoints
│   └── storage.ts         # Database layer
├── shared/                 # Shared types
│   └── schema.ts          # Database schema
└── .env                    # Environment variables
```

## 🔑 Getting API Keys

### OpenRouter (Required)
1. Visit [openrouter.ai](https://openrouter.ai/)
2. Sign up and get your API key
3. Add credits to your account ($5+ recommended)

### Murf.ai (Required)
1. Go to [murf.ai](https://murf.ai/)
2. Create account and subscribe to a plan
3. Get API key from dashboard

### Pexels (Required)
1. Visit [pexels.com/api](https://www.pexels.com/api/)
2. Sign up for free
3. Copy your API key

### FreeSound (Required)
1. Go to [freesound.org/apiv2/apply](https://freesound.org/apiv2/apply/)
2. Create application
3. Get API key

### YouTube API (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/api/youtube/callback`

## 📊 Usage

1. **Create Account** - Sign up or login
2. **Enter Prompt** - Describe your video idea
3. **Customize Settings** - Choose mood, pace, length, category
4. **Generate Script** - AI creates your video script
5. **Generate Voiceover** - Convert script to speech
6. **Render Video** - Combine everything into final video
7. **Download** - Get your MP4 file
8. **Upload to YouTube** (Optional) - Direct upload from platform

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🆘 Support

For issues or questions:
- Open a GitHub issue
- Check troubleshooting section above
- Review API documentation for each service

## 🙏 Acknowledgments

- **OpenRouter** - AI script generation
- **Murf.ai** - Professional voiceovers
- **Pexels** - High-quality stock media
- **FreeSound** - Royalty-free music
- **FFmpeg** - Video processing
- **Supabase** - Database and authentication

---

Built with ❤️ using React, Node.js, and AI
