import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, PauseCircle, Smile } from "lucide-react";

export interface ScriptSegment {
  startTime: string;
  endTime: string;
  text: string;
  emotionMarkers?: Array<{
    word: string;
    emotion: "emphasize" | "pause" | "excited" | "calm" | "urgent";
  }>;
}

interface ScriptTimelineProps {
  segments: ScriptSegment[];
}

const emotionIcons = {
  emphasize: <Zap className="w-3 h-3" />,
  pause: <PauseCircle className="w-3 h-3" />,
  excited: <Smile className="w-3 h-3" />,
  calm: <Clock className="w-3 h-3" />,
  urgent: <Zap className="w-3 h-3" />,
};

export function ScriptTimeline({ segments }: ScriptTimelineProps) {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Video Script</h3>
      </div>
      <div className="space-y-4">
        {segments.map((segment, index) => (
          <div
            key={index}
            data-testid={`script-segment-${index}`}
            className="flex gap-4 p-4 rounded-lg bg-muted/50 hover-elevate"
          >
            <div className="flex-shrink-0">
              <div className="font-mono text-sm text-primary font-semibold">
                {segment.startTime}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                to {segment.endTime}
              </div>
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <p className="text-sm text-foreground leading-relaxed">
                {segment.text}
              </p>
              {segment.emotionMarkers && segment.emotionMarkers.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {segment.emotionMarkers.map((marker, mIndex) => (
                    <Badge
                      key={mIndex}
                      variant="outline"
                      className="text-xs gap-1"
                      data-testid={`emotion-marker-${index}-${mIndex}`}
                    >
                      {emotionIcons[marker.emotion]}
                      {marker.emotion}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
