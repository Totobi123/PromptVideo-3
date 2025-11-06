import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  useCase: text("use_case"),
  userType: text("user_type"),
  companyName: text("company_name"),
  companySize: text("company_size"),
  onboardingCompleted: text("onboarding_completed").default("false"),
  hasYoutubeChannel: text("has_youtube_channel"),
  channelDescription: text("channel_description"),
  selectedNiche: text("selected_niche"),
  channelName: text("channel_name"),
  channelLogo: text("channel_logo"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const updateUserProfileSchema = z.object({
  useCase: z.string().optional(),
  userType: z.string().optional(),
  companyName: z.string().optional(),
  companySize: z.string().optional(),
  onboardingCompleted: z.string().optional(),
  hasYoutubeChannel: z.string().optional(),
  channelDescription: z.string().optional(),
  selectedNiche: z.string().optional(),
  channelName: z.string().optional(),
  channelLogo: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type User = typeof users.$inferSelect;

// Video generation schemas
export const generateScriptRequestSchema = z.object({
  prompt: z.string().min(10, "Prompt must be at least 10 characters"),
  mood: z.enum(["happy", "casual", "sad", "promotional", "enthusiastic"]),
  pace: z.enum(["normal", "fast", "very_fast"]),
  length: z.number().positive(),
  audience: z.enum(["kids", "teens", "adults", "professionals", "general"]),
  category: z.enum(["tech", "cooking", "travel", "education", "gaming", "fitness", "vlog", "review", "tutorial", "entertainment", "gospel"]),
  mediaSource: z.enum(["stock", "ai", "auto"]).default("stock"),
});

export type GenerateScriptRequest = z.infer<typeof generateScriptRequestSchema>;

export const scriptSegmentSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
  text: z.string(),
  emotionMarkers: z.array(z.object({
    word: z.string(),
    emotion: z.string(),
  })).optional(),
});

export type ScriptSegment = z.infer<typeof scriptSegmentSchema>;

export const mediaItemSchema = z.object({
  type: z.enum(["image", "video"]),
  startTime: z.string(),
  endTime: z.string(),
  description: z.string(),
  url: z.string().optional(),
  thumbnail: z.string().optional(),
  isThumbnailCandidate: z.boolean().optional(),
  suggestedMediaSource: z.enum(["stock", "ai"]).optional(),
  transition: z.enum([
    "fade", 
    "cut",
    "fadeblack", 
    "fadewhite", 
    "distance", 
    "wipeleft", 
    "wiperight", 
    "wipeup", 
    "wipedown", 
    "slideleft", 
    "slideright", 
    "slideup", 
    "slidedown", 
    "circlecrop", 
    "rectcrop", 
    "circleopen", 
    "circleclose", 
    "dissolve"
  ]).default("fade").optional(),
  keyframeEffect: z.enum([
    "none",
    "zoomin",
    "zoomout",
    "panleft",
    "panright",
    "panup",
    "pandown",
    "kenburns",
    "zoominslow",
    "zoomoutslow",
    "zoominfast",
    "zoomoutfast",
    "panleftup",
    "panrightup",
    "panleftdown",
    "panrightdown",
    "rotate",
    "spiral",
    "shake",
    "drift"
  ]).default("none").optional(),
});

export type MediaItem = z.infer<typeof mediaItemSchema>;

export const aiScriptResponseSchema = z.object({
  segments: z.array(scriptSegmentSchema),
  mediaItems: z.array(mediaItemSchema),
  seoPackage: z.object({
    title: z.string(),
    description: z.string(),
    hashtags: z.array(z.string()),
  }).optional(),
  chapters: z.array(z.object({
    timestamp: z.string(),
    title: z.string(),
  })).optional(),
  ctaPlacements: z.array(z.object({
    timestamp: z.string(),
    type: z.string(),
    message: z.string(),
  })).optional(),
  musicMixing: z.object({
    backgroundMusicVolume: z.number(),
    voiceoverVolume: z.number(),
    fadeInDuration: z.number(),
    fadeOutDuration: z.number(),
  }).optional(),
});

export const generateScriptResponseSchema = z.object({
  segments: z.array(scriptSegmentSchema),
  mediaItems: z.array(mediaItemSchema),
  voiceId: z.string(),
  voiceName: z.string(),
  audioUrl: z.string().optional(),
  musicUrl: z.string().optional(),
  musicTitle: z.string().optional(),
  musicCreator: z.string().optional(),
  musicLicense: z.string().optional(),
  seoPackage: z.object({
    title: z.string(),
    description: z.string(),
    hashtags: z.array(z.string()),
  }).optional(),
  chapters: z.array(z.object({
    timestamp: z.string(),
    title: z.string(),
  })).optional(),
  ctaPlacements: z.array(z.object({
    timestamp: z.string(),
    type: z.string(),
    message: z.string(),
  })).optional(),
  musicMixing: z.object({
    backgroundMusicVolume: z.number(),
    voiceoverVolume: z.number(),
    fadeInDuration: z.number(),
    fadeOutDuration: z.number(),
  }).optional(),
});

export type GenerateScriptResponse = z.infer<typeof generateScriptResponseSchema>;

export const generateAudioRequestSchema = z.object({
  text: z.string(),
  voiceId: z.string().default("en-US-natalie"),
  pace: z.enum(["normal", "fast", "very_fast"]).default("normal"),
});

export type GenerateAudioRequest = z.infer<typeof generateAudioRequestSchema>;

export const generateAudioResponseSchema = z.object({
  audioUrl: z.string(),
});

export type GenerateAudioResponse = z.infer<typeof generateAudioResponseSchema>;

// Prompt improvement schemas
export const improvePromptRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty"),
});

