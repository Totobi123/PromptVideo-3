import { 
  type User, 
  type InsertUser, 
  type UpdateUserProfile, 
  type RenderVideoRequest, 
  type RenderVideoResponse,
  type YoutubeChannel,
  type InsertYoutubeChannel,
  type YoutubeUpload,
  type InsertYoutubeUpload
} from "@shared/schema";
import { randomUUID } from "crypto";

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

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private renderJobs: Map<string, RenderVideoResponse>;
  private youtubeChannels: Map<string, YoutubeChannel>;
  private youtubeUploads: Map<string, YoutubeUpload>;

  constructor() {
    this.users = new Map();
    this.renderJobs = new Map();
    this.youtubeChannels = new Map();
    this.youtubeUploads = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      howFoundUs: null,
      useCase: null,
      userType: null,
      companyName: null,
      companySize: null,
      onboardingCompleted: "false",
      hasYoutubeChannel: null,
      channelDescription: null,
      selectedNiche: null,
      channelName: null,
      channelLogo: null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserProfile(userId: string, profile: UpdateUserProfile): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, ...profile };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async createRenderJob(request: RenderVideoRequest): Promise<RenderVideoResponse> {
    const jobId = randomUUID();
    const job: RenderVideoResponse = {
      jobId,
      status: "queued",
      progress: 0,
    };
    this.renderJobs.set(jobId, job);
    return job;
  }

  async getRenderJob(jobId: string): Promise<RenderVideoResponse | undefined> {
    return this.renderJobs.get(jobId);
  }

  async updateRenderJob(
    jobId: string,
    updates: Partial<RenderVideoResponse>
  ): Promise<RenderVideoResponse | undefined> {
    const job = this.renderJobs.get(jobId);
    if (!job) return undefined;
    
    const updatedJob = { ...job, ...updates };
    this.renderJobs.set(jobId, updatedJob);
    return updatedJob;
  }

  async createYoutubeChannel(insertChannel: InsertYoutubeChannel): Promise<YoutubeChannel> {
    const id = randomUUID();
    const channel: YoutubeChannel = {
      ...insertChannel,
      id,
      connectedAt: new Date(),
      lastSyncedAt: null,
    };
    this.youtubeChannels.set(id, channel);
    return channel;
  }

  async getYoutubeChannelByUserId(userId: string): Promise<YoutubeChannel | undefined> {
    return Array.from(this.youtubeChannels.values()).find(
      (channel) => channel.userId === userId
    );
  }

  async getYoutubeChannelById(channelId: string): Promise<YoutubeChannel | undefined> {
    return this.youtubeChannels.get(channelId);
  }

  async updateYoutubeChannel(
    channelId: string,
    updates: Partial<YoutubeChannel>
  ): Promise<YoutubeChannel | undefined> {
    const channel = this.youtubeChannels.get(channelId);
    if (!channel) return undefined;

    const updatedChannel = { ...channel, ...updates };
    this.youtubeChannels.set(channelId, updatedChannel);
    return updatedChannel;
  }

  async deleteYoutubeChannel(userId: string): Promise<boolean> {
    const channel = await this.getYoutubeChannelByUserId(userId);
    if (!channel) return false;

    this.youtubeChannels.delete(channel.id);
    return true;
  }

  async createYoutubeUpload(insertUpload: InsertYoutubeUpload): Promise<YoutubeUpload> {
    const id = randomUUID();
    const upload: YoutubeUpload = {
      ...insertUpload,
      id,
      uploadedAt: new Date(),
      publishedAt: null,
    };
    this.youtubeUploads.set(id, upload);
    return upload;
  }

  async getYoutubeUpload(uploadId: string): Promise<YoutubeUpload | undefined> {
    return this.youtubeUploads.get(uploadId);
  }

  async updateYoutubeUpload(
    uploadId: string,
    updates: Partial<YoutubeUpload>
  ): Promise<YoutubeUpload | undefined> {
    const upload = this.youtubeUploads.get(uploadId);
    if (!upload) return undefined;

    const updatedUpload = { ...upload, ...updates };
    this.youtubeUploads.set(uploadId, updatedUpload);
    return updatedUpload;
  }

  async getYoutubeUploadsByUserId(userId: string): Promise<YoutubeUpload[]> {
    return Array.from(this.youtubeUploads.values()).filter(
      (upload) => upload.userId === userId
    );
  }
}

export const storage = new MemStorage();
