import { showVideoReadyNotification, showVideoFailedNotification } from "./notifications";

export interface RenderJob {
  jobId: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  videoUrl?: string;
  error?: string;
  startedAt: number;
}

export interface RenderJobCallbacks {
  onProgress?: (progress: number) => void;
  onComplete?: (videoUrl: string) => void;
  onError?: (error: string) => void;
}

class RenderManager {
  private activeJobs: Map<string, RenderJob> = new Map();
  private callbacks: Map<string, RenderJobCallbacks> = new Map();
  private pollInterval: number = 2000;
  private pollTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.loadActiveJobs();
    this.resumePolling();
    
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        this.resumePolling();
      }
    });
  }

  private loadActiveJobs(): void {
    try {
      const stored = localStorage.getItem("active-render-jobs");
      if (stored) {
        const jobs: RenderJob[] = JSON.parse(stored);
        jobs.forEach((job) => {
          if (job.status === "queued" || job.status === "processing" || job.status === "completed") {
            this.activeJobs.set(job.jobId, job);
          }
        });
      }
    } catch (error) {
      console.error("Failed to load active render jobs:", error);
    }
  }

  private saveActiveJobs(): void {
    try {
      const jobs = Array.from(this.activeJobs.values());
      localStorage.setItem("active-render-jobs", JSON.stringify(jobs));
    } catch (error) {
      console.error("Failed to save active render jobs:", error);
    }
  }

  async startRenderJob(
    jobId: string,
    callbacks?: RenderJobCallbacks
  ): Promise<void> {
    const job: RenderJob = {
      jobId,
      status: "queued",
      progress: 0,
      startedAt: Date.now(),
    };

    this.activeJobs.set(jobId, job);
    if (callbacks) {
      this.callbacks.set(jobId, callbacks);
    }
    this.saveActiveJobs();
    this.startPolling(jobId);
  }

  private async pollJobStatus(jobId: string): Promise<void> {
    try {
      const response = await fetch(`/api/render-video/${jobId}`);
      if (!response.ok) {
        throw new Error("Failed to check render status");
      }

      const status = await response.json();
      const job = this.activeJobs.get(jobId);
      if (!job) return;

      job.status = status.status;
      job.progress = status.progress;
      job.videoUrl = status.videoUrl;
      job.error = status.error;

      this.saveActiveJobs();

      const callbacks = this.callbacks.get(jobId);
      if (callbacks?.onProgress) {
        callbacks.onProgress(status.progress);
      }

      if (status.status === "completed") {
        this.handleJobComplete(jobId, status.videoUrl);
      } else if (status.status === "failed") {
        this.handleJobFailed(jobId, status.error);
      }
    } catch (error) {
      console.error(`Error polling job ${jobId}:`, error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.handleJobFailed(jobId, errorMessage);
    }
  }

  private handleJobComplete(jobId: string, videoUrl: string): void {
    const callbacks = this.callbacks.get(jobId);
    if (callbacks?.onComplete) {
      callbacks.onComplete(videoUrl);
    }

    if (document.hidden) {
      showVideoReadyNotification(videoUrl);
    }

    this.stopPolling(jobId);
    this.saveActiveJobs();
  }

  private handleJobFailed(jobId: string, error?: string): void {
    const callbacks = this.callbacks.get(jobId);
    if (callbacks?.onError) {
      callbacks.onError(error || "Unknown error");
    }

    if (document.hidden) {
      showVideoFailedNotification(error);
    }

    this.stopPolling(jobId);
    this.activeJobs.delete(jobId);
    this.callbacks.delete(jobId);
    this.saveActiveJobs();
  }

  private startPolling(jobId: string): void {
    this.stopPolling(jobId);

    const timer = setInterval(() => {
      this.pollJobStatus(jobId);
    }, this.pollInterval);

    this.pollTimers.set(jobId, timer);
    
    this.pollJobStatus(jobId);
  }

  private stopPolling(jobId: string): void {
    const timer = this.pollTimers.get(jobId);
    if (timer) {
      clearInterval(timer);
      this.pollTimers.delete(jobId);
    }
  }

  private resumePolling(): void {
    this.activeJobs.forEach((job, jobId) => {
      if (job.status === "queued" || job.status === "processing") {
        if (!this.pollTimers.has(jobId)) {
          this.startPolling(jobId);
        }
      }
    });
  }

  getActiveJob(jobId: string): RenderJob | undefined {
    return this.activeJobs.get(jobId);
  }

  getAllActiveJobs(): RenderJob[] {
    return Array.from(this.activeJobs.values());
  }

  registerCallbacks(jobId: string, callbacks: RenderJobCallbacks): void {
    this.callbacks.set(jobId, callbacks);
  }

  unregisterCallbacks(jobId: string): void {
    this.callbacks.delete(jobId);
  }

  cancelJob(jobId: string): void {
    this.stopPolling(jobId);
    this.activeJobs.delete(jobId);
    this.callbacks.delete(jobId);
    this.saveActiveJobs();
  }

  acknowledgeJob(jobId: string): void {
    this.activeJobs.delete(jobId);
    this.callbacks.delete(jobId);
    this.saveActiveJobs();
  }

  cleanupOldJobs(maxAge: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    const toDelete: string[] = [];
    
    this.activeJobs.forEach((job, jobId) => {
      if (job.status === "completed" || job.status === "failed") {
        if (now - job.startedAt > maxAge) {
          toDelete.push(jobId);
        }
      }
    });
    
    toDelete.forEach(jobId => {
      this.activeJobs.delete(jobId);
      this.callbacks.delete(jobId);
    });
    
    if (toDelete.length > 0) {
      this.saveActiveJobs();
    }
  }
}

export const renderManager = new RenderManager();
