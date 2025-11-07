# Tivideo - AI Video Script Generator

## Overview

Tivideo is a web application designed to generate professional video scripts using AI. It provides AI-powered content, mood-based voiceover recommendations, stock media suggestions, and royalty-free background music. Users can create YouTube-style video scripts by describing their concept, selecting mood and pace, and receiving timestamped scripts with visual media recommendations, voice selections, and background music. The platform aims to streamline video content creation, offering tools for efficient script development and media integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite.
**UI Component System**: shadcn/ui (New York variant) built on Radix UI.
**Styling**: Tailwind CSS with a custom design system, dark mode default, and a primary red accent.
**State Management**: React Query for server state; local component state for multi-step forms.
**Routing**: Wouter for client-side routing, handling public and protected routes (`/`, `/signup`, `/signin`, `/dashboard`, `/dashboard/my-project`, `/dashboard/analytics`, `/dashboard/settings`).
**Form Handling**: React Hook Form with Zod validation.
**My Project**: User-specific project dashboard that displays all generations (scripts, channel names, video ideas, thumbnails, audio) with 2-hour expiration, auto-refreshing every 30 seconds. All content is automatically saved to Supabase and accessible across devices.

### Backend Architecture

**Server Framework**: Express.js on Node.js with TypeScript.
**API Design**: RESTful API with endpoints for generation, rendering, and history retrieval.
**Development Setup**: Custom Vite middleware integrates Express with the Vite development environment.
**Authentication Middleware**: Extracts user ID from Supabase JWT tokens and passes to API routes.

### System Design Choices

**Supabase Authentication**: Secure user authentication via email/password and Google OAuth.
**My Project Storage**: All generations (scripts, channel names, video ideas, thumbnails, audio) are automatically saved to Supabase with 2-hour expiration. Each generation is tied to the user's account for cross-device access. Content is queryable by type and automatic cleanup runs every 5 minutes to remove expired records.
**User Onboarding Survey**: First-time users complete a multi-step survey after signup/login that collects use case (social media, blogging, marketing, etc.), user type (student, teacher, company, freelancer, etc.), and conditional company details (name and size if user type is "Company"). Data is stored in Supabase user metadata and the survey only appears once per user.
**Multi-Step Form Flow**: Guides users through script generation (prompt → details → generating → results).
**Real-time Media Fetching**: Fetches fresh media URLs from Pexels during script generation to ensure availability.
**Client-Side Export**: All export functionality (script, audio, media list) is handled client-side.
**Type Safety**: Extensive TypeScript usage with Zod schemas for validation.
**Category-Driven Content**: 11 video categories (Tech, Cooking, Travel, Education, Gaming, Fitness, Vlog, Review, Tutorial, Entertainment, Gospel) with specific guidelines for script structure, tone, media preferences, CTA styles, and keywords, ensuring tailored output for each category.
**Smart Media Source Selection**: Automatically chooses between AI generation and stock media based on scene analysis, with options for "Stock Images/Videos", "AI Generated Images", or "Auto-Select (Smart)".
**Aspect Ratio Selection**: Users can select between 16:9 (landscape, 1920x1080) for YouTube/desktop or 9:16 (portrait, 1080x1920) for Instagram/TikTok/mobile platforms before rendering their video.
**Scaling Mode Selection**: Users can choose how media is scaled to fit the selected aspect ratio: "Fit (Add Padding)" maintains original aspect ratio and adds black bars if needed, while "Crop (Zoom to Fill)" scales media to fill the frame completely, cropping excess content for a seamless fit.
**Video Rendering System**: Uses FFmpeg's xfade filter for professional video transitions with 0.8s duration between scenes. Supports 17 transition types: fade, cut, fadeblack, fadewhite, distance, wipeleft, wiperight, wipeup, wipedown, slideleft, slideright, slideup, slidedown, circlecrop, rectcrop, circleopen, circleclose, and dissolve. Features 19 keyframe motion effects per scene: none, zoomin, zoomout, panleft, panright, panup, pandown, kenburns, zoominslow, zoomoutslow, zoominfast, zoomoutfast, panleftup, panrightup, panleftdown, panrightdown, rotate, spiral, shake, and drift. Includes keyframe intervals (every 60 frames) for improved video quality, seeking performance, and web playback optimization with faststart flag. Media scaling applies appropriate FFmpeg filters based on user's fitMode choice: force_original_aspect_ratio=decrease with padding for "fit" mode, or force_original_aspect_ratio=increase with crop for "crop" mode.
**Background Video Rendering**: Video rendering continues in the background even when users switch tabs or close the page. The render manager uses localStorage to persist job state and automatically resumes polling when the page is reopened. Browser notifications alert users when rendering completes (if permission is granted and the tab is not active). Completed renders persist for 24 hours and are automatically cleaned up. Users can enable/disable notifications via a bell icon next to the render button.
**Usage Analytics Dashboard**: Comprehensive analytics system tracking all user generations with real-time statistics including:
  - Generation counters by type (scripts, channel names, video ideas, thumbnails, audio files)
  - Usage over time visualization with daily, weekly, and monthly views using recharts
  - Most frequently used settings analysis (top moods, paces, and categories)
  - Quick stats including average script length, total render time, and most common aspect ratio
  - All analytics data is aggregated from the generation_history table in real-time
**User Settings & Preferences**: Centralized settings management allowing users to:
  - Configure browser and email notifications for video generation completion
  - Set default preferences (mood, pace, category, media source, aspect ratio) that auto-populate in generation forms
  - View YouTube channel connection status and connect/disconnect YouTube channels
  - Export all user data and generation history in JSON format
  - Manage account settings including account deletion
  - All settings are stored in the users table and synced across devices via Supabase
**YouTube Integration**: Full YouTube channel integration with OAuth 2.0 authentication allowing users to:
  - Connect their YouTube channels via Google OAuth with secure credential management
  - View real-time channel statistics (subscribers, videos, total views) and connection status
  - Access quick insights including average views per video and subscriber-to-video ratio
  - Navigate to AI-powered analytics for detailed channel performance insights and recommendations
  - Upload rendered videos directly to YouTube from the results page with customizable metadata (title, description, privacy settings)
  - Automatically disconnect and clean up channel data when needed
  - All YouTube credentials are stored securely in Replit Secrets (YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET)
  - Note: Using manual YouTube OAuth credentials instead of Replit YouTube integration (user dismissed integration setup)

## External Dependencies

**AI Script Generation**: OpenRouter API (GPT-3.5 Turbo) for generating structured, timestamped video scripts based on user prompts and category-specific guidelines.
**Text-to-Speech**: Murf.ai API for generating voiceover audio with mood-based voice selection. Each mood (happy, casual, sad, promotional, enthusiastic) has 3 voice options that are randomly selected for variety.
**Stock Media**: Pexels API for royalty-free images and videos.
**Background Music**: FreeSound API for royalty-free, Creative Commons-licensed background music, with attribution support.
**Authentication**: Supabase for user authentication (email/password, Google OAuth) and session management.
**Database**: PostgreSQL via Supabase for generation history storage with Row Level Security (RLS) policies. Local storage uses Neon serverless driver with Drizzle ORM for type-safe operations.