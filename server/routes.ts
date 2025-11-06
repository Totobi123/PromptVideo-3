import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  generateScriptRequestSchema, 
  generateAudioRequestSchema,
  improvePromptRequestSchema,
  suggestDetailsRequestSchema,
  renderVideoRequestSchema,
  updateUserProfileSchema,
  generateChannelNameRequestSchema,
  generateNicheSuggestionsRequestSchema,
  explainNicheRequestSchema,
  generateChannelNameListRequestSchema,
  generateVideoIdeaRequestSchema,
  generateThumbnailRequestSchema,
  getHistoryRequestSchema,
  updateUserSettingsSchema
} from "@shared/schema";
import { generateVideoScript, improvePrompt, suggestDetails, generateChannelName, generateNicheSuggestions, explainNiche, generateChannelNameList, generateVideoIdea } from "./services/openrouter";
import { searchPexelsMedia } from "./services/pexels";
import { generateAIImage } from "./services/cloudflare-ai";
import { generateVoiceover, getVoiceForMood } from "./services/murf";
import { searchBackgroundMusic } from "./services/freesound";
import { renderVideo, getAudioDuration, recalculateMediaTimestamps } from "./services/videoRenderer";
import { supabase } from "./lib/supabase";
import { getAuthUrl, exchangeCodeForTokens, getChannelAnalytics, uploadVideoToYoutube } from "./services/youtube";
import { generateChannelInsights } from "./services/youtubeAI";
import path from "path";

async function saveToHistory(
  userId: string | undefined,
  type: 'script' | 'channel_name' | 'video_idea' | 'thumbnail' | 'audio',
  prompt: string | undefined,
  result: any
) {
  if (!userId) {
    console.log('⚠️ saveToHistory: No userId provided, skipping save');
    return;
  }
  
  if (!supabase) {
    console.log('⚠️ saveToHistory: Supabase client not available, skipping save');
    return;
  }
  
  try {
    console.log(`📝 Saving ${type} to history for user ${userId.substring(0, 8)}...`);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 2);

    const { data, error } = await (supabase as any)
      .from('generation_history')
      .insert({
        user_id: userId,
        type,
        prompt,
        result,
        expires_at: expiresAt.toISOString()
      })
      .select();
    
    if (error) {
      console.error('❌ Failed to save to history:', error.message);
      throw error;
    }
    
    console.log(`✅ Successfully saved ${type} to history`);
  } catch (error) {
    console.error('❌ Failed to save to history:', error);
  }
}

