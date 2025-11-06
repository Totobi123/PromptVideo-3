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
  generateVideoIdeaRequestSchema,
  generateThumbnailRequestSchema,
  getHistoryRequestSchema
} from "@shared/schema";
import { generateVideoScript, improvePrompt, suggestDetails, generateChannelName, generateVideoIdea } from "./services/openrouter";
import { searchPexelsMedia } from "./services/pexels";
import { generateAIImage } from "./services/cloudflare-ai";
import { generateVoiceover, getVoiceForMood } from "./services/murf";
import { searchBackgroundMusic } from "./services/freesound";
import { renderVideo, getAudioDuration, recalculateMediaTimestamps } from "./services/videoRenderer";
import { supabase } from "./lib/supabase";

async function saveToHistory(
  userId: string | undefined,
  type: 'script' | 'channel_name' | 'video_idea' | 'thumbnail',
  prompt: string | undefined,
  result: any
) {
  if (!userId || !supabase) return;
  
  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 2);

    await (supabase as any)
      .from('generation_history')
      .insert({
        user_id: userId,
        type,
        prompt,
        result,
        expires_at: expiresAt.toISOString()
      });
  } catch (error) {
    console.error('Failed to save to history:', error);
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
      
      res.json({ audioUrl });
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

  const httpServer = createServer(app);

  return httpServer;
}