export type ImprovePromptRequest = z.infer<typeof improvePromptRequestSchema>;

export const improvePromptResponseSchema = z.object({
  improvedPrompt: z.string(),
});

export type ImprovePromptResponse = z.infer<typeof improvePromptResponseSchema>;

// Auto-suggest details schemas
export const suggestDetailsRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty"),
});

export type SuggestDetailsRequest = z.infer<typeof suggestDetailsRequestSchema>;

export const suggestDetailsResponseSchema = z.object({
  mood: z.enum(["happy", "casual", "sad", "promotional", "enthusiastic"]),
  category: z.enum(["tech", "cooking", "travel", "education", "gaming", "fitness", "vlog", "review", "tutorial", "entertainment", "gospel"]),
  pace: z.enum(["normal", "fast", "very_fast"]),
  audience: z.enum(["kids", "teens", "adults", "professionals", "general"]),
  length: z.number().positive(),
});

export type SuggestDetailsResponse = z.infer<typeof suggestDetailsResponseSchema>;

// Video rendering schemas
export const renderVideoRequestSchema = z.object({
  segments: z.array(scriptSegmentSchema),
  mediaItems: z.array(mediaItemSchema),
  audioUrl: z.string().url(),
  musicUrl: z.string().url().optional(),
  aspectRatio: z.enum(["16:9", "9:16"]).default("16:9"),
  fitMode: z.enum(["fit", "crop"]).default("fit"),
  musicMixing: z.object({
    backgroundMusicVolume: z.number().min(0).max(1).default(0.3),
    voiceoverVolume: z.number().min(0).max(1).default(1.0),
    fadeInDuration: z.number().min(0).default(1),
    fadeOutDuration: z.number().min(0).default(1),
  }).optional(),
});

export type RenderVideoRequest = z.infer<typeof renderVideoRequestSchema>;

export const renderVideoResponseSchema = z.object({
  jobId: z.string(),
  status: z.enum(["queued", "processing", "completed", "failed"]),
  progress: z.number().min(0).max(100),
  videoUrl: z.string().optional(),
  error: z.string().optional(),
});

export type RenderVideoResponse = z.infer<typeof renderVideoResponseSchema>;

// Niche-based content generation schemas
export const YOUTUBE_NICHES = [
  "Tech Reviews & Tutorials",
  "Gaming & Esports",
  "Cooking & Food",
  "Travel & Adventure",
  "Fitness & Health",
  "Beauty & Fashion",
  "Personal Finance & Investing",
  "DIY & Crafts",
  "Music & Entertainment",
  "Education & Learning",
  "Vlogging & Lifestyle",
  "Comedy & Sketches",
  "Science & Technology",
  "Business & Entrepreneurship",
  "Motivation & Self-Help",
  "Parenting & Family",
  "Sports & Athletics",
  "Art & Design",
  "Photography & Videography",
  "Gaming Commentary"
] as const;

export const generateChannelNameRequestSchema = z.object({
  niche: z.string(),
});

export type GenerateChannelNameRequest = z.infer<typeof generateChannelNameRequestSchema>;

export const generateChannelNameResponseSchema = z.object({
  channelName: z.string(),
  logoUrl: z.string(),
});

export type GenerateChannelNameResponse = z.infer<typeof generateChannelNameResponseSchema>;

export const generateVideoIdeaRequestSchema = z.object({
  niche: z.string(),
  channelDescription: z.string().optional(),
});

export type GenerateVideoIdeaRequest = z.infer<typeof generateVideoIdeaRequestSchema>;

export const generateVideoIdeaResponseSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.string(),
  mood: z.string(),
  audience: z.string(),
  length: z.number(),
  seoTitle: z.string(),
  seoDescription: z.string(),
  hashtags: z.array(z.string()),
});

export type GenerateVideoIdeaResponse = z.infer<typeof generateVideoIdeaResponseSchema>;

export const generateThumbnailRequestSchema = z.object({
  title: z.string(),
  niche: z.string(),
  style: z.enum(["bold", "minimal", "dramatic", "colorful"]).default("bold"),
});

export type GenerateThumbnailRequest = z.infer<typeof generateThumbnailRequestSchema>;

export const generateThumbnailResponseSchema = z.object({
  thumbnailUrl: z.string(),
});

export type GenerateThumbnailResponse = z.infer<typeof generateThumbnailResponseSchema>;
