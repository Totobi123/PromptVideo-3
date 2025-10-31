import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Image, Video } from "lucide-react";

export interface MediaItem {
  type: "image" | "video";
  startTime: string;
  endTime: string;
  description: string;
  url?: string;
  thumbnail?: string;
}

interface MediaRecommendationsProps {
  items: MediaItem[];
}

export function MediaRecommendations({ items }: MediaRecommendationsProps) {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Image className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Stock Media</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item, index) => (
          <Card
            key={index}
            data-testid={`media-item-${index}`}
            className="overflow-hidden hover-elevate cursor-pointer"
            onClick={() => item.url && window.open(item.url, "_blank")}
          >
            <div className="relative aspect-video bg-muted flex items-center justify-center overflow-hidden">
              {item.thumbnail ? (
                <img 
                  src={item.thumbnail} 
                  alt={item.description}
                  className="w-full h-full object-cover"
                />
              ) : item.type === "image" ? (
                <Image className="w-12 h-12 text-muted-foreground" />
              ) : (
                <Video className="w-12 h-12 text-muted-foreground" />
              )}
              <Badge
                variant="default"
                className="absolute top-2 left-2 bg-primary/90 backdrop-blur-sm"
              >
                {item.startTime} - {item.endTime}
              </Badge>
              <Badge
                variant="secondary"
                className="absolute bottom-2 right-2"
              >
                {item.type.toUpperCase()}
              </Badge>
            </div>
            <div className="p-4">
              <p className="text-sm text-foreground line-clamp-2">
                {item.description}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}
