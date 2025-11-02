# Tivideo - AI Video Script Generator

## Overview

Tivideo is a web application that generates professional video scripts with AI-powered content, mood-based voiceover recommendations, stock media suggestions, and royalty-free background music. Users can create YouTube-style video scripts by describing their video concept, selecting mood and pace preferences, and receiving timestamped scripts with corresponding visual media recommendations, voice selection, and background music. The platform requires no user authentication and focuses on a streamlined, single-page generation workflow.

## Recent Changes

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

**Routing**: Uses wouter for lightweight client-side routing, though the application is primarily single-page with the home route handling the main workflow.

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

**Database**: PostgreSQL configured via Neon serverless driver (@neondatabase/serverless). Drizzle ORM provides type-safe database operations with schema management. Currently, the schema includes a basic users table (not actively used for the no-login workflow), suggesting potential future authentication features.

**Session Management**: Infrastructure exists for session management via connect-pg-simple (PostgreSQL session store), though not currently utilized due to the no-login requirement.

### Data Flow

1. User inputs video description and selects preferences (mood, pace, length)
2. Frontend sends request to `/api/generate-script` with validated parameters
3. Backend calls OpenRouter API to generate structured script with timestamps
4. Backend fetches real stock media URLs from Pexels for each media recommendation
5. Frontend displays results with script timeline and media recommendations
6. Optional: User can request voiceover generation via `/api/generate-audio`

### Key Architectural Decisions

**No Authentication**: The application intentionally avoids user authentication to reduce friction. This decision enables instant access but limits features like saving history or user preferences.

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