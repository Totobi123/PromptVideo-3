import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  generateScriptRequestSchema, 
  generateAudioRequestSchema,
  improvePromptRequestSchema,
  suggestDetailsRequestSchema 
} from "@shared/schema";
import { generateVideoScript, improvePrompt, suggestDetails } from "./services/openrouter";
import { searchPexelsMedia } from "./services/pexels";
import { generateVoiceover, getVoiceForMood } from "./services/murf";
import { searchBackgroundMusic } from "./services/freesound";

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate video script with AI
  app.post("/api/generate-script", async (req, res) => {
    try {
      const validatedData = generateScriptRequestSchema.parse(req.body);
      
      // Generate script using DeepSeek via OpenRouter
      const result = await generateVideoScript(validatedData);
      
      // Get mood-appropriate voice
      const voiceInfo = getVoiceForMood(validatedData.mood);
      
      // Combine all script text for audio generation
      const fullScriptText = result.segments.map(seg => seg.text).join(" ");
      
      // Fetch background music, stock media URLs, and generate audio in parallel
      const [musicInfo, mediaItemsWithUrls, audioUrl] = await Promise.all([
        searchBackgroundMusic(validatedData.mood),
        Promise.all(
          result.mediaItems.map(async (item) => {
            const media = await searchPexelsMedia(item.description, item.type);
            return {
              ...item,
              url: media.url,
              thumbnail: media.thumbnail,
            };
          })
        ),
        generateVoiceover(fullScriptText, voiceInfo.voiceId, validatedData.pace, voiceInfo.style),
      ]);

      res.json({
        segments: result.segments,
        mediaItems: mediaItemsWithUrls,
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
      });
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

  const httpServer = createServer(app);

  return httpServer;
}
