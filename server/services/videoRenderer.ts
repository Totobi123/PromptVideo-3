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
  
  const aspectRatio = request.aspectRatio || "16:9";
  const fitMode = request.fitMode || "fit";
  const dimensions = aspectRatio === "16:9" 
    ? { width: 1920, height: 1080 } 
    : { width: 1080, height: 1920 };
  
  try {
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(`[${jobId}] Starting video render process with ${aspectRatio} aspect ratio (${dimensions.width}x${dimensions.height}), ${fitMode} mode`);
    await storage.updateRenderJob(jobId, { status: "processing", progress: 5 });

    const voiceoverPath = path.join(tempDir, "voiceover.mp3");
    console.log(`[${jobId}] Downloading voiceover from ${request.audioUrl}`);
    await downloadFile(request.audioUrl, voiceoverPath);

    const voiceoverDuration = await getAudioDuration(voiceoverPath);
    console.log(`[${jobId}] Voiceover duration: ${voiceoverDuration.toFixed(2)}s - this is our target video duration`);

    let musicPath: string | undefined;
    if (request.musicUrl) {
      musicPath = path.join(tempDir, "music.mp3");
      console.log(`[${jobId}] Downloading background music from ${request.musicUrl}`);
      await downloadFile(request.musicUrl, musicPath);
    }

    await storage.updateRenderJob(jobId, { progress: 15 });

    const FADE_DURATION = 0.5;
    const mediaFiles: DownloadedFile[] = [];
    const normalizedFiles: string[] = [];
    
    console.log(`[${jobId}] Processing ${request.mediaItems.length} media items`);
    
    const totalTransitionTime = (request.mediaItems.length - 1) * FADE_DURATION;
    const calculatedTotalDuration = request.mediaItems.reduce((sum, item) => {
      const start = parseTime(item.startTime);
      const end = parseTime(item.endTime);
      return sum + (end - start);
    }, 0);
    
    const durationAdjustmentFactor = calculatedTotalDuration > 0 
      ? (voiceoverDuration + totalTransitionTime) / calculatedTotalDuration 
      : 1;
    
    console.log(`[${jobId}] Adjusting media durations by factor ${durationAdjustmentFactor.toFixed(3)} to compensate for ${totalTransitionTime}s of transitions`);
    
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
      
      duration = duration * durationAdjustmentFactor;
      duration = Math.max(duration, 0.5);
      
      const keyframeEffect = item.keyframeEffect || "none";
      console.log(`[${jobId}] Normalizing media ${i} (${item.type}) to ${duration.toFixed(2)}s duration with ${keyframeEffect} effect`);
      await normalizeMediaFile(rawFilePath, normalizedFilePath, item.type, duration, dimensions.width, dimensions.height, fitMode, keyframeEffect);
      
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

    const actualVideoDuration = await getVideoDuration(videoNoAudioPath);
    console.log(`[${jobId}] Video track duration: ${actualVideoDuration.toFixed(2)}s (target was ${voiceoverDuration.toFixed(2)}s)`);
    
    const durationDifference = Math.abs(actualVideoDuration - voiceoverDuration);
    if (durationDifference > 1.0) {
      console.warn(`[${jobId}] WARNING: Video duration differs from voiceover by ${durationDifference.toFixed(2)}s`);
    }

    const musicVolume = request.musicMixing?.backgroundMusicVolume ?? 0.2;
    const voiceVolume = request.musicMixing?.voiceoverVolume ?? 1.0;

    let audioPath: string;
    if (musicPath) {
      try {
        console.log(`[${jobId}] Mixing voiceover and background music (voice: ${voiceVolume}, music: ${musicVolume}) to match voiceover duration`);
        audioPath = path.join(tempDir, "mixed_audio.aac");
        await mixAudio(voiceoverPath, musicPath, audioPath, voiceVolume, musicVolume, voiceoverDuration);
        await storage.updateRenderJob(jobId, { progress: 75 });
      } catch (error) {
        console.warn(`[${jobId}] Failed to mix audio, falling back to voiceover only:`, error);
        audioPath = voiceoverPath;
        await storage.updateRenderJob(jobId, { progress: 75 });
      }
    } else {
      console.log(`[${jobId}] Using voiceover as-is (no background music)`);
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

function getKeyframeFilter(
  effect: string | undefined,
  width: number,
  height: number,
  duration: number
): string {
  if (!effect || effect === "none") {
    return "";
  }

  const fps = 30;
  const totalFrames = Math.floor(duration * fps);
  
  switch (effect) {
    case "zoomin":
      return `,zoompan=z='min(zoom+0.0015,1.5)':d=${totalFrames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${width}x${height}:fps=${fps}`;
    
    case "zoomout":
      return `,zoompan=z='if(lte(zoom,1.0),1.5,max(1.001,zoom-0.0015))':d=${totalFrames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${width}x${height}:fps=${fps}`;
    
    case "panleft":
      return `,zoompan=z='1.2':x='iw-iw/zoom-((iw-iw/zoom)/${totalFrames})*on':y='0':d=${totalFrames}:s=${width}x${height}:fps=${fps}`;
    
    case "panright":
      return `,zoompan=z='1.2':x='((iw-iw/zoom)/${totalFrames})*on':y='0':d=${totalFrames}:s=${width}x${height}:fps=${fps}`;
    
    case "panup":
      return `,zoompan=z='1.2':x='0':y='ih-ih/zoom-((ih-ih/zoom)/${totalFrames})*on':d=${totalFrames}:s=${width}x${height}:fps=${fps}`;
    
    case "pandown":
      return `,zoompan=z='1.2':x='0':y='((ih-ih/zoom)/${totalFrames})*on':d=${totalFrames}:s=${width}x${height}:fps=${fps}`;
    
    case "kenburns":
      return `,zoompan=z='min(zoom+0.001,1.3)':x='if(gte(zoom,1.15),iw-iw/zoom-((iw-iw/zoom)/${totalFrames})*on,iw/2-(iw/zoom/2))':y='if(gte(zoom,1.15),0,ih/2-(ih/zoom/2))':d=${totalFrames}:s=${width}x${height}:fps=${fps}`;
    
    default:
      return "";
  }
}

function normalizeMediaFile(
  inputPath: string,
  outputPath: string,
  type: "image" | "video",
  duration: number,
  width: number = 1920,
  height: number = 1080,
  fitMode: "fit" | "crop" = "fit",
  keyframeEffect?: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const command = ffmpeg(inputPath);
    
    const baseFilter = fitMode === "crop"
      ? `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},setsar=1`
      : `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,setsar=1`;
    
    const keyframeFilter = getKeyframeFilter(keyframeEffect, width, height, duration);
    const videoFilter = baseFilter + keyframeFilter;
    
    if (type === "image") {
      command
        .inputOptions(["-loop", "1", "-t", duration.toString(), "-framerate", "30"])
        .videoFilters(videoFilter)
        .outputOptions([
          "-c:v", "libx264",
          "-pix_fmt", "yuv420p",
          "-preset", "fast",
          "-crf", "23",
          "-g", "60",
          "-keyint_min", "60",
          "-an"
        ]);
    } else {
      command
        .inputOptions(["-t", duration.toString()])
        .videoFilters(`${videoFilter},fps=30`)
        .outputOptions([
          "-c:v", "libx264",
          "-pix_fmt", "yuv420p",
          "-preset", "fast",
          "-crf", "23",
          "-g", "60",
          "-keyint_min", "60",
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

export function getAudioDuration(audioUrl: string): Promise<number> {
  return new Promise((resolve, reject) => {
    if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) {
      ffmpeg.ffprobe(audioUrl, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }
        const duration = metadata.format.duration;
        if (typeof duration === 'number' && duration > 0) {
          resolve(duration);
        } else {
          reject(new Error(`Could not determine duration for ${audioUrl}`));
        }
      });
    } else {
      let localPath = audioUrl;
      if (audioUrl.startsWith('/output/') || audioUrl.startsWith('/temp/')) {
        localPath = path.join(process.cwd(), audioUrl);
      }
      ffmpeg.ffprobe(localPath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }
        const duration = metadata.format.duration;
        if (typeof duration === 'number' && duration > 0) {
          resolve(duration);
        } else {
          reject(new Error(`Could not determine duration for ${localPath}`));
        }
      });
    }
  });
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${secs.toFixed(2).padStart(5, '0')}`;
}

export function recalculateMediaTimestamps<T extends MediaItem>(
  mediaItems: T[],
  actualAudioDuration: number
): T[] {
  if (mediaItems.length === 0) {
    return mediaItems;
  }

  if (actualAudioDuration <= 0) {
    console.warn('Invalid audio duration for timestamp recalculation:', actualAudioDuration);
    return mediaItems;
  }

  const totalOriginalDuration = mediaItems.reduce((total, item) => {
    const start = parseTime(item.startTime);
    const end = parseTime(item.endTime);
    return total + (end - start);
  }, 0);

  if (totalOriginalDuration === 0) {
    const durationPerItem = actualAudioDuration / mediaItems.length;
    return mediaItems.map((item, index) => {
      const isLast = index === mediaItems.length - 1;
      return {
        ...item,
        startTime: formatTime(index * durationPerItem),
        endTime: isLast ? formatTime(actualAudioDuration) : formatTime((index + 1) * durationPerItem),
      } as T;
    });
  }

  const scaleFactor = actualAudioDuration / totalOriginalDuration;
  const MINIMUM_DURATION = 0.1;
  
  let currentTime = 0;
  const results: T[] = [];

  for (let i = 0; i < mediaItems.length; i++) {
    const item = mediaItems[i];
    const isLast = i === mediaItems.length - 1;
    
    const originalStart = parseTime(item.startTime);
    const originalEnd = parseTime(item.endTime);
    const originalDuration = originalEnd - originalStart;
    let newDuration = originalDuration * scaleFactor;
    
    newDuration = Math.max(MINIMUM_DURATION, newDuration);
    
    if (isLast) {
      newDuration = actualAudioDuration - currentTime;
      newDuration = Math.max(MINIMUM_DURATION, newDuration);
    }

    const newItem = {
      ...item,
      startTime: formatTime(currentTime),
      endTime: isLast ? formatTime(actualAudioDuration) : formatTime(currentTime + newDuration),
    } as T;

    results.push(newItem);
    currentTime += newDuration;
  }

  return results;
}

async function concatenateMedia(
  workDir: string,
  concatListPath: string,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(concatListPath)
      .inputOptions(['-f', 'concat', '-safe', '0'])
      .outputOptions([
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "medium",
        "-crf", "23",
        "-g", "60",
        "-keyint_min", "60",
        "-an"
      ])
      .output(outputPath)
      .on("start", (commandLine) => {
        console.log(`[Concat] FFmpeg command: ${commandLine}`);
      })
      .on("progress", (progress) => {
        if (progress.percent) {
          console.log(`[Concat] Progress: ${progress.percent.toFixed(1)}%`);
        }
      })
      .on("end", () => {
        console.log(`[Concat] Successfully concatenated media files`);
        resolve();
      })
      .on("error", (err, stdout, stderr) => {
        console.error(`[Concat] FFmpeg error:`, err.message);
        console.error(`[Concat] stderr:`, stderr);
        reject(new Error(`Failed to concatenate media: ${err.message}`));
      })
      .run();
  });
}

function mixAudio(
  voiceoverPath: string,
  musicPath: string,
  outputPath: string,
  voiceVolume: number,
  musicVolume: number,
  targetDuration: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(voiceoverPath)
      .input(musicPath)
      .complexFilter([
        {
          filter: 'apad',
          inputs: '0:a',
          outputs: 'voicepad'
        },
        {
          filter: 'atrim',
          options: `0:${targetDuration}`,
          inputs: 'voicepad',
          outputs: 'voicetrim'
        },
        {
          filter: 'volume',
          options: voiceVolume,
          inputs: 'voicetrim',
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
          options: { inputs: 2, duration: 'longest', dropout_transition: 0 },
          inputs: ['voice', 'music'],
          outputs: 'amixed'
        },
        {
          filter: 'atrim',
          options: `0:${targetDuration}`,
          inputs: 'amixed',
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

function extendAudio(
  inputPath: string,
  outputPath: string,
  targetDuration: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(inputPath)
      .complexFilter([
        {
          filter: 'apad',
          inputs: '0:a',
          outputs: 'apadded'
        },
        {
          filter: 'atrim',
          options: `0:${targetDuration}`,
          inputs: 'apadded',
          outputs: 'aout'
        }
      ], 'aout')
      .audioCodec('aac')
      .audioBitrate('192k')
      .output(outputPath)
      .on("start", (commandLine) => {
        console.log('FFmpeg audio extension command:', commandLine);
      })
      .on("end", () => resolve())
      .on("error", (err) => reject(new Error(`Failed to extend audio: ${err.message}`)))
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
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "23",
        "-g", "60",
        "-keyint_min", "60",
        "-c:a", "aac",
        "-b:a", "192k",
        "-movflags", "+faststart"
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
