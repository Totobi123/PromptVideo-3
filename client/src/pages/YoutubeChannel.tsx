import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Youtube, Link as LinkIcon, Unlink, Users, Video, Eye, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function YoutubeChannel() {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  const { data: channelData, isLoading } = useQuery<{
    channelId: string;
    channelTitle: string;
    channelDescription: string;
    thumbnailUrl: string;
    subscriberCount: string;
    videoCount: string;
    viewCount: string;
    connectedAt: string;
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
  });

  const connectMutation = useMutation({
    mutationFn: async () => {
      const redirectUri = `${window.location.origin}/youtube/callback`;
      const response = await apiRequest<{ authUrl: string }>("/api/youtube/auth/init", "POST", {
        redirectUri,
      });
      return response;
    },
    onSuccess: (data) => {
      window.location.href = data.authUrl;
    },
    onError: (error) => {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect YouTube channel",
        variant: "destructive",
      });
      setIsConnecting(false);
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/youtube/channel", "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/youtube/channel"] });
      toast({
        title: "Disconnected",
        description: "Your YouTube channel has been disconnected",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to disconnect channel",
        variant: "destructive",
      });
    },
  });

  const handleConnect = () => {
    setIsConnecting(true);
    connectMutation.mutate();
  };

  const handleDisconnect = () => {
    if (confirm("Are you sure you want to disconnect your YouTube channel?")) {
      disconnectMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">YouTube Channel</h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          Connect your YouTube channel to enable analytics and one-tap publishing
        </p>
      </div>

      {!channelData ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Youtube className="w-5 h-5 text-red-600" />
              Connect YouTube Channel
            </CardTitle>
            <CardDescription>
              Link your YouTube channel to access AI-powered analytics and publish videos with a single click
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h3 className="font-semibold">What you'll get:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  AI-powered channel analytics and insights
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  View performance metrics for your videos
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Get recommendations to grow your channel
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Publish videos directly from your generated content
                </li>
              </ul>
            </div>
            <Button
              onClick={handleConnect}
              disabled={isConnecting || connectMutation.isPending}
              className="w-full"
              data-testid="button-connect-youtube"
            >
              {isConnecting || connectMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Connect YouTube Channel
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Youtube className="w-5 h-5 text-red-600" />
                  Connected Channel
                </div>
                <Badge variant="default" data-testid="badge-connected">Connected</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                {channelData.thumbnailUrl && (
                  <img
                    src={channelData.thumbnailUrl}
                    alt={channelData.channelTitle}
                    className="w-20 h-20 rounded-full"
                    data-testid="img-channel-thumbnail"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold" data-testid="text-channel-title">
                    {channelData.channelTitle}
                  </h3>
                  {channelData.channelDescription && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2" data-testid="text-channel-description">
                      {channelData.channelDescription}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Connected on {new Date(channelData.connectedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-2xl font-bold" data-testid="text-subscriber-count">
                      {parseInt(channelData.subscriberCount).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Subscribers</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Video className="w-4 h-4 text-muted-foreground" />
                    <span className="text-2xl font-bold" data-testid="text-video-count">
                      {parseInt(channelData.videoCount).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Videos</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span className="text-2xl font-bold" data-testid="text-view-count">
                      {parseInt(channelData.viewCount).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Total Views</p>
                </div>
              </div>

              <Button
                onClick={handleDisconnect}
                disabled={disconnectMutation.isPending}
                variant="outline"
                className="w-full"
                data-testid="button-disconnect-youtube"
              >
                {disconnectMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  <>
                    <Unlink className="w-4 h-4 mr-2" />
                    Disconnect Channel
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
