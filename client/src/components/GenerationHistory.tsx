import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, FileText, Image as ImageIcon, Lightbulb, Video } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface GenerationHistory {
  id: string;
  user_id: string;
  type: 'script' | 'channel_name' | 'video_idea' | 'thumbnail';
  prompt?: string;
  result: any;
  created_at: string;
  expires_at: string;
}

interface GenerationHistoryProps {
  type?: 'script' | 'channel_name' | 'video_idea' | 'thumbnail';
  limit?: number;
  onSelect?: (item: GenerationHistory) => void;
}

const typeIcons = {
  script: Video,
  channel_name: FileText,
  video_idea: Lightbulb,
  thumbnail: ImageIcon,
};

const typeLabels = {
  script: 'Script',
  channel_name: 'Channel Name',
  video_idea: 'Video Idea',
  thumbnail: 'Thumbnail',
};

export function GenerationHistory({ type, limit = 10, onSelect }: GenerationHistoryProps) {
  const { user } = useAuth();

  const { data: history = [], isLoading, error } = useQuery<GenerationHistory[]>({
    queryKey: ['/api/history', { type, limit }],
    enabled: !!user,
    refetchInterval: 30000,
  });

  if (error) {
    console.error('Error fetching history:', error);
  }

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <Card data-testid="card-history-loading">
        <CardHeader>
          <CardTitle className="text-base">Recent Generations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            Loading history...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card data-testid="card-history-empty">
        <CardHeader>
          <CardTitle className="text-base">Recent Generations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            No history yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-history">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Recent Generations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {history.map((item) => {
              const Icon = typeIcons[item.type];
              const expiresIn = formatDistanceToNow(new Date(item.expires_at), { addSuffix: true });
              
              return (
                <Card
                  key={item.id}
                  className={`hover-elevate active-elevate-2 transition-all ${onSelect ? 'cursor-pointer' : ''}`}
                  onClick={() => onSelect?.(item)}
                  data-testid={`card-history-item-${item.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-md bg-primary/10">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            {typeLabels[item.type]}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        {item.prompt && (
                          <p className="text-sm font-medium truncate mb-1">{item.prompt}</p>
                        )}
                        {item.type === 'script' && item.result?.seoPackage?.title && (
                          <p className="text-sm text-muted-foreground truncate">
                            {item.result.seoPackage.title}
                          </p>
                        )}
                        {item.type === 'channel_name' && item.result?.channelName && (
                          <p className="text-sm text-muted-foreground truncate">
                            {item.result.channelName}
                          </p>
                        )}
                        {item.type === 'video_idea' && item.result?.title && (
                          <p className="text-sm text-muted-foreground truncate">
                            {item.result.title}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Expires {expiresIn}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
