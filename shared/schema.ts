import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Video generation schemas
export const generateScriptRequestSchema = z.object({
  prompt: z.string().min(10),
  mood: z.enum(["happy", "casual", "sad", "promotional", "enthusiastic"]),
  pace: z.enum(["normal", "fast", "very_fast"]),
  length: z.number().positive(),
});

export type GenerateScriptRequest = z.infer<typeof generateScriptRequestSchema>;

export const scriptSegmentSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
  text: z.string(),
});

export type ScriptSegment = z.infer<typeof scriptSegmentSchema>;

export const mediaItemSchema = z.object({
  type: z.enum(["image", "video"]),
  startTime: z.string(),
  endTime: z.string(),
  description: z.string(),
  url: z.string().optional(),
  thumbnail: z.string().optional(),
});

export type MediaItem = z.infer<typeof mediaItemSchema>;

export const aiScriptResponseSchema = z.object({
  segments: z.array(scriptSegmentSchema),
  mediaItems: z.array(mediaItemSchema),
});

export const generateScriptResponseSchema = z.object({
  segments: z.array(scriptSegmentSchema),
  mediaItems: z.array(mediaItemSchema),
  voiceId: z.string(),
  voiceName: z.string(),
  musicUrl: z.string().optional(),
  musicTitle: z.string().optional(),
});

export type GenerateScriptResponse = z.infer<typeof generateScriptResponseSchema>;

export const generateAudioRequestSchema = z.object({
  text: z.string(),
  voiceId: z.string().default("en-US-terrell"),
  pace: z.enum(["normal", "fast", "very_fast"]).default("normal"),
});

export type GenerateAudioRequest = z.infer<typeof generateAudioRequestSchema>;

export const generateAudioResponseSchema = z.object({
  audioUrl: z.string(),
});

export type GenerateAudioResponse = z.infer<typeof generateAudioResponseSchema>;
