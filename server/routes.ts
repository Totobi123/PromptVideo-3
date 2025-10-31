import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateScriptRequestSchema, generateAudioRequestSchema } from "@shared/schema";
import { generateVideoScript } from "./services/openrouter";
import { searchPexelsMedia } from "./services/pexels";
import { generateVoiceover } from "./services/murf";

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate video script with AI
  app.post("/api/generate-script", async (req, res) => {
    try {
      const validatedData = generateScriptRequestSchema.parse(req.body);
      
      // Generate script using DeepSeek via OpenRouter
      const result = await generateVideoScript(validatedData);
      
      // Fetch real stock media URLs for each media item
      const mediaItemsWithUrls = await Promise.all(
        result.mediaItems.map(async (item) => {
          const media = await searchPexelsMedia(item.description, item.type);
          return {
            ...item,
            url: media.url,
            thumbnail: media.thumbnail,
          };
        })
      );

      res.json({
        segments: result.segments,
        mediaItems: mediaItemsWithUrls,
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
      
      const audioUrl = await generateVoiceover(validatedData.text, validatedData.voiceId);
      
      res.json({ audioUrl });
    } catch (error) {
      console.error("Error generating audio:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to generate audio" 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
