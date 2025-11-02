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

    console.log(`[${jobId}] Starting video render process`);
    await storage.updateRenderJob(jobId, { status: "processing", progress: 5 });

    const voiceoverPath = path.join(tempDir, "voiceover.mp3");
    console.log(`[${jobId}] Downloading voiceover from ${request.audioUrl}`);
    await downloadFile(request.audioUrl, voiceoverPath);

    let musicPath: string | undefined;
    if (request.musicUrl) {
      musicPath = path.join(tempDir, "music.mp3");
      console.log(`[${jobId}] Downloading background music from ${request.musicUrl}`);
      await downloadFile(request.musicUrl, musicPath);
    }

    await storage.updateRenderJob(jobId, { progress: 15 });

    const mediaFiles: DownloadedFile[] = [];
    const normalizedFiles: string[] = [];
    
    console.log(`[${jobId}] Processing ${request.mediaItems.length} media items`);
    for (let i = 0; i < request.mediaItems.length; i++) {
      const item = request.mediaItems[i];
      if (!item.url) {
        console.warn(`[${jobId}] Skipping media item ${i} - no URL provided`);
        continue;
      }
      
      const ext = item.type === "video" ? "mp4" : "jpg";
      const rawFilePath = path.join(tempDir, `raw_media${i}.${ext}`);
      const normalizedFilePath = path.join(tempDir, `media${i}.mp4`);
      
      console.log(`[${jobId}] Downloading media ${i} (${item.type}): ${item.url}`);
      await downloadFile(item.url, rawFilePath);
      
      const startTime = parseTime(item.startTime);
      const endTime = parseTime(item.endTime);
      let duration = endTime - startTime;
      
      if (duration <= 0 || !isFinite(duration)) {
        console.warn(`[${jobId}] Invalid duration for media ${i}: ${duration}s, using 3s default`);
        duration = 3;
      }
      
      duration = Math.max(duration, 0.5);
      
      console.log(`[${jobId}] Normalizing media ${i} (${item.type}) to ${duration}s duration`);
      await normalizeMediaFile(rawFilePath, normalizedFilePath, item.type, duration);
      
      mediaFiles.push({ path: normalizedFilePath, duration });
      normalizedFiles.push(normalizedFilePath);
      
      const progressPercent = 15 + Math.floor((i / request.mediaItems.length) * 25);
      await storage.updateRenderJob(jobId, { progress: progressPercent });
    }

    if (mediaFiles.length === 0) {
      throw new Error("No media files to render");
    }

    console.log(`[${jobId}] Creating concat input list for ${mediaFiles.length} media files`);
    await storage.updateRenderJob(jobId, { progress: 40 });

    const concatListPath = path.join(tempDir, "input_list.txt");
    const concatListLines: string[] = [];
    
    for (let i = 0; i < mediaFiles.length; i++) {
      concatListLines.push(`file '${mediaFiles[i].path}'`);
      if (i < mediaFiles.length - 1) {
        concatListLines.push(`duration ${mediaFiles[i].duration}`);
      }
    }
    
    const concatListContent = concatListLines.join("\n");
    fs.writeFileSync(concatListPath, concatListContent);
    
    console.log(`[${jobId}] Concat list:\n${concatListContent}`);

    const videoNoAudioPath = path.join(tempDir, "video_no_audio.mp4");
    console.log(`[${jobId}] Concatenating media files into single video track`);
    await concatenateMedia(tempDir, concatListPath, videoNoAudioPath);
    
    await storage.updateRenderJob(jobId, { progress: 60 });

    const musicVolume = request.musicMixing?.backgroundMusicVolume ?? 0.3;
    const voiceVolume = request.musicMixing?.voiceoverVolume ?? 1.0;

    let audioPath: string;
    if (musicPath) {
      console.log(`[${jobId}] Mixing voiceover and background music (voice: ${voiceVolume}, music: ${musicVolume})`);
      audioPath = path.join(tempDir, "mixed_audio.mp3");
      await mixAudio(voiceoverPath, musicPath, audioPath, voiceVolume, musicVolume);
      await storage.updateRenderJob(jobId, { progress: 75 });
    } else {
      console.log(`[${jobId}] Using voiceover only (no background music)`);
      audioPath = voiceoverPath;
      await storage.updateRenderJob(jobId, { progress: 75 });
    }

    const outputPath = path.join(outputDir, `${jobId}.mp4`);
    console.log(`[${jobId}] Combining video and audio into final output`);
    await combineVideoAndAudio(videoNoAudioPath, audioPath, outputPath, jobId);

    const videoUrl = `/output/${jobId}.mp4`;
    console.log(`[${jobId}] Video rendering completed successfully: ${videoUrl}`);
    await storage.updateRenderJob(jobId, {
      status: "completed",
      progress: 100,
      videoUrl
    });

    console.log(`[${jobId}] Cleaning up temporary files`);
    fs.rmSync(tempDir, { recursive: true, force: true });

  } catch (error) {
    console.error(`[${jobId}] Video rendering error:`, error);
    await storage.updateRenderJob(jobId, {
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error"
    });
    
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
}

