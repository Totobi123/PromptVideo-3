import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MessageSquare, Volume2, Music } from "lucide-react";

interface Chapter {
  timestamp: string;
  title: string;
}

interface CTAPlacement {
  timestamp: string;
  type: "subscribe" | "like" | "comment" | "link" | "product";
  message: string;
}

interface MusicMixing {
  backgroundMusicVolume: number;
  voiceoverVolume: number;
  fadeInDuration: number;
  fadeOutDuration: number;
}

interface ProductionInfoProps {
  chapters?: Chapter[];
  ctaPlacements?: CTAPlacement[];
  musicMixing?: MusicMixing;
}

const ctaTypeColors: Record<string, string> = {
  subscribe: "bg-red-500/10 text-red-500 border-red-500/20",
  like: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  comment: "bg-green-500/10 text-green-500 border-green-500/20",
  link: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  product: "bg-orange-500/10 text-orange-500 border-orange-500/20",
};

export function ProductionInfo({ chapters, ctaPlacements, musicMixing }: ProductionInfoProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {chapters && chapters.length > 0 && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">YouTube Chapters</h3>
            </div>
            <div className="space-y-2">
              {chapters.map((chapter, index) => (
                <div
                  key={index}
                  data-testid={`chapter-${index}`}
                  className="flex items-start gap-3 p-3 rounded bg-muted/50"
                >
                  <span className="text-xs font-mono text-muted-foreground mt-0.5">
                    {chapter.timestamp}
                  </span>
                  <span className="text-sm text-foreground flex-1">{chapter.title}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {ctaPlacements && ctaPlacements.length > 0 && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Call-to-Action Placements</h3>
            </div>
            <div className="space-y-2">
              {ctaPlacements.map((cta, index) => (
                <div
                  key={index}
                  data-testid={`cta-${index}`}
                  className="flex items-start gap-3 p-3 rounded bg-muted/50"
                >
                  <span className="text-xs font-mono text-muted-foreground mt-0.5">
                    {cta.timestamp}
                  </span>
                  <div className="flex-1 space-y-1">
                    <Badge
                      className={ctaTypeColors[cta.type] || ""}
                      variant="outline"
                    >
                      {cta.type}
                    </Badge>
                    <p className="text-sm text-foreground">{cta.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {musicMixing && (
        <Card className="p-6 lg:col-span-2">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Audio Mixing Recommendations</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                  <label className="text-sm font-medium text-muted-foreground">Background Music</label>
                </div>
                <p data-testid="text-music-volume" className="text-2xl font-bold text-foreground">
                  {musicMixing.backgroundMusicVolume}%
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                  <label className="text-sm font-medium text-muted-foreground">Voiceover</label>
                </div>
                <p data-testid="text-voiceover-volume" className="text-2xl font-bold text-foreground">
                  {musicMixing.voiceoverVolume}%
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Fade In</label>
                <p data-testid="text-fade-in" className="text-2xl font-bold text-foreground">
                  {musicMixing.fadeInDuration}s
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Fade Out</label>
                <p data-testid="text-fade-out" className="text-2xl font-bold text-foreground">
                  {musicMixing.fadeOutDuration}s
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
