import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Music, Download, Play } from "lucide-react";

interface VoiceAndMusicInfoProps {
  voiceName: string;
  musicTitle?: string;
  musicUrl?: string;
  onPlayMusic?: () => void;
  onDownloadMusic?: () => void;
}

export function VoiceAndMusicInfo({
  voiceName,
  musicTitle,
  musicUrl,
  onPlayMusic,
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
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Selected Voice</p>
              <p className="text-sm text-muted-foreground">{voiceName}</p>
            </div>
          </div>

          {musicTitle && musicUrl && (
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <Music className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Background Music</p>
                <p className="text-sm text-muted-foreground mb-2">{musicTitle}</p>
                <div className="flex gap-2">
                  <Button
                    data-testid="button-play-music"
                    onClick={onPlayMusic}
                    size="sm"
                    variant="outline"
                    className="gap-2"
                  >
                    <Play className="w-3 h-3" />
                    Preview
                  </Button>
                  <Button
                    data-testid="button-download-music"
                    onClick={onDownloadMusic}
                    size="sm"
                    variant="outline"
                    className="gap-2"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </Button>
                </div>
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