async function cleanupExpiredHistory() {
  if (!supabase) return;
  
  try {
    await (supabase as any)
      .from('generation_history')
      .delete()
      .lt('expires_at', new Date().toISOString());
  } catch (error) {
    console.error('Failed to cleanup expired history:', error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  setInterval(cleanupExpiredHistory, 5 * 60 * 1000);
  cleanupExpiredHistory();
  // Generate video script with AI
  app.post("/api/generate-script", async (req, res) => {
    try {
      const validatedData = generateScriptRequestSchema.parse(req.body);
      
      console.log("=== GENERATE SCRIPT REQUEST ===");
      console.log("Media Source Selected:", validatedData.mediaSource);
      console.log("===============================");
      
      // Generate script using DeepSeek via OpenRouter
      const result = await generateVideoScript(validatedData);
      
      // Get mood-appropriate voice
      const voiceInfo = getVoiceForMood(validatedData.mood);
      
      // Combine all script text for audio generation
      const fullScriptText = result.segments.map(seg => seg.text).join(" ");
      
      // Fetch background music, media URLs (stock or AI), and generate audio in parallel
      const [musicInfo, mediaItemsWithUrls, audioUrl] = await Promise.all([
        searchBackgroundMusic(validatedData.mood),
        Promise.all(
          result.mediaItems.map(async (item, index) => {
            let media;
            // Determine which media source to use
            let effectiveMediaSource = validatedData.mediaSource;
            if (validatedData.mediaSource === "auto") {
              // Use AI's suggestion, default to stock if not provided
              effectiveMediaSource = item.suggestedMediaSource || "stock";
              console.log(`Auto-selecting ${effectiveMediaSource} for media ${index + 1} based on AI suggestion`);
            }
            
            if (effectiveMediaSource === "ai") {
              console.log(`Generating AI image ${index + 1}/${result.mediaItems.length}: "${item.description}"`);
              media = await generateAIImage(item.description);
              console.log(`AI image ${index + 1} generated:`, media.url ? "SUCCESS" : "FAILED");
            } else {
              console.log(`Fetching stock media ${index + 1}/${result.mediaItems.length}: "${item.description}"`);
              media = await searchPexelsMedia(item.description, item.type);
            }
            return {
              ...item,
              type: effectiveMediaSource === "ai" ? "image" : item.type,
              url: media.url,
              thumbnail: media.thumbnail,
            };
          })
        ),
        generateVoiceover(fullScriptText, voiceInfo.voiceId, validatedData.pace, voiceInfo.style),
      ]);

      // Get actual audio duration and recalculate media timestamps to match
      let finalMediaItems = mediaItemsWithUrls;
      try {
        const actualAudioDuration = await getAudioDuration(audioUrl);
        console.log(`Actual voiceover duration: ${actualAudioDuration.toFixed(2)}s`);
        console.log(`Requested video length: ${validatedData.length}s`);
        
        finalMediaItems = recalculateMediaTimestamps(mediaItemsWithUrls, actualAudioDuration);
        console.log(`Recalculated ${finalMediaItems.length} media items to match audio duration`);
      } catch (error) {
        console.error("Failed to recalculate media timestamps:", error);
        // Continue with original timestamps if recalculation fails
      }

      const response = {
        segments: result.segments,
        mediaItems: finalMediaItems,
        voiceId: voiceInfo.voiceId,
        voiceName: voiceInfo.voiceName,
        audioUrl,
        musicUrl: musicInfo?.url,
        musicTitle: musicInfo?.title,
        musicCreator: musicInfo?.creator,
        musicLicense: musicInfo?.license,
        seoPackage: result.seoPackage,
        chapters: result.chapters,
        ctaPlacements: result.ctaPlacements,
        musicMixing: result.musicMixing,
      };

      await saveToHistory(
        req.header('x-user-id'),
        'script',
        validatedData.prompt,
        response
      );

      res.json(response);
    } catch (error) {
      console.error("Error generating script:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to generate script" 
      });
    }
  });

  // Generate voiceover audio
  app.post("/api/generate-audio", async (req, res) => {
    try {
      const validatedData = generateAudioRequestSchema.parse(req.body);
      
      const audioUrl = await generateVoiceover(
        validatedData.text, 
        validatedData.voiceId,
        validatedData.pace
      );
      
      const result = { audioUrl };
      
      await saveToHistory(
        req.header('x-user-id'),
        'audio',
        validatedData.text.substring(0, 100),
        result
      );
      
      res.json(result);
    } catch (error) {
      console.error("Error generating audio:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to generate audio" 
      });
    }
  });

  // Improve prompt with AI
  app.post("/api/improve-prompt", async (req, res) => {
    try {
      const validatedData = improvePromptRequestSchema.parse(req.body);
      
      const improvedPrompt = await improvePrompt(validatedData.prompt);
      
      res.json({ improvedPrompt });
    } catch (error) {
      console.error("Error improving prompt:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to improve prompt" 
      });
    }
  });

  // Suggest video details based on prompt
  app.post("/api/suggest-details", async (req, res) => {
    try {
      const validatedData = suggestDetailsRequestSchema.parse(req.body);
      
      const suggestions = await suggestDetails(validatedData.prompt);
      
      res.json(suggestions);
    } catch (error) {
      console.error("Error suggesting details:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to suggest details" 
      });
    }
  });

  // Render video from script, media, and audio
  app.post("/api/render-video", async (req, res) => {
    try {
      const validatedData = renderVideoRequestSchema.parse(req.body);
      
      const job = await storage.createRenderJob(validatedData);
      
      renderVideo(job.jobId, validatedData).catch(err => {
        console.error("Background render error:", err);
      });
      
      res.json(job);
    } catch (error) {
      console.error("Error starting render:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to start render" 
      });
    }
  });

  // Get render job status
  app.get("/api/render-video/:jobId", async (req, res) => {
    try {
      const { jobId } = req.params;
      
      const job = await storage.getRenderJob(jobId);
      
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      res.json(job);
    } catch (error) {
      console.error("Error getting render status:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to get render status" 
      });
    }
  });

  // Update user profile with onboarding data
  app.patch("/api/user/:userId/profile", async (req, res) => {
    try {
      const { userId } = req.params;
      const validatedData = updateUserProfileSchema.parse(req.body);
      
      const updatedUser = await storage.updateUserProfile(userId, validatedData);
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to update user profile" 
      });
    }
  });

  // Generate unique channel name and logo based on niche
  app.post("/api/generate-channel", async (req, res) => {
    try {
      const validatedData = generateChannelNameRequestSchema.parse(req.body);
      
      const result = await generateChannelName(validatedData.niche);
      
      await saveToHistory(
        req.header('x-user-id'),
        'channel_name',
        validatedData.niche,
        result
      );
      
      res.json(result);
    } catch (error) {
      console.error("Error generating channel name:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to generate channel name" 
      });
    }
  });

  app.post("/api/generate-niche-suggestions", async (req, res) => {
    try {
      const validatedData = generateNicheSuggestionsRequestSchema.parse(req.body);
      
      const result = await generateNicheSuggestions(validatedData);
      
      res.json(result);
    } catch (error) {
      console.error("Error generating niche suggestions:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to generate niche suggestions" 
      });
    }
  });

  app.post("/api/explain-niche", async (req, res) => {
    try {
      const validatedData = explainNicheRequestSchema.parse(req.body);
      
      const result = await explainNiche(validatedData.niche);
      
      res.json(result);
    } catch (error) {
      console.error("Error explaining niche:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to explain niche" 
      });
    }
  });

  app.post("/api/generate-channel-name-list", async (req, res) => {
    try {
      const validatedData = generateChannelNameListRequestSchema.parse(req.body);
      
      const result = await generateChannelNameList(validatedData.niche, validatedData.count);
      
      res.json(result);
    } catch (error) {
      console.error("Error generating channel name list:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to generate channel name list" 
      });
    }
  });

  // Generate video idea based on niche
  app.post("/api/generate-video-idea", async (req, res) => {
    try {
      const validatedData = generateVideoIdeaRequestSchema.parse(req.body);
      
      const result = await generateVideoIdea(validatedData);
      
      await saveToHistory(
        req.header('x-user-id'),
        'video_idea',
        validatedData.niche,
        result
      );
      
      res.json(result);
    } catch (error) {
      console.error("Error generating video idea:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to generate video idea" 
      });
    }
  });

  // Generate thumbnail
  app.post("/api/generate-thumbnail", async (req, res) => {
    try {
      const validatedData = generateThumbnailRequestSchema.parse(req.body);
      
      const thumbnailUrl = await generateAIImage(
        `YouTube thumbnail: ${validatedData.title}. Style: ${validatedData.style}, professional, eye-catching, high quality`
      );
      
      const result = { thumbnailUrl: thumbnailUrl.url };
      
      await saveToHistory(
        req.header('x-user-id'),
        'thumbnail',
        validatedData.title,
        result
      );
      
      res.json(result);
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to generate thumbnail" 
      });
    }
  });

  // Get generation history
  app.get("/api/history", async (req, res) => {
    try {
      if (!supabase) {
        return res.json([]);
      }

      const userId = req.header('x-user-id');
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { type, limit } = getHistoryRequestSchema.parse({
        type: req.query.type,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      });

      let query = (supabase as any)
        .from('generation_history')
        .select('*')
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(limit);

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) throw error;

      res.json(data || []);
    } catch (error) {
      console.error("Error fetching history:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to fetch history" 
      });
    }
  });

  // Delete history item
  app.delete("/api/history/:id", async (req, res) => {
    try {
      if (!supabase) {
        return res.status(503).json({ error: "Database not available" });
      }

      const userId = req.header('x-user-id');
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id } = req.params;

      const { error } = await (supabase as any)
        .from('generation_history')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting history item:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to delete history item" 
      });
    }
  });

  // Analytics endpoints
  app.get("/api/analytics/generation-counts", async (req, res) => {
    try {
      if (!supabase) {
        return res.json({ scripts: 0, videos: 0, channelNames: 0, ideas: 0, thumbnails: 0, audio: 0 });
      }

      const userId = req.header('x-user-id');
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { data, error } = await (supabase as any)
        .from('generation_history')
        .select('type')
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString());

      if (error) throw error;

      const counts = {
        scripts: 0,
        videos: 0,
        channelNames: 0,
        ideas: 0,
        thumbnails: 0,
        audio: 0,
      };

      data?.forEach((item: any) => {
        if (item.type === 'script') counts.scripts++;
        else if (item.type === 'channel_name') counts.channelNames++;
        else if (item.type === 'video_idea') counts.ideas++;
        else if (item.type === 'thumbnail') counts.thumbnails++;
        else if (item.type === 'audio') counts.audio++;
      });

      res.json(counts);
    } catch (error) {
      console.error("Error fetching generation counts:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to fetch generation counts" 
      });
    }
  });

  app.get("/api/analytics/usage-over-time", async (req, res) => {
    try {
      if (!supabase) {
        return res.json({ data: [] });
      }

      const userId = req.header('x-user-id');
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const period = req.query.period as string || 'daily';
      const now = new Date();
      let daysBack = 7;
      
      if (period === 'weekly') daysBack = 28;
      else if (period === 'monthly') daysBack = 90;

      const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

      const { data, error } = await (supabase as any)
        .from('generation_history')
        .select('created_at')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      const groupedData: { [key: string]: number } = {};
      
      data?.forEach((item: any) => {
        const date = new Date(item.created_at);
        let key: string;
        
        if (period === 'daily') {
          key = date.toISOString().split('T')[0];
        } else if (period === 'weekly') {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
        } else {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }
        
        groupedData[key] = (groupedData[key] || 0) + 1;
      });

      const result = Object.entries(groupedData).map(([date, count]) => ({
        date,
        count,
      }));

      res.json({ data: result });
    } catch (error) {
      console.error("Error fetching usage over time:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to fetch usage over time" 
      });
    }
  });

  app.get("/api/analytics/most-used-settings", async (req, res) => {
    try {
      if (!supabase) {
        return res.json({ moods: [], paces: [], categories: [] });
      }

      const userId = req.header('x-user-id');
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { data, error } = await (supabase as any)
        .from('generation_history')
        .select('result')
        .eq('user_id', userId)
        .eq('type', 'script')
        .gt('expires_at', new Date().toISOString());

      if (error) throw error;

      const moodCounts: { [key: string]: number } = {};
      const paceCounts: { [key: string]: number } = {};
      const categoryCounts: { [key: string]: number } = {};

      data?.forEach((item: any) => {
        const result = item.result;
        if (result.mood) moodCounts[result.mood] = (moodCounts[result.mood] || 0) + 1;
        if (result.pace) paceCounts[result.pace] = (paceCounts[result.pace] || 0) + 1;
        if (result.category) categoryCounts[result.category] = (categoryCounts[result.category] || 0) + 1;
      });

      const moods = Object.entries(moodCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const paces = Object.entries(paceCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      const categories = Object.entries(categoryCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      res.json({ moods, paces, categories });
    } catch (error) {
      console.error("Error fetching most used settings:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to fetch most used settings" 
      });
    }
  });

  app.get("/api/analytics/quick-stats", async (req, res) => {
    try {
      if (!supabase) {
        return res.json({ 
          averageScriptLength: 0, 
          mostCommonAspectRatio: '16:9', 
          totalRenderTime: 0, 
          totalGenerations: 0 
        });
      }

      const userId = req.header('x-user-id');
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { data, error } = await (supabase as any)
        .from('generation_history')
        .select('*')
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString());

      if (error) throw error;

      let totalScriptLength = 0;
      let scriptCount = 0;
      const aspectRatioCounts: { [key: string]: number } = {};
      let totalRenderTime = 0;

      data?.forEach((item: any) => {
        const result = item.result;
        
        if (item.type === 'script' && result.segments) {
          const scriptText = result.segments.map((s: any) => s.text).join(' ');
          totalScriptLength += scriptText.length;
          scriptCount++;
          
          if (result.aspectRatio) {
            aspectRatioCounts[result.aspectRatio] = (aspectRatioCounts[result.aspectRatio] || 0) + 1;
          }
          
          if (result.segments.length > 0) {
            const lastSegment = result.segments[result.segments.length - 1];
            if (lastSegment.endTime) {
              const [minutes, seconds] = lastSegment.endTime.split(':').map(Number);
              totalRenderTime += minutes * 60 + seconds;
            }
          }
        }
      });

      const averageScriptLength = scriptCount > 0 ? Math.round(totalScriptLength / scriptCount) : 0;
      
      let mostCommonAspectRatio = '16:9';
      let maxCount = 0;
      Object.entries(aspectRatioCounts).forEach(([ratio, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mostCommonAspectRatio = ratio;
        }
      });

      res.json({
        averageScriptLength,
        mostCommonAspectRatio,
        totalRenderTime,
        totalGenerations: data?.length || 0,
      });
    } catch (error) {
      console.error("Error fetching quick stats:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to fetch quick stats" 
      });
    }
  });

  // User settings endpoints
  app.get("/api/user/settings", async (req, res) => {
    try {
      if (!supabase) {
        return res.status(503).json({ error: "Database not available" });
      }

      const userId = req.header('x-user-id');
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { data, error } = await (supabase as any)
        .from('users')
        .select('default_mood, default_pace, default_category, default_media_source, default_aspect_ratio, notifications_enabled, email_notifications_enabled')
        .eq('id', userId)
        .single();

      if (error) throw error;

      res.json({
        defaultMood: data?.default_mood,
        defaultPace: data?.default_pace,
        defaultCategory: data?.default_category,
        defaultMediaSource: data?.default_media_source,
        defaultAspectRatio: data?.default_aspect_ratio,
        notificationsEnabled: data?.notifications_enabled,
        emailNotificationsEnabled: data?.email_notifications_enabled,
      });
    } catch (error) {
      console.error("Error fetching user settings:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to fetch user settings" 
      });
    }
  });

  app.patch("/api/user/settings", async (req, res) => {
    try {
      if (!supabase) {
        return res.status(503).json({ error: "Database not available" });
      }

      const userId = req.header('x-user-id');
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const validatedData = updateUserSettingsSchema.parse(req.body);
      
      const updateData: any = {};
      if (validatedData.defaultMood !== undefined) updateData.default_mood = validatedData.defaultMood;
      if (validatedData.defaultPace !== undefined) updateData.default_pace = validatedData.defaultPace;
      if (validatedData.defaultCategory !== undefined) updateData.default_category = validatedData.defaultCategory;
      if (validatedData.defaultMediaSource !== undefined) updateData.default_media_source = validatedData.defaultMediaSource;
      if (validatedData.defaultAspectRatio !== undefined) updateData.default_aspect_ratio = validatedData.defaultAspectRatio;
      if (validatedData.notificationsEnabled !== undefined) updateData.notifications_enabled = validatedData.notificationsEnabled;
      if (validatedData.emailNotificationsEnabled !== undefined) updateData.email_notifications_enabled = validatedData.emailNotificationsEnabled;

      const { data, error } = await (supabase as any)
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      res.json({
        defaultMood: data?.default_mood,
        defaultPace: data?.default_pace,
        defaultCategory: data?.default_category,
        defaultMediaSource: data?.default_media_source,
        defaultAspectRatio: data?.default_aspect_ratio,
        notificationsEnabled: data?.notifications_enabled,
        emailNotificationsEnabled: data?.email_notifications_enabled,
      });
    } catch (error) {
      console.error("Error updating user settings:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to update user settings" 
      });
    }
  });

  app.get("/api/user/export-data", async (req, res) => {
    try {
      if (!supabase) {
        return res.status(503).json({ error: "Database not available" });
      }

      const userId = req.header('x-user-id');
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const [userData, historyData] = await Promise.all([
        (supabase as any)
          .from('users')
          .select('*')
          .eq('id', userId)
          .single(),
        (supabase as any)
          .from('generation_history')
          .select('*')
          .eq('user_id', userId)
          .gt('expires_at', new Date().toISOString())
      ]);

      if (userData.error) throw userData.error;
      if (historyData.error) throw historyData.error;

      const exportData = {
        user: userData.data,
        generationHistory: historyData.data,
        exportedAt: new Date().toISOString(),
      };

      res.json(exportData);
    } catch (error) {
      console.error("Error exporting user data:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to export user data" 
      });
    }
  });

  // YouTube OAuth initialization
  app.post("/api/youtube/auth/init", async (req, res) => {
    try {
      const userId = req.header('x-user-id');
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const redirectUri = req.body.redirectUri || `${process.env.REPL_URL || 'http://localhost:5000'}/youtube/callback`;
      const authUrl = getAuthUrl(redirectUri);
      
      res.json({ authUrl });
    } catch (error) {
      console.error("Error initializing YouTube OAuth:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to initialize OAuth" 
      });
    }
  });

  // YouTube OAuth callback
  app.post("/api/youtube/auth/callback", async (req, res) => {
    try {
      const userId = req.header('x-user-id');
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { code, redirectUri } = req.body;
      if (!code) {
        return res.status(400).json({ error: "Authorization code is required" });
      }

      const existingChannel = await storage.getYoutubeChannelByUserId(userId);
      if (existingChannel) {
        await storage.deleteYoutubeChannel(userId);
      }

      const tokenData = await exchangeCodeForTokens(code, redirectUri);
      
      const channel = await storage.createYoutubeChannel({
        userId,
        channelId: tokenData.channelInfo.channelId,
        channelTitle: tokenData.channelInfo.channelTitle,
        channelDescription: tokenData.channelInfo.channelDescription,
        thumbnailUrl: tokenData.channelInfo.thumbnailUrl,
        subscriberCount: tokenData.channelInfo.subscriberCount,
        videoCount: tokenData.channelInfo.videoCount,
        viewCount: tokenData.channelInfo.viewCount,
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        tokenExpiresAt: tokenData.expiresAt,
        lastSyncedAt: null,
      });

      res.json({
        success: true,
        channel: {
          channelId: channel.channelId,
          channelTitle: channel.channelTitle,
          subscriberCount: channel.subscriberCount,
        },
      });
    } catch (error) {
      console.error("Error handling YouTube OAuth callback:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to connect YouTube channel" 
      });
    }
  });

  // Get connected YouTube channel
  app.get("/api/youtube/channel", async (req, res) => {
    try {
      const userId = req.header('x-user-id');
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const channel = await storage.getYoutubeChannelByUserId(userId);
      if (!channel) {
        return res.status(404).json({ error: "No YouTube channel connected" });
      }

      res.json({
        channelId: channel.channelId,
        channelTitle: channel.channelTitle,
        channelDescription: channel.channelDescription,
        thumbnailUrl: channel.thumbnailUrl,
        subscriberCount: channel.subscriberCount,
        videoCount: channel.videoCount,
        viewCount: channel.viewCount,
        connectedAt: channel.connectedAt,
      });
    } catch (error) {
      console.error("Error getting YouTube channel:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to get channel info" 
      });
    }
  });

  // Disconnect YouTube channel
  app.delete("/api/youtube/channel", async (req, res) => {
    try {
      const userId = req.header('x-user-id');
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const deleted = await storage.deleteYoutubeChannel(userId);
      if (!deleted) {
        return res.status(404).json({ error: "No YouTube channel connected" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error disconnecting YouTube channel:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to disconnect channel" 
      });
    }
  });

  // Get YouTube channel analytics with AI insights
  app.get("/api/youtube/analytics", async (req, res) => {
    try {
      const userId = req.header('x-user-id');
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const channel = await storage.getYoutubeChannelByUserId(userId);
      if (!channel) {
        return res.status(404).json({ error: "No YouTube channel connected" });
      }

      const analyticsData = await getChannelAnalytics(channel);
      
      const aiInsights = await generateChannelInsights(analyticsData);

      await storage.updateYoutubeChannel(channel.id, {
        lastSyncedAt: new Date(),
        subscriberCount: analyticsData.channelInfo.subscriberCount.toString(),
        videoCount: analyticsData.channelInfo.videoCount.toString(),
        viewCount: analyticsData.channelInfo.viewCount.toString(),
      });

      res.json({
        ...analyticsData,
        aiInsights,
      });
    } catch (error) {
      console.error("Error getting YouTube analytics:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to get analytics" 
      });
    }
  });

  // Publish video to YouTube
  app.post("/api/youtube/publish", async (req, res) => {
    try {
      const userId = req.header('x-user-id');
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { renderJobId, title, description, thumbnailUrl, tags, categoryId, privacyStatus } = req.body;
      
      if (!renderJobId || !title) {
        return res.status(400).json({ error: "Render job ID and title are required" });
      }

      const channel = await storage.getYoutubeChannelByUserId(userId);
      if (!channel) {
        return res.status(404).json({ error: "No YouTube channel connected" });
      }

      const renderJob = await storage.getRenderJob(renderJobId);
      if (!renderJob) {
        return res.status(404).json({ error: "Render job not found" });
      }

      if (renderJob.status !== "completed" || !renderJob.videoUrl) {
        return res.status(400).json({ error: "Video is not ready for upload" });
      }

      const upload = await storage.createYoutubeUpload({
        userId,
        youtubeChannelId: channel.id,
        youtubeVideoId: null,
        renderJobId,
        title,
        description: description || "",
        thumbnailUrl: thumbnailUrl || null,
        status: "uploading",
        progress: "0",
        videoUrl: null,
        publishedAt: null,
        error: null,
      });

      const videoPath = path.join(process.cwd(), "output", `${renderJobId}.mp4`);

      uploadVideoToYoutube(channel, videoPath, {
        title,
        description: description || "",
        tags: tags || [],
        categoryId: categoryId || "22",
        privacyStatus: privacyStatus || "public",
      }).then(async (result) => {
        await storage.updateYoutubeUpload(upload.id, {
          status: "completed",
          progress: "100",
          youtubeVideoId: result.videoId,
          videoUrl: result.videoUrl,
          publishedAt: new Date(),
        });
      }).catch(async (error) => {
        console.error("Error uploading to YouTube:", error);
        await storage.updateYoutubeUpload(upload.id, {
          status: "failed",
          error: error.message,
        });
      });

      res.json({
        uploadId: upload.id,
        status: "uploading",
      });
    } catch (error) {
      console.error("Error publishing to YouTube:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to publish video" 
      });
    }
  });

  // Get YouTube upload status
  app.get("/api/youtube/uploads/:uploadId", async (req, res) => {
    try {
      const { uploadId } = req.params;
      const userId = req.header('x-user-id');
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const upload = await storage.getYoutubeUpload(uploadId);
      if (!upload) {
        return res.status(404).json({ error: "Upload not found" });
      }

      if (upload.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      res.json(upload);
    } catch (error) {
      console.error("Error getting upload status:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to get upload status" 
      });
    }
  });

  // Get all YouTube uploads for user
  app.get("/api/youtube/uploads", async (req, res) => {
    try {
      const userId = req.header('x-user-id');
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const uploads = await storage.getYoutubeUploadsByUserId(userId);
      res.json(uploads);
    } catch (error) {
      console.error("Error getting uploads:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to get uploads" 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
