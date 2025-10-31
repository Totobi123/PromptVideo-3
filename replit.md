# Tivideo - AI Video Script Generator

## Overview

Tivideo is a web application that generates professional video scripts with AI-powered content, mood-based voiceover recommendations, stock media suggestions, and royalty-free background music. Users can create YouTube-style video scripts by describing their video concept, selecting mood and pace preferences, and receiving timestamped scripts with corresponding visual media recommendations, voice selection, and background music. The platform requires no user authentication and focuses on a streamlined, single-page generation workflow.

## Recent Changes (October 31, 2025)

Added mood-based voice selection and background music generation:
- **Mood-Based Voice Selection**: Each mood now automatically selects an appropriate voice from Murf.ai (Happy uses Terrell, Casual uses Natalie, Sad uses Clint, Promotional uses Wayne, Enthusiastic uses Ken)
- **Background Music Generation**: System automatically selects royalty-free background music from Kevin MacLeod's incompetech.com library based on the selected mood
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

**AI Script Generation**: OpenRouter API using the DeepSeek chat model (`deepseek/deepseek-chat-v3.1:free`) for generating video scripts based on user prompts. The system sends detailed prompts including mood, pace, and length requirements, receiving structured JSON responses with timestamped segments.

**Text-to-Speech**: Murf.ai API for generating voiceover audio. The service uses mood-based voice selection, automatically choosing appropriate voices based on the selected mood (e.g., Terrell for happy, Natalie for casual, Clint for sad).

**Stock Media**: Pexels API for fetching royalty-free images and videos. The application searches for media based on AI-generated descriptions, retrieving URLs and thumbnails for each media item.

**Background Music**: Curated library of royalty-free music from Kevin MacLeod (incompetech.com). All tracks are CC BY 4.0 licensed. The system selects appropriate music based on the video's mood, providing variety within each mood category.

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