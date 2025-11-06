import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Youtube, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

interface YoutubeUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  renderJobId: string | null;
  defaultTitle?: string;
  defaultDescription?: string;
}

export function YoutubeUploadDialog({
  open,
  onOpenChange,
  renderJobId,
  defaultTitle = "",
  defaultDescription = "",
}: YoutubeUploadDialogProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);
  const [privacyStatus, setPrivacyStatus] = useState<"public" | "private" | "unlisted">("public");

  const { data: youtubeChannel, isLoading: channelLoading } = useQuery<{
    channelId: string;
    channelTitle: string;
  } | null>({
    queryKey: ["/api/youtube/channel"],
    queryFn: async () => {
      try {
        return await apiRequest("/api/youtube/channel", "GET");
      } catch (error: any) {
        if (error.message?.includes("No YouTube channel connected")) {
          return null;
        }
        throw error;
      }
    },
    enabled: open,
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!renderJobId) {
        throw new Error("No video to upload");
      }

      return await apiRequest("/api/youtube/publish", "POST", {
        renderJobId,
        title,
        description,
        privacyStatus,
      });
    },
    onSuccess: () => {
      toast({
        title: "Upload Started",
        description: "Your video is being uploaded to YouTube. This may take a few minutes.",
      });
      onOpenChange(false);
      setTitle(defaultTitle);
      setDescription(defaultDescription);
      setPrivacyStatus("public");
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload video to YouTube",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your video",
        variant: "destructive",
      });
      return;
    }
    uploadMutation.mutate();
  };

  if (channelLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!youtubeChannel) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              YouTube Not Connected
            </DialogTitle>
            <DialogDescription>
              You need to connect your YouTube channel before uploading videos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-upload">
              Cancel
            </Button>
            <Button onClick={() => {
              onOpenChange(false);
              setLocation("/youtube/channel");
            }} data-testid="button-connect-youtube">
              <Youtube className="w-4 h-4 mr-2" />
              Connect YouTube
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-600" />
            Upload to YouTube
          </DialogTitle>
          <DialogDescription>
            Upload your video to {youtubeChannel.channelTitle}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video-title" data-testid="label-video-title">
              Title *
            </Label>
            <Input
              id="video-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title..."
              maxLength={100}
              required
              data-testid="input-video-title"
            />
            <p className="text-xs text-muted-foreground">{title.length}/100 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="video-description" data-testid="label-video-description">
              Description
            </Label>
            <Textarea
              id="video-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter video description..."
              rows={4}
              maxLength={5000}
              data-testid="textarea-video-description"
            />
            <p className="text-xs text-muted-foreground">{description.length}/5000 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="privacy-status" data-testid="label-privacy-status">
              Privacy
            </Label>
            <Select value={privacyStatus} onValueChange={(value: any) => setPrivacyStatus(value)}>
              <SelectTrigger id="privacy-status" data-testid="select-privacy-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Anyone can find and watch</SelectItem>
                <SelectItem value="unlisted">Unlisted - Anyone with the link can watch</SelectItem>
                <SelectItem value="private">Private - Only you can watch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploadMutation.isPending}
              data-testid="button-cancel-upload"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={uploadMutation.isPending || !title.trim()}
              data-testid="button-confirm-upload"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Youtube className="w-4 h-4 mr-2" />
                  Upload to YouTube
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
