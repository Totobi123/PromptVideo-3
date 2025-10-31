import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message: string;
  progress?: number;
}

export function LoadingState({ message, progress }: LoadingStateProps) {
  return (
    <Card className="p-8">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
          <div className="relative bg-primary/10 p-4 rounded-full">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        </div>
        <div className="space-y-2 w-full max-w-md">
          <p className="text-lg font-medium text-foreground">{message}</p>
          {progress !== undefined && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground">{progress}% complete</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
