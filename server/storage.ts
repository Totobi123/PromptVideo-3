import { type User, type InsertUser, type RenderVideoRequest, type RenderVideoResponse } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createRenderJob(request: RenderVideoRequest): Promise<RenderVideoResponse>;
  getRenderJob(jobId: string): Promise<RenderVideoResponse | undefined>;
  updateRenderJob(jobId: string, updates: Partial<RenderVideoResponse>): Promise<RenderVideoResponse | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private renderJobs: Map<string, RenderVideoResponse>;

  constructor() {
    this.users = new Map();
    this.renderJobs = new Map();
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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
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
}

export const storage = new MemStorage();
