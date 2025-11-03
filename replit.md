# Tivideo - AI Video Script Generator

## Overview

Tivideo is a web application that generates professional video scripts with AI-powered content, mood-based voiceover recommendations, stock media suggestions, and royalty-free background music. Users can create YouTube-style video scripts by describing their video concept, selecting mood and pace preferences, and receiving timestamped scripts with corresponding visual media recommendations, voice selection, and background music. The platform uses Supabase authentication (email/password and Google OAuth) to secure access and enable future user-specific features.

## Recent Changes

### November 3, 2025 (Latest)
**Supabase Authentication Integration**:
- **User Authentication**: Integrated Supabase for secure user authentication with email/password and Google OAuth support
- **Landing Page**: Created professional landing page with hero section and call-to-action buttons
- **Sign Up/Sign In Pages**: Dedicated authentication pages with email/password forms and Google OAuth buttons
- **Protected Routes**: Dashboard (formerly Home) is now protected and requires authentication to access
- **Session Management**: AuthContext handles user sessions, authentication state, and automatic redirects
- **User Profile**: Header includes user dropdown menu with profile info and sign-out functionality
- **Public/Protected Routing**: Automatic redirects based on authentication state (authenticated users → dashboard, unauthenticated → landing/sign-in)

**Smart Media Source Selection & AI Image Rendering Fix**:
- **Auto-Select (Smart) Media Source**: Added intelligent media source selection that analyzes each scene and automatically chooses between AI generation and stock media. The system uses AI for specific stories, abstract concepts, unique scenarios, detailed characters, and creative content, while using stock media for generic scenes, nature, common objects, and typical activities.
- **Three Media Source Options**: Users can now choose "Stock Images/Videos", "AI Generated Images", or "Auto-Select (Smart)" for optimal results
- **Enhanced Media Descriptions**: AI now generates highly specific, detailed descriptions optimized for both AI generation and stock searches, improving relevance and quality
- **Fixed AI Image Video Rendering**: Resolved critical issue where AI-generated images couldn't be used in video rendering due to local file path restrictions
- **Secure Local File Handling**: Implemented whitelisted directory access for AI-generated images with security validation to prevent directory traversal attacks
- **Per-Item Media Source Suggestion**: Each media item now includes an AI-suggested media source (stock or AI) stored in the `suggestedMediaSource` field

### November 1, 2025
Enhanced category-driven video generation and timing accuracy:
- **Category-Specific Video Output**: Each of the 11 video categories (Tech, Cooking, Travel, Education, Gaming, Fitness, Vlog, Review, Tutorial, Entertainment, Gospel) now has comprehensive guidelines that determine the video's structure, tone, media preferences, CTA style, and keywords
- **Improved Timing Accuracy**: Adjusted words-per-minute calculations to realistic speaking rates (140 WPM normal, 170 WPM fast, 200 WPM very fast) for more accurate video duration
- **Increased Stock Media Coverage**: Boosted stock media items per segment from 3-5 to 6-10 items for better visual coverage throughout videos
- **Enhanced Video/Image Mix**: Strengthened AI prompt to ensure proper mix of both videos (60-70%) and images (30-40%) across all segments
- **Gospel Category Added**: New faith-based content category with appropriate structure, tone, and visual preferences

### November 2, 2025
**Video Rendering System Improvements**:
- **Fixed Video vs Image Handling**: Video clips are now properly processed without looping (using `-t` for trimming), while images correctly use `-loop 1` to create video clips
- **Concat Demuxer Implementation**: Switched from complex filter approach to FFmpeg's concat demuxer for more reliable video concatenation
- **Improved Processing Pipeline**: 
  1. Download all media files
  2. Normalize each file to 1280x720 video-only format
  3. Create concat input list with proper duration directives
  4. Concatenate all media into single video track
  5. Mix audio (voiceover + optional background music)
  6. Combine video and audio into final MP4
- **Better Error Handling**: Added comprehensive logging throughout the rendering process for easier debugging
- **Audio Stream Management**: All normalized media outputs are video-only to prevent stream mismatches during concatenation

**Background Music Integration**:
- **FreeSound Integration**: Switched from Pixabay to FreeSound API for better quality and variety of background music
- **Attribution Support**: System now displays music creator and license information to comply with Creative Commons requirements
- **Enhanced Music Search**: Improved mood-to-keyword mapping for more accurate music selection based on video mood
- **Music Preview & Download**: Users can preview, download, and view attribution for the selected background music

### October 31, 2025
Added mood-based voice selection and background music generation:
- **Mood-Based Voice Selection**: Each mood now automatically selects an appropriate voice from Murf.ai (Happy uses Terrell, Casual uses Natalie, Sad uses Clint, Promotional uses Wayne, Enthusiastic uses Ken)
- **Background Music Generation**: System automatically selects royalty-free background music based on the selected mood
- **Music Preview & Download**: Users can preview and download the selected background music directly from the results page
- **Enhanced Results Display**: New VoiceAndMusicInfo component displays selected voice and music information with interactive controls

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool and development server.

**UI Component System**: The application uses shadcn/ui component library (New York variant) built on Radix UI primitives. This provides a comprehensive set of accessible, customizable components with a modern design system based on CSS variables for theming.

