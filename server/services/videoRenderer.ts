import ffmpeg from "fluent-ffmpeg";
import { type RenderVideoRequest, type MediaItem } from "@shared/schema";
import { storage } from "../storage";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import { URL } from "url";

interface DownloadedFile {
  path: string;
  duration: number;
}

const ALLOWED_DOMAINS = [
  "images.pexels.com",
  "videos.pexels.com",
  "pixabay.com",
  "freesound.org",
  "murf.ai",
  "cdn.murf.ai"
];

function isUrlSafe(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return false;
    }
    
    const hostname = url.hostname.toLowerCase();
    
    const isAllowed = ALLOWED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith(`.${domain}`)
    );
    
    return isAllowed;
  } catch {
    return false;
  }
}

function parseTime(timeStr: string): number {
  const parts = timeStr.split(":").map(Number);
  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }
  return parseFloat(timeStr);
}

function downloadFile(url: string, dest: string): Promise<void> {
  if (!isUrlSafe(url)) {
    return Promise.reject(new Error(`URL not allowed: ${url}`));
  }
  
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const protocol = url.startsWith("https") ? https : http;
    
    const request = protocol.get(url, (response) => {
      if (response.statusCode && (response.statusCode < 200 || response.statusCode >= 300)) {
        file.close();
        fs.unlink(dest, () => {});
        reject(new Error(`HTTP ${response.statusCode}: ${url}`));
        return;
      }
      
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve();
      });
    });
    
    request.on("error", (err) => {
      file.close();
      fs.unlink(dest, () => {});
      reject(err);
    });
    
    request.setTimeout(30000, () => {
      request.destroy();
      file.close();
      fs.unlink(dest, () => {});
      reject(new Error(`Download timeout: ${url}`));
    });
  });
}

export async function renderVideo(
  jobId: string,
  request: RenderVideoRequest
): Promise<void> {
  const tempDir = path.join(process.cwd(), "temp", jobId);
  const outputDir = path.join(process.cwd(), "output");
  
  try {
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    await storage.updateRenderJob(jobId, { status: "processing", progress: 10 });

    const voiceoverPath = path.join(tempDir, "voiceover.mp3");
    await downloadFile(request.audioUrl, voiceoverPath);

    let musicPath: string | undefined;
    if (request.musicUrl) {
      musicPath = path.join(tempDir, "music.mp3");
      await downloadFile(request.musicUrl, musicPath);
    }

    await storage.updateRenderJob(jobId, { progress: 30 });

    const imageFiles: DownloadedFile[] = [];
    for (let i = 0; i < request.mediaItems.length; i++) {
      const item = request.mediaItems[i];
      if (!item.url) continue;
      
      const ext = item.type === "video" ? "mp4" : "jpg";
      const filePath = path.join(tempDir, `media${i}.${ext}`);
      await downloadFile(item.url, filePath);
      
      const startTime = parseTime(item.startTime);
      const endTime = parseTime(item.endTime);
      let duration = endTime - startTime;
      
      if (duration <= 0 || !isFinite(duration)) {
        console.warn(`Invalid duration for media ${i}: ${duration}s, using 3s default`);
        duration = 3;
      }
      
      duration = Math.max(duration, 0.5);
      
      imageFiles.push({ path: filePath, duration });
    }

    if (imageFiles.length === 0) {
      throw new Error("No media files to render");
    }

    await storage.updateRenderJob(jobId, { progress: 50 });

    const outputPath = path.join(outputDir, `${jobId}.mp4`);
    const musicVolume = request.musicMixing?.backgroundMusicVolume ?? 0.3;
    const voiceVolume = request.musicMixing?.voiceoverVolume ?? 1.0;

    await new Promise<void>((resolve, reject) => {
      const command = ffmpeg();
      
      for (const file of imageFiles) {
        command.input(file.path)
          .inputOptions([
            "-loop", "1",
            "-t", file.duration.toString(),
            "-framerate", "30"
          ]);
      }
      
      command.input(voiceoverPath);
      
      if (musicPath) {
        command.input(musicPath);
      }
      
      const filterParts: string[] = [];
      for (let i = 0; i < imageFiles.length; i++) {
        filterParts.push(`[${i}:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,format=yuv420p[v${i}]`);
      }
      
      const concatInputs = imageFiles.map((_, i) => `[v${i}]`).join("");
      filterParts.push(`${concatInputs}concat=n=${imageFiles.length}:v=1:a=0[vout]`);
      
      const voiceIndex = imageFiles.length;
      
      if (musicPath) {
        const musicIndex = imageFiles.length + 1;
        filterParts.push(`[${voiceIndex}:a]volume=${voiceVolume}[voice]`);
        filterParts.push(`[${musicIndex}:a]volume=${musicVolume}[music]`);
        filterParts.push(`[voice][music]amix=inputs=2:duration=first[aout]`);
        
        command.complexFilter(filterParts.join(";"));
        command.outputOptions(["-map", "[vout]", "-map", "[aout]"]);
      } else {
        command.complexFilter(filterParts.join(";"));
        command.outputOptions(["-map", "[vout]", "-map", `${voiceIndex}:a`]);
      }
      
      command
        .outputOptions([
          "-c:v", "libx264",
          "-pix_fmt", "yuv420p",
          "-preset", "medium",
          "-crf", "23",
          "-c:a", "aac",
          "-b:a", "128k",
          "-shortest"
        ])
        .output(outputPath)
        .on("progress", async (progress) => {
          if (progress.percent) {
            const renderProgress = Math.min(50 + (progress.percent / 2), 99);
            await storage.updateRenderJob(jobId, { progress: Math.round(renderProgress) });
          }
        })
        .on("end", () => resolve())
        .on("error", (err) => reject(err))
        .run();
    });

    const videoUrl = `/output/${jobId}.mp4`;
    await storage.updateRenderJob(jobId, {
      status: "completed",
      progress: 100,
      videoUrl
    });

    fs.rmSync(tempDir, { recursive: true, force: true });

  } catch (error) {
    console.error("Video rendering error:", error);
    await storage.updateRenderJob(jobId, {
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error"
    });
    
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
}
