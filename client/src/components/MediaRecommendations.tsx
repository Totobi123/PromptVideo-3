import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Image, Video, Star, Scissors } from "lucide-react";

export interface MediaItem {
  type: "image" | "video";
  startTime: string;
  endTime: string;
  description: string;
  url?: string;
  thumbnail?: string;
  isThumbnailCandidate?: boolean;
  transition?: "cut" | "fade" | "zoom";
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
              <div className="absolute top-2 right-2 flex gap-1">
                {item.isThumbnailCandidate && (
                  <Badge
                    variant="default"
                    className="bg-yellow-500/90 hover:bg-yellow-500 backdrop-blur-sm gap-1"
                  >
                    <Star className="w-3 h-3" />
                    Thumbnail
                  </Badge>
                )}
              </div>
              <div className="absolute bottom-2 right-2 flex gap-1">
                <Badge variant="secondary">
                  {item.type.toUpperCase()}
                </Badge>
                {item.transition && (
                  <Badge variant="outline" className="gap-1">
                    <Scissors className="w-3 h-3" />
                    {item.transition}
                  </Badge>
                )}
              </div>
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
