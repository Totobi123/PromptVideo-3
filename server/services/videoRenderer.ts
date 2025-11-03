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

const ALLOWED_LOCAL_DIRS = [
  path.join(process.cwd(), "output", "ai-images")
];

function isLocalPath(url: string): boolean {
  return url.startsWith("/output/ai-images/");
}

function copyLocalFile(sourcePath: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const fullSourcePath = path.resolve(process.cwd(), `.${sourcePath}`);
    
    const isAllowed = ALLOWED_LOCAL_DIRS.some(allowedDir => {
      return fullSourcePath.startsWith(allowedDir);
    });
    
    if (!isAllowed) {
      reject(new Error(`Local file path not allowed: ${sourcePath}`));
      return;
    }
    
    if (!fs.existsSync(fullSourcePath)) {
      reject(new Error(`Local file not found: ${fullSourcePath}`));
      return;
    }
    
    fs.copyFile(fullSourcePath, dest, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function downloadFile(url: string, dest: string): Promise<void> {
  if (isLocalPath(url)) {
    return copyLocalFile(url, dest);
  }
  
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
      
      const isLocal = isLocalPath(item.url);
      console.log(`[${jobId}] ${isLocal ? 'Copying local' : 'Downloading'} media ${i} (${item.type}): ${item.url}`);
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

    const musicVolume = request.musicMixing?.backgroundMusicVolume ?? 0.2;
    const voiceVolume = request.musicMixing?.voiceoverVolume ?? 1.0;

    let audioPath: string;
    if (musicPath) {
      try {
        console.log(`[${jobId}] Mixing voiceover and background music (voice: ${voiceVolume}, music: ${musicVolume})`);
        audioPath = path.join(tempDir, "mixed_audio.aac");
        await mixAudio(voiceoverPath, musicPath, audioPath, voiceVolume, musicVolume);
        await storage.updateRenderJob(jobId, { progress: 75 });
      } catch (error) {
        console.warn(`[${jobId}] Failed to mix audio, falling back to voiceover only:`, error);
        audioPath = voiceoverPath;
        await storage.updateRenderJob(jobId, { progress: 75 });
      }
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

function getVideoDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }
      const duration = metadata.format.duration;
      if (typeof duration === 'number' && duration > 0) {
        resolve(duration);
      } else {
        reject(new Error(`Could not determine duration for ${filePath}`));
      }
    });
  });
}

async function concatenateMedia(
  workDir: string,
  concatListPath: string,
  outputPath: string
): Promise<void> {
  const concatContent = fs.readFileSync(concatListPath, 'utf-8');
  const lines = concatContent.split('\n');
  
  const mediaFiles: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('file')) {
      const match = trimmed.match(/file '(.+)'/);
      if (match) {
        mediaFiles.push(match[1]);
      }
    }
  }

  if (mediaFiles.length === 0) {
    throw new Error('No media files found in concat list');
  }

  if (mediaFiles.length === 1) {
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(mediaFiles[0])
        .outputOptions([
          "-c:v", "libx264",
          "-pix_fmt", "yuv420p",
          "-preset", "medium",
          "-crf", "23",
          "-an"
        ])
        .output(outputPath)
        .on("end", () => resolve())
        .on("error", (err) => reject(new Error(`Failed to process single media: ${err.message}`)))
        .run();
    });
  }

  const actualDurations: number[] = [];
  for (const file of mediaFiles) {
    const duration = await getVideoDuration(file);
    actualDurations.push(duration);
  }

  return new Promise((resolve, reject) => {
    const command = ffmpeg();
    mediaFiles.forEach(file => command.input(file));

    const fadeDuration = 0.5;
    const filterComplex: string[] = [];
    
    let cumulativeOffset = 0;
    for (let i = 0; i < mediaFiles.length - 1; i++) {
      const offset = Math.max(0, cumulativeOffset + actualDurations[i] - fadeDuration);
      
      if (i === 0) {
        filterComplex.push(
          `[0:v][1:v]xfade=transition=fade:duration=${fadeDuration}:offset=${offset.toFixed(3)}[v01]`
        );
      } else if (i === mediaFiles.length - 2) {
        filterComplex.push(
          `[v0${i}][${i + 1}:v]xfade=transition=fade:duration=${fadeDuration}:offset=${offset.toFixed(3)}[vout]`
        );
      } else {
        filterComplex.push(
          `[v0${i}][${i + 1}:v]xfade=transition=fade:duration=${fadeDuration}:offset=${offset.toFixed(3)}[v0${i + 1}]`
        );
      }
      
      cumulativeOffset += actualDurations[i] - fadeDuration;
    }

    command
      .complexFilter(filterComplex)
      .outputOptions([
        "-map", mediaFiles.length === 2 ? "[v01]" : "[vout]",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "medium",
        "-crf", "23"
      ])
      .output(outputPath)
      .on("end", () => resolve())
      .on("error", (err) => reject(new Error(`Failed to concatenate media with transitions: ${err.message}`)))
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
        {
          filter: 'volume',
          options: voiceVolume,
          inputs: '0:a',
          outputs: 'voice'
        },
        {
          filter: 'aloop',
          options: { loop: -1, size: 2e+09 },
          inputs: '1:a',
          outputs: 'musicloop'
        },
        {
          filter: 'volume',
          options: musicVolume,
          inputs: 'musicloop',
          outputs: 'music'
        },
        {
          filter: 'amix',
          options: { inputs: 2, duration: 'first', dropout_transition: 0 },
          inputs: ['voice', 'music'],
          outputs: 'aout'
        }
      ], 'aout')
      .audioCodec('aac')
      .audioBitrate('192k')
      .output(outputPath)
      .on("start", (commandLine) => {
        console.log('FFmpeg audio mixing command:', commandLine);
      })
      .on("stderr", (stderrLine) => {
        console.log('FFmpeg stderr:', stderrLine);
      })
      .on("end", () => resolve())
      .on("error", (err, stdout, stderr) => {
        console.error('FFmpeg audio mixing error:', err);
        console.error('FFmpeg stdout:', stdout);
        console.error('FFmpeg stderr:', stderr);
        reject(new Error(`Failed to mix audio: ${err.message}`));
      })
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
