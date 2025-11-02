import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  url: string;
  title: string;
  onDownload?: () => void;
  className?: string;
}

export function AudioPlayer({ url, title, onDownload, className }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [url]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <audio ref={audioRef} src={url} preload="metadata" />
      
      <Button
        data-testid={`button-${isPlaying ? 'pause' : 'play'}-audio`}
        onClick={togglePlay}
        size="sm"
        variant="outline"
        className="gap-2 flex-shrink-0"
      >
        {isPlaying ? (
          <>
            <Pause className="w-3 h-3" />
            Pause
          </>
        ) : (
          <>
            <Play className="w-3 h-3" />
            Play
          </>
        )}
      </Button>

      <div className="flex-1 min-w-0">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${duration > 0 ? (currentTime / duration) * 100 : 0}%, hsl(var(--muted)) ${duration > 0 ? (currentTime / duration) * 100 : 0}%, hsl(var(--muted)) 100%)`
          }}
          data-testid="slider-audio-progress"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span data-testid="text-audio-current-time">{formatTime(currentTime)}</span>
          <span data-testid="text-audio-duration">{formatTime(duration)}</span>
        </div>
      </div>

      {onDownload && (
        <Button
          data-testid="button-download-audio"
          onClick={onDownload}
          size="sm"
          variant="outline"
          className="gap-2 flex-shrink-0"
        >
          <Download className="w-3 h-3" />
          Download
        </Button>
      )}
    </div>
  );
}
