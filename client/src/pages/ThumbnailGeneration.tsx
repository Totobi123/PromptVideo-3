import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image as ImageIcon, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocalStorage } from "@/hooks/use-local-storage";

export default function ThumbnailGeneration() {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useLocalStorage("thumbnail-title", "", 2, "thumbnail-session");
  const [style, setStyle] = useLocalStorage("thumbnail-style", "bold", 2, "thumbnail-session");
  const [thumbnailUrl, setThumbnailUrl] = useLocalStorage("thumbnail-url", "", 2, "thumbnail-session");

  const generateThumbnailMutation = useMutation({
    mutationFn: async () => {
      const niche = userProfile?.selectedNiche || "general";
      return await apiRequest<{ thumbnailUrl: string }>("/api/generate-thumbnail", "POST", {
        title,
        niche,
        style,
      });
    },
    onSuccess: (data) => {
      setThumbnailUrl(data.thumbnailUrl);
      toast({
        title: "Thumbnail Generated!",
        description: "Your thumbnail is ready to download.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate thumbnail",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Thumbnail Generation</h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          Create eye-catching thumbnails for your videos with AI
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle data-testid="text-thumbnail-settings-title">Thumbnail Settings</CardTitle>
            <CardDescription data-testid="text-thumbnail-settings-subtitle">
              Customize your thumbnail design
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Video Title</Label>
              <Input
                id="title"
                placeholder="Enter your video title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-testid="input-thumbnail-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="style">Thumbnail Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger id="style" data-testid="select-thumbnail-style">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bold">Bold & Vibrant</SelectItem>
                  <SelectItem value="minimal">Minimal & Clean</SelectItem>
                  <SelectItem value="dramatic">Dramatic & Dark</SelectItem>
                  <SelectItem value="colorful">Colorful & Fun</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => generateThumbnailMutation.mutate()}
              disabled={!title.trim() || generateThumbnailMutation.isPending}
              className="w-full"
              data-testid="button-generate-thumbnail"
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              {generateThumbnailMutation.isPending ? "Generating..." : "Generate Thumbnail"}
            </Button>
          </CardContent>
        </Card>

        {thumbnailUrl && (
          <Card>
            <CardHeader>
              <CardTitle data-testid="text-thumbnail-preview-title">Generated Thumbnail</CardTitle>
              <CardDescription data-testid="text-thumbnail-preview-subtitle">
                Your AI-generated thumbnail
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video w-full overflow-hidden rounded-lg border">
                <img
                  src={thumbnailUrl}
                  alt="Generated thumbnail"
                  className="w-full h-full object-cover"
                  data-testid="img-generated-thumbnail"
                />
              </div>
              <Button variant="outline" className="w-full" asChild data-testid="button-download-thumbnail">
                <a href={thumbnailUrl} download="thumbnail.png">
                  <Download className="mr-2 h-4 w-4" />
                  Download Thumbnail
                </a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
