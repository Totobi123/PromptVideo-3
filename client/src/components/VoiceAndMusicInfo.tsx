import { Card } from "@/components/ui/card";
import { Mic, Music } from "lucide-react";
import { AudioPlayer } from "./AudioPlayer";

interface VoiceAndMusicInfoProps {
  voiceName: string;
  audioUrl?: string;
  musicTitle?: string;
  musicUrl?: string;
  musicCreator?: string;
  musicLicense?: string;
  onDownloadVoiceover?: () => void;
  onDownloadMusic?: () => void;
}

export function VoiceAndMusicInfo({
  voiceName,
  audioUrl,
  musicTitle,
  musicUrl,
  musicCreator,
  musicLicense,
  onDownloadVoiceover,
  onDownloadMusic,
}: VoiceAndMusicInfoProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Voice & Music Settings
          </h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Mic className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Voiceover</p>
              <p className="text-sm text-muted-foreground mb-3">{voiceName}</p>
              {audioUrl && (
                <AudioPlayer
                  url={audioUrl}
                  title={voiceName}
                  onDownload={onDownloadVoiceover}
                />
              )}
            </div>
          </div>

          {musicTitle && musicUrl && (
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
                <Music className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Background Music</p>
                <p className="text-sm text-muted-foreground">{musicTitle}</p>
                {musicCreator && (
                  <p className="text-xs text-muted-foreground" data-testid="text-music-creator">
                    By {musicCreator}
                  </p>
                )}
                {musicLicense && (
                  <p className="text-xs text-muted-foreground mb-3" data-testid="text-music-license">
                    License: {musicLicense}
                  </p>
                )}
                {!musicCreator && !musicLicense && <div className="mb-3" />}
                <AudioPlayer
                  url={musicUrl}
                  title={musicTitle}
                  onDownload={onDownloadMusic}
                />
              </div>
            </div>
          )}

          {!musicTitle && (
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-muted p-2">
                <Music className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Background Music</p>
                <p className="text-sm text-muted-foreground">No music available</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
