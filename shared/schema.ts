import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  howFoundUs: text("how_found_us"),
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
  defaultMood: text("default_mood"),
  defaultPace: text("default_pace"),
  defaultCategory: text("default_category"),
  defaultMediaSource: text("default_media_source"),
  defaultAspectRatio: text("default_aspect_ratio"),
  notificationsEnabled: text("notifications_enabled").default("false"),
  emailNotificationsEnabled: text("email_notifications_enabled").default("false"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const updateUserProfileSchema = z.object({
  howFoundUs: z.string().optional(),
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
  defaultMood: z.string().optional(),
  defaultPace: z.string().optional(),
  defaultCategory: z.string().optional(),
  defaultMediaSource: z.string().optional(),
  defaultAspectRatio: z.string().optional(),
  notificationsEnabled: z.string().optional(),
  emailNotificationsEnabled: z.string().optional(),
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

export const generateNicheSuggestionsRequestSchema = z.object({
  userInterests: z.string().optional(),
  useCase: z.string().optional(),
});

export type GenerateNicheSuggestionsRequest = z.infer<typeof generateNicheSuggestionsRequestSchema>;

export const generateNicheSuggestionsResponseSchema = z.object({
  niches: z.array(z.string()),
});

export type GenerateNicheSuggestionsResponse = z.infer<typeof generateNicheSuggestionsResponseSchema>;

export const explainNicheRequestSchema = z.object({
  niche: z.string(),
});

export type ExplainNicheRequest = z.infer<typeof explainNicheRequestSchema>;

export const explainNicheResponseSchema = z.object({
  explanation: z.string(),
});

export type ExplainNicheResponse = z.infer<typeof explainNicheResponseSchema>;

export const generateChannelNameRequestSchema = z.object({
  niche: z.string(),
});

export type GenerateChannelNameRequest = z.infer<typeof generateChannelNameRequestSchema>;

export const generateChannelNameResponseSchema = z.object({
  channelName: z.string(),
  logoUrl: z.string(),
});

export type GenerateChannelNameResponse = z.infer<typeof generateChannelNameResponseSchema>;

export const generateChannelNameListRequestSchema = z.object({
  niche: z.string(),
  count: z.number().default(5),
});

export type GenerateChannelNameListRequest = z.infer<typeof generateChannelNameListRequestSchema>;

export const generateChannelNameListResponseSchema = z.object({
  channelNames: z.array(z.string()),
});

export type GenerateChannelNameListResponse = z.infer<typeof generateChannelNameListResponseSchema>;

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

// Generation history schemas
export const generationHistory = pgTable("generation_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  type: text("type").notNull(),
  prompt: text("prompt"),
  result: jsonb("result").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const insertGenerationHistorySchema = createInsertSchema(generationHistory).omit({
  id: true,
  createdAt: true,
});

export type InsertGenerationHistory = z.infer<typeof insertGenerationHistorySchema>;
export type GenerationHistory = typeof generationHistory.$inferSelect;

export const getHistoryRequestSchema = z.object({
  type: z.enum(["script", "channel_name", "video_idea", "thumbnail", "audio"]).optional(),
  limit: z.number().default(10),
});

// User settings schemas
export const updateUserSettingsSchema = z.object({
  defaultMood: z.enum(["happy", "casual", "sad", "promotional", "enthusiastic"]).optional(),
  defaultPace: z.enum(["normal", "fast", "very_fast"]).optional(),
  defaultCategory: z.enum(["tech", "cooking", "travel", "education", "gaming", "fitness", "vlog", "review", "tutorial", "entertainment", "gospel"]).optional(),
  defaultMediaSource: z.enum(["stock", "ai", "auto"]).optional(),
  defaultAspectRatio: z.enum(["16:9", "9:16"]).optional(),
  notificationsEnabled: z.string().optional(),
  emailNotificationsEnabled: z.string().optional(),
});

export type UpdateUserSettings = z.infer<typeof updateUserSettingsSchema>;

// Analytics response schemas
export const generationCountsResponseSchema = z.object({
  scripts: z.number(),
  videos: z.number(),
  channelNames: z.number(),
  ideas: z.number(),
  thumbnails: z.number(),
  audio: z.number(),
});

export type GenerationCountsResponse = z.infer<typeof generationCountsResponseSchema>;

export const usageOverTimeResponseSchema = z.object({
  data: z.array(z.object({
    date: z.string(),
    count: z.number(),
  })),
});

export type UsageOverTimeResponse = z.infer<typeof usageOverTimeResponseSchema>;

export const mostUsedSettingsResponseSchema = z.object({
  moods: z.array(z.object({
    name: z.string(),
    count: z.number(),
  })),
  paces: z.array(z.object({
    name: z.string(),
    count: z.number(),
  })),
  categories: z.array(z.object({
    name: z.string(),
    count: z.number(),
  })),
});

export type MostUsedSettingsResponse = z.infer<typeof mostUsedSettingsResponseSchema>;

export const quickStatsResponseSchema = z.object({
  averageScriptLength: z.number(),
  mostCommonAspectRatio: z.string(),
  totalRenderTime: z.number(),
  totalGenerations: z.number(),
});

export type QuickStatsResponse = z.infer<typeof quickStatsResponseSchema>;

// YouTube channel connection schemas
export const youtubeChannels = pgTable("youtube_channels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  channelId: text("channel_id").notNull().unique(),
  channelTitle: text("channel_title").notNull(),
  channelDescription: text("channel_description"),
  thumbnailUrl: text("thumbnail_url"),
  subscriberCount: text("subscriber_count"),
  videoCount: text("video_count"),
  viewCount: text("view_count"),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  tokenExpiresAt: timestamp("token_expires_at").notNull(),
  connectedAt: timestamp("connected_at").defaultNow().notNull(),
  lastSyncedAt: timestamp("last_synced_at"),
});

export const insertYoutubeChannelSchema = createInsertSchema(youtubeChannels).omit({
  id: true,
  connectedAt: true,
});

export type InsertYoutubeChannel = z.infer<typeof insertYoutubeChannelSchema>;
export type YoutubeChannel = typeof youtubeChannels.$inferSelect;

// YouTube video uploads tracking
export const youtubeUploads = pgTable("youtube_uploads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  youtubeChannelId: text("youtube_channel_id").notNull(),
  youtubeVideoId: text("youtube_video_id"),
  renderJobId: text("render_job_id"),
  title: text("title").notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  status: text("status").notNull().default("uploading"),
  progress: text("progress").default("0"),
  videoUrl: text("video_url"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  publishedAt: timestamp("published_at"),
  error: text("error"),
});

export const insertYoutubeUploadSchema = createInsertSchema(youtubeUploads).omit({
  id: true,
  uploadedAt: true,
});

export type InsertYoutubeUpload = z.infer<typeof insertYoutubeUploadSchema>;
export type YoutubeUpload = typeof youtubeUploads.$inferSelect;

// Render jobs tracking
export const renderJobs = pgTable("render_jobs", {
  jobId: varchar("job_id").primaryKey(),
  status: text("status").notNull().default("queued"),
  progress: text("progress").notNull().default("0"),
  videoUrl: text("video_url"),
  error: text("error"),
  requestData: jsonb("request_data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertRenderJobSchema = createInsertSchema(renderJobs).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertRenderJob = z.infer<typeof insertRenderJobSchema>;
export type RenderJob = typeof renderJobs.$inferSelect;

// YouTube OAuth and analytics schemas
export const youtubeOAuthInitRequestSchema = z.object({
  redirectUri: z.string().url(),
});

export type YoutubeOAuthInitRequest = z.infer<typeof youtubeOAuthInitRequestSchema>;

export const youtubeOAuthInitResponseSchema = z.object({
  authUrl: z.string().url(),
});

export type YoutubeOAuthInitResponse = z.infer<typeof youtubeOAuthInitResponseSchema>;

export const youtubeOAuthCallbackRequestSchema = z.object({
  code: z.string(),
  redirectUri: z.string().url(),
});

export type YoutubeOAuthCallbackRequest = z.infer<typeof youtubeOAuthCallbackRequestSchema>;

export const youtubeAnalyticsResponseSchema = z.object({
  channelInfo: z.object({
    channelId: z.string(),
    title: z.string(),
    description: z.string(),
    thumbnailUrl: z.string(),
    subscriberCount: z.number(),
    videoCount: z.number(),
    viewCount: z.number(),
  }),
  recentVideos: z.array(z.object({
    videoId: z.string(),
    title: z.string(),
    description: z.string(),
    thumbnailUrl: z.string(),
    publishedAt: z.string(),
    viewCount: z.number(),
    likeCount: z.number(),
    commentCount: z.number(),
    duration: z.string(),
  })),
  analytics: z.object({
    totalViews: z.number(),
    totalWatchTime: z.number(),
    averageViewDuration: z.number(),
    subscriberChange: z.number(),
    estimatedRevenue: z.number().optional(),
  }),
  aiInsights: z.object({
    performanceSummary: z.string(),
    strengths: z.array(z.string()),
    improvements: z.array(z.string()),
    recommendations: z.array(z.string()),
    trendingTopics: z.array(z.string()),
  }),
});

export type YoutubeAnalyticsResponse = z.infer<typeof youtubeAnalyticsResponseSchema>;

export const publishToYoutubeRequestSchema = z.object({
  renderJobId: z.string(),
  title: z.string().min(1).max(100),
  description: z.string().max(5000),
  thumbnailUrl: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  categoryId: z.string().optional(),
  privacyStatus: z.enum(["public", "private", "unlisted"]).default("public"),
});

export type PublishToYoutubeRequest = z.infer<typeof publishToYoutubeRequestSchema>;

export const publishToYoutubeResponseSchema = z.object({
  uploadId: z.string(),
  status: z.string(),
  youtubeVideoId: z.string().optional(),
  videoUrl: z.string().optional(),
});

export type PublishToYoutubeResponse = z.infer<typeof publishToYoutubeResponseSchema>;
