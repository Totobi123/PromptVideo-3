import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";

export default function YoutubeCallback() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Connecting your YouTube channel...");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const error = urlParams.get("error");

    if (error) {
      setStatus("error");
      setMessage(`YouTube authorization failed: ${error}`);
      return;
    }

    if (!code) {
      setStatus("error");
      setMessage("No authorization code received from YouTube");
      return;
    }

    const handleCallback = async () => {
      try {
        const redirectUri = `${window.location.origin}/youtube/callback`;
        const channelData = await apiRequest("/api/youtube/auth/callback", "POST", {
          code,
          redirectUri,
        });

        localStorage.setItem('youtube_channel_connected', 'true');
        localStorage.setItem('youtube_channel_data', JSON.stringify(channelData));

        setStatus("success");
        setMessage("Successfully connected your YouTube channel!");
        setTimeout(() => {
          setLocation("/youtube/channel");
        }, 2000);
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error 
            ? error.message 
            : "Failed to connect YouTube channel"
        );
      }
    };

    handleCallback();
  }, [setLocation]);

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {status === "loading" && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
              {status === "success" && <CheckCircle2 className="w-5 h-5 text-green-600" />}
              {status === "error" && <XCircle className="w-5 h-5 text-destructive" />}
              {status === "loading" && "Connecting YouTube Channel"}
              {status === "success" && "Connection Successful"}
              {status === "error" && "Connection Failed"}
            </CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent>
            {status === "loading" && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {status === "success" && (
              <p className="text-sm text-muted-foreground">
                Redirecting you to your channel page...
              </p>
            )}
            {status === "error" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Please try connecting your channel again.
                </p>
                <Button
                  onClick={() => setLocation("/youtube/channel")}
                  className="w-full"
                  data-testid="button-back-to-channel"
                >
                  Back to YouTube Channel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
