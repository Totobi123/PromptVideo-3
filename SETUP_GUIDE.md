# Supabase Generation History Setup Guide

This guide explains how to set up the generation history feature in your Supabase database.

## What You Need

You need to create a table in your Supabase database to store generation history. This table will automatically track:
- Video scripts
- Channel names  
- Video ideas
- Thumbnail generations

All history items automatically expire after 2 hours.

## Setup Instructions

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"

### Step 2: Run the Migration SQL

Copy and paste the entire contents of `SUPABASE_MIGRATION.sql` into the SQL editor and click "Run".

This will create:
- A `generation_history` table to store all generations
- Indexes for fast lookups
- Row Level Security (RLS) policies so users can only see their own history
- Automatic cleanup of expired records

### Step 3: Verify Setup

After running the SQL, you can verify the setup:

1. Go to "Table Editor" in Supabase
2. You should see a new table called `generation_history`
3. The table should have these columns:
   - `id` (uuid, primary key)
   - `user_id` (uuid, not null)
   - `type` (text, not null)
   - `prompt` (text, nullable)
   - `result` (jsonb, not null)
   - `created_at` (timestamp)
   - `expires_at` (timestamp)

### Step 4: Test It Out

1. Make sure your Supabase URL and anon key are set in your environment variables
2. Sign in to the app
3. Generate a script, channel name, video idea, or thumbnail
4. The generation will automatically be saved to your history
5. You'll see it appear in the history sidebar (if implemented on that page)

## How It Works

### Backend

- Every successful generation is automatically saved to Supabase
- History items expire after 2 hours
- A background cleanup task runs every 5 minutes to remove expired items
- User authentication is handled via JWT tokens

### Frontend

- The `GenerationHistory` component fetches and displays history
- Auto-refreshes every 30 seconds to show new items
- Only shows items that belong to the logged-in user
- Displays how long ago each item was created and when it expires

## Security

- Row Level Security (RLS) ensures users can only access their own history
- All API requests require authentication via Supabase JWT tokens
- The backend validates user identity before saving or retrieving history

## Troubleshooting

**History not showing up?**
- Make sure you ran the migration SQL in Supabase
- Check that your Supabase URL and anon key are correctly set
- Verify you're logged in
- Check the browser console for errors

**Getting 404 errors?**
- Make sure the `/api/history` endpoint is working
- Verify the backend server is running

**Items expiring too quickly?**
- The default expiration is 2 hours
- You can modify this in `server/routes.ts` by changing the `expiresAt` calculation