**Styling Approach**: Tailwind CSS with a custom design system featuring dark mode as the default theme. The color palette is inspired by video platforms like YouTube and Runway ML, using a primary red accent (#DC2626) against dark backgrounds (#111827).

**State Management**: React Query (@tanstack/react-query) handles server state and API calls. Local component state manages the multi-step form flow (prompt → details → generating → results).

**Routing**: Uses wouter for lightweight client-side routing with protected and public route handling. Routes include:
- `/` - Landing page (public, redirects to dashboard if authenticated)
- `/signup` - Sign up page (public, redirects to dashboard if authenticated)
- `/signin` - Sign in page (public, redirects to dashboard if authenticated)
- `/dashboard` - Main video generation workflow (protected, requires authentication)

**Form Handling**: React Hook Form with Zod validation for type-safe form management and validation.

### Backend Architecture

**Server Framework**: Express.js running on Node.js with TypeScript for type safety.

**API Design**: RESTful API with two primary endpoints:
- `/api/generate-script`: Accepts video description and preferences, returns timestamped script segments and media recommendations
- `/api/generate-audio`: Generates voiceover audio for script text

**Development Setup**: Custom Vite middleware integration allows the Express server to serve the Vite development environment in development mode, while serving static builds in production.

**Error Handling**: Centralized error handling with request/response logging middleware for debugging and monitoring.

### External Dependencies

**AI Script Generation**: OpenRouter API using GPT-3.5 Turbo for generating video scripts based on user prompts. The system sends detailed prompts including mood, pace, length, audience, and category-specific requirements. Each of the 11 categories (Tech, Cooking, Travel, Education, Gaming, Fitness, Vlog, Review, Tutorial, Entertainment, Gospel) has specific guidelines that shape the video's structure, tone, media preferences, CTA style, and keyword usage. The AI returns structured JSON responses with timestamped segments optimized for the selected category.

**Text-to-Speech**: Murf.ai API for generating voiceover audio. The service uses mood-based voice selection, automatically choosing appropriate voices based on the selected mood (e.g., Terrell for happy, Natalie for casual, Clint for sad).

**Stock Media**: Pexels API for fetching royalty-free images and videos. The application searches for media based on AI-generated descriptions, retrieving URLs and thumbnails for each media item.

**Background Music**: FreeSound API for royalty-free background music. The system searches FreeSound's extensive Creative Commons-licensed music library based on the video's mood, filtering for music tracks between 30-300 seconds in duration. Attribution information (creator name and license) is displayed alongside the music to comply with Creative Commons requirements.

**Authentication**: Supabase (@supabase/supabase-js) provides secure user authentication with email/password and Google OAuth support. Environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are stored securely in Replit Secrets.

**Session Management**: AuthContext manages user sessions using Supabase's authentication state listener. Sessions persist across page refreshes, and automatic redirects ensure proper access control based on authentication state.

**Database**: PostgreSQL configured via Neon serverless driver (@neondatabase/serverless). Drizzle ORM provides type-safe database operations with schema management.

### Data Flow

**Authentication Flow**:
1. User visits landing page and clicks sign up or sign in
2. User authenticates via email/password or Google OAuth
3. Supabase handles authentication and returns session
4. AuthContext updates app state and redirects to dashboard
5. Protected routes check authentication before rendering

**Video Generation Flow**:
1. Authenticated user inputs video description and selects preferences (mood, pace, length)
2. Frontend sends request to `/api/generate-script` with validated parameters
3. Backend calls OpenRouter API to generate structured script with timestamps
4. Backend fetches real stock media URLs from Pexels for each media recommendation
5. Frontend displays results with script timeline and media recommendations
6. Optional: User can request voiceover generation via `/api/generate-audio`

### Key Architectural Decisions

**Supabase Authentication**: The application uses Supabase for secure user authentication with email/password and Google OAuth support. This enables future features like saving video projects, viewing history, and personal preferences while maintaining security best practices.

**Multi-Step Form Flow**: The UI uses a stepped approach (prompt → details → generating → results) to guide users through the generation process. This breaks down complexity and provides clear progress feedback.

**Real-time Media Fetching**: Rather than storing media URLs, the application fetches fresh URLs from Pexels during script generation. This ensures media availability and variety but adds latency to generation time.

**Client-Side Export**: Export functionality (script, audio, media list) is handled entirely client-side, avoiding the need for server-side file generation or storage.

**Development Experience**: Integration of Replit-specific plugins (@replit/vite-plugin-runtime-error-modal, cartographer, dev-banner) enhances the development experience within the Replit environment.

**Type Safety**: Comprehensive TypeScript usage across frontend and backend with Zod schemas for runtime validation ensures type safety at API boundaries and reduces runtime errors.

**Category-Driven Content**: The video category selection is not merely a tag but fundamentally shapes the entire video output. Each category has dedicated guidelines defining:
- Script structure and narrative flow specific to the content type
- Appropriate tone and language style for the category
- Visual media preferences tailored to the category's needs
- CTA (Call-to-Action) styles that resonate with the category's audience
- Category-relevant keywords and terminology

This ensures that a Tech video follows a different structure and uses different visual elements than a Cooking video, creating more authentic and effective content for each category.