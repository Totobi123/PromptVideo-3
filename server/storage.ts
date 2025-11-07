import { 
  type User, 
  type InsertUser, 
  type UpdateUserProfile, 
  type RenderVideoRequest, 
  type RenderVideoResponse,
  type YoutubeChannel,
  type InsertYoutubeChannel,
  type YoutubeUpload,
  type InsertYoutubeUpload,
  users,
  renderJobs,
  youtubeChannels,
  youtubeUploads
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(userId: string, profile: UpdateUserProfile): Promise<User | undefined>;
  
  createRenderJob(request: RenderVideoRequest): Promise<RenderVideoResponse>;
  getRenderJob(jobId: string): Promise<RenderVideoResponse | undefined>;
  updateRenderJob(jobId: string, updates: Partial<RenderVideoResponse>): Promise<RenderVideoResponse | undefined>;

  createYoutubeChannel(channel: InsertYoutubeChannel): Promise<YoutubeChannel>;
  getYoutubeChannelByUserId(userId: string): Promise<YoutubeChannel | undefined>;
  getYoutubeChannelById(channelId: string): Promise<YoutubeChannel | undefined>;
  updateYoutubeChannel(channelId: string, updates: Partial<YoutubeChannel>): Promise<YoutubeChannel | undefined>;
  deleteYoutubeChannel(userId: string): Promise<boolean>;

  createYoutubeUpload(upload: InsertYoutubeUpload): Promise<YoutubeUpload>;
  getYoutubeUpload(uploadId: string): Promise<YoutubeUpload | undefined>;
  updateYoutubeUpload(uploadId: string, updates: Partial<YoutubeUpload>): Promise<YoutubeUpload | undefined>;
  getYoutubeUploadsByUserId(userId: string): Promise<YoutubeUpload[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserProfile(userId: string, profile: UpdateUserProfile): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(profile)
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async createRenderJob(request: RenderVideoRequest): Promise<RenderVideoResponse> {
    const jobId = randomUUID();
    await db.insert(renderJobs).values({
      jobId,
      status: "queued",
      progress: "0",
      requestData: request as any,
    });
    
    return {
      jobId,
      status: "queued",
      progress: 0,
    };
  }

  async getRenderJob(jobId: string): Promise<RenderVideoResponse | undefined> {
    const [job] = await db.select().from(renderJobs).where(eq(renderJobs.jobId, jobId));
    if (!job) return undefined;
    
    return {
      jobId: job.jobId,
      status: job.status,
      progress: parseInt(job.progress),
      videoUrl: job.videoUrl || undefined,
      error: job.error || undefined,
    };
  }

  async updateRenderJob(
    jobId: string,
    updates: Partial<RenderVideoResponse>
  ): Promise<RenderVideoResponse | undefined> {
    const dbUpdates: any = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.progress !== undefined) dbUpdates.progress = updates.progress.toString();
    if (updates.videoUrl !== undefined) dbUpdates.videoUrl = updates.videoUrl;
    if (updates.error !== undefined) dbUpdates.error = updates.error;
    
    const [job] = await db
      .update(renderJobs)
      .set({ ...dbUpdates, updatedAt: new Date() })
      .where(eq(renderJobs.jobId, jobId))
      .returning();
    
    if (!job) return undefined;
    
    return {
      jobId: job.jobId,
      status: job.status,
      progress: parseInt(job.progress),
      videoUrl: job.videoUrl || undefined,
      error: job.error || undefined,
    };
  }

  async createYoutubeChannel(insertChannel: InsertYoutubeChannel): Promise<YoutubeChannel> {
    const [channel] = await db
      .insert(youtubeChannels)
      .values(insertChannel)
      .returning();
    return channel;
  }

  async getYoutubeChannelByUserId(userId: string): Promise<YoutubeChannel | undefined> {
    const [channel] = await db
      .select()
      .from(youtubeChannels)
      .where(eq(youtubeChannels.userId, userId));
    return channel || undefined;
  }

  async getYoutubeChannelById(channelId: string): Promise<YoutubeChannel | undefined> {
    const [channel] = await db
      .select()
      .from(youtubeChannels)
      .where(eq(youtubeChannels.id, channelId));
    return channel || undefined;
  }

  async updateYoutubeChannel(
    channelId: string,
    updates: Partial<YoutubeChannel>
  ): Promise<YoutubeChannel | undefined> {
    const [channel] = await db
      .update(youtubeChannels)
      .set(updates)
      .where(eq(youtubeChannels.id, channelId))
      .returning();
    return channel || undefined;
  }

  async deleteYoutubeChannel(userId: string): Promise<boolean> {
    const result = await db
      .delete(youtubeChannels)
      .where(eq(youtubeChannels.userId, userId))
      .returning();
    return result.length > 0;
  }

  async createYoutubeUpload(insertUpload: InsertYoutubeUpload): Promise<YoutubeUpload> {
    const [upload] = await db
      .insert(youtubeUploads)
      .values(insertUpload)
      .returning();
    return upload;
  }

  async getYoutubeUpload(uploadId: string): Promise<YoutubeUpload | undefined> {
    const [upload] = await db
      .select()
      .from(youtubeUploads)
      .where(eq(youtubeUploads.id, uploadId));
    return upload || undefined;
  }

  async updateYoutubeUpload(
    uploadId: string,
    updates: Partial<YoutubeUpload>
  ): Promise<YoutubeUpload | undefined> {
    const [upload] = await db
      .update(youtubeUploads)
      .set(updates)
      .where(eq(youtubeUploads.id, uploadId))
      .returning();
    return upload || undefined;
  }

  async getYoutubeUploadsByUserId(userId: string): Promise<YoutubeUpload[]> {
    return await db
      .select()
      .from(youtubeUploads)
      .where(eq(youtubeUploads.userId, userId));
  }
}

export const storage = new DatabaseStorage();
