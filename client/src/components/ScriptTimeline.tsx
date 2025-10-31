import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";

export interface ScriptSegment {
  startTime: string;
  endTime: string;
  text: string;
}

interface ScriptTimelineProps {
  segments: ScriptSegment[];
}

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
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground leading-relaxed">
                {segment.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