function normalizeMediaFile(
  inputPath: string,
  outputPath: string,
  type: "image" | "video",
  duration: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    const command = ffmpeg(inputPath);
    
    if (type === "image") {
      command
        .inputOptions(["-loop", "1", "-t", duration.toString(), "-framerate", "30"])
        .videoFilters("scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1")
        .outputOptions([
          "-c:v", "libx264",
          "-pix_fmt", "yuv420p",
          "-preset", "fast",
          "-crf", "23",
          "-an"
        ]);
    } else {
      command
        .inputOptions(["-t", duration.toString()])
        .videoFilters("scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30")
        .outputOptions([
          "-c:v", "libx264",
          "-pix_fmt", "yuv420p",
          "-preset", "fast",
          "-crf", "23",
          "-an"
        ]);
    }
    
    command
      .output(outputPath)
      .on("end", () => resolve())
      .on("error", (err) => reject(new Error(`Failed to normalize ${type}: ${err.message}`)))
      .run();
  });
}

function concatenateMedia(
  workDir: string,
  concatListPath: string,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(concatListPath)
      .inputOptions(["-f", "concat", "-safe", "0"])
      .outputOptions([
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "medium",
        "-crf", "23",
        "-an"
      ])
      .output(outputPath)
      .on("end", () => resolve())
      .on("error", (err) => reject(new Error(`Failed to concatenate media: ${err.message}`)))
      .run();
  });
}

function mixAudio(
  voiceoverPath: string,
  musicPath: string,
  outputPath: string,
  voiceVolume: number,
  musicVolume: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(voiceoverPath)
      .input(musicPath)
      .complexFilter([
        `[0:a]volume=${voiceVolume}[voice]`,
        `[1:a]volume=${musicVolume}[music]`,
        `[voice][music]amix=inputs=2:duration=first:dropout_transition=2[aout]`
      ])
      .outputOptions(["-map", "[aout]", "-c:a", "aac", "-b:a", "128k"])
      .output(outputPath)
      .on("end", () => resolve())
      .on("error", (err) => reject(new Error(`Failed to mix audio: ${err.message}`)))
      .run();
  });
}

function combineVideoAndAudio(
  videoPath: string,
  audioPath: string,
  outputPath: string,
  jobId: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(videoPath)
      .input(audioPath)
      .outputOptions([
        "-map", "0:v:0",
        "-map", "1:a:0",
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "128k",
        "-shortest"
      ])
      .output(outputPath)
      .on("progress", async (progress) => {
        if (progress.percent) {
          const renderProgress = Math.min(75 + (progress.percent / 4), 99);
          await storage.updateRenderJob(jobId, { progress: Math.round(renderProgress) });
        }
      })
      .on("end", () => resolve())
      .on("error", (err) => reject(new Error(`Failed to combine video and audio: ${err.message}`)))
      .run();
  });
}
