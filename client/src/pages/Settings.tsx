import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Bell, Settings2, Download, Trash2, CheckCircle, XCircle, Youtube, ExternalLink, Key, Eye, EyeOff } from "lucide-react";
import type { UpdateUserSettings } from "@shared/schema";
import { useLocation } from "wouter";

interface UserSettings {
  defaultMood?: string;
  defaultPace?: string;
  defaultCategory?: string;
  defaultMediaSource?: string;
  defaultAspectRatio?: string;
  notificationsEnabled?: string;
  emailNotificationsEnabled?: string;
}

interface ApiKeys {
  openrouterApiKey?: string;
  murfApiKey?: string;
  pexelsApiKey?: string;
  freesoundApiKey?: string;
  cloudflareApiKey?: string;
  cloudflareWorkerUrl?: string;
}

export default function Settings() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [localApiKeys, setLocalApiKeys] = useState<ApiKeys>({});
  
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const { data: settings, isLoading } = useQuery<UserSettings>({
    queryKey: ["/api/user/settings"],
  });

  const { data: youtubeChannel, isLoading: youtubeLoading } = useQuery<{
    channelId: string;
    channelTitle: string;
    subscriberCount: string;
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

  const { data: apiKeys, isLoading: apiKeysLoading } = useQuery<ApiKeys>({
    queryKey: ["/api/user/api-keys"],
    onSuccess: (data) => {
      setLocalApiKeys(data);
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: UpdateUserSettings) => {
      return apiRequest("/api/user/settings", "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/settings"] });
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const exportDataMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/user/export-data", {
        headers: {
          "x-user-id": localStorage.getItem("userId") || "",
        },
      });
      if (!response.ok) throw new Error("Failed to export data");
      return response.json();
    },
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `user-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Data exported",
        description: "Your data has been downloaded successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to export data",
        variant: "destructive",
      });
    },
  });

  const handleRequestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === "granted") {
        updateSettingsMutation.mutate({ notificationsEnabled: "true" });
        toast({
          title: "Notifications enabled",
          description: "You will now receive browser notifications.",
        });
      } else if (permission === "denied") {
        toast({
          title: "Permission denied",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive",
        });
      }
    }
  };

  const handleToggleBrowserNotifications = (enabled: boolean) => {
    if (enabled && notificationPermission !== "granted") {
      handleRequestNotificationPermission();
    } else {
      updateSettingsMutation.mutate({ notificationsEnabled: enabled ? "true" : "false" });
    }
  };

  const handleToggleEmailNotifications = (enabled: boolean) => {
    updateSettingsMutation.mutate({ emailNotificationsEnabled: enabled ? "true" : "false" });
  };

  const handleUpdatePreference = (key: keyof UpdateUserSettings, value: string) => {
    updateSettingsMutation.mutate({ [key]: value });
  };

  const connectYoutubeMutation = useMutation({
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
    },
  });

  const disconnectYoutubeMutation = useMutation({
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

  const updateApiKeysMutation = useMutation({
    mutationFn: async (data: ApiKeys) => {
      return apiRequest("/api/user/api-keys", "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/api-keys"] });
      toast({
        title: "API Keys saved",
        description: "Your API keys have been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save API keys",
        variant: "destructive",
      });
    },
  });

  const handleSaveApiKeys = () => {
    updateApiKeysMutation.mutate(localApiKeys);
  };

  const toggleShowApiKey = (key: string) => {
    setShowApiKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const maskApiKey = (key: string | undefined) => {
    if (!key || key.length === 0) return '';
    if (key.length <= 8) return '•'.repeat(key.length);
    return key.slice(0, 4) + '•'.repeat(key.length - 8) + key.slice(-4);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Loading your preferences...</p>
        </div>
      </div>
    );
  }

  const browserNotificationsEnabled = settings?.notificationsEnabled === "true";
  const emailNotificationsEnabled = settings?.emailNotificationsEnabled === "true";

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Settings</h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          Manage your account preferences and notification settings
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle data-testid="text-notification-settings-title">Notification Settings</CardTitle>
            </div>
            <CardDescription>
              Control how and when you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="browser-notifications" className="text-base" data-testid="label-browser-notifications">
                  Browser Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when your video generation is complete
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {notificationPermission === "granted" ? (
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Enabled
                    </Badge>
                  ) : notificationPermission === "denied" ? (
                    <Badge variant="destructive" className="gap-1">
                      <XCircle className="h-3 w-3" />
                      Blocked
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1">
                      Not Set
                    </Badge>
                  )}
                </div>
              </div>
              <Switch
                id="browser-notifications"
                checked={browserNotificationsEnabled}
                onCheckedChange={handleToggleBrowserNotifications}
                data-testid="switch-browser-notifications"
              />
            </div>

            {notificationPermission === "denied" && (
              <div className="p-4 bg-destructive/10 rounded-md">
                <p className="text-sm text-destructive">
                  Browser notifications are blocked. Please enable them in your browser settings and click the button below to try again.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={handleRequestNotificationPermission}
                  data-testid="button-request-notification-permission"
                >
                  Request Permission Again
                </Button>
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications" className="text-base" data-testid="label-email-notifications">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive email updates when your content is ready
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotificationsEnabled}
                onCheckedChange={handleToggleEmailNotifications}
                data-testid="switch-email-notifications"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              <CardTitle data-testid="text-default-preferences-title">Default Preferences</CardTitle>
            </div>
            <CardDescription>
              Set your default options for video generation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="default-mood" data-testid="label-default-mood">Default Mood</Label>
                <Select
                  value={settings?.defaultMood || ""}
                  onValueChange={(value) => handleUpdatePreference("defaultMood", value)}
                >
                  <SelectTrigger id="default-mood" data-testid="select-default-mood">
                    <SelectValue placeholder="Select mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="happy">Happy</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="sad">Sad</SelectItem>
                    <SelectItem value="promotional">Promotional</SelectItem>
                    <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-pace" data-testid="label-default-pace">Default Pace</Label>
                <Select
                  value={settings?.defaultPace || ""}
                  onValueChange={(value) => handleUpdatePreference("defaultPace", value)}
                >
                  <SelectTrigger id="default-pace" data-testid="select-default-pace">
                    <SelectValue placeholder="Select pace" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="fast">Fast</SelectItem>
                    <SelectItem value="very_fast">Very Fast</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-category" data-testid="label-default-category">Default Category</Label>
                <Select
                  value={settings?.defaultCategory || ""}
                  onValueChange={(value) => handleUpdatePreference("defaultCategory", value)}
                >
                  <SelectTrigger id="default-category" data-testid="select-default-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tech">Tech</SelectItem>
                    <SelectItem value="cooking">Cooking</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="gaming">Gaming</SelectItem>
                    <SelectItem value="fitness">Fitness</SelectItem>
                    <SelectItem value="vlog">Vlog</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="tutorial">Tutorial</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="gospel">Gospel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-media-source" data-testid="label-default-media-source">Default Media Source</Label>
                <Select
                  value={settings?.defaultMediaSource || ""}
                  onValueChange={(value) => handleUpdatePreference("defaultMediaSource", value)}
                >
                  <SelectTrigger id="default-media-source" data-testid="select-default-media-source">
                    <SelectValue placeholder="Select media source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stock">Stock</SelectItem>
                    <SelectItem value="ai">AI Generated</SelectItem>
                    <SelectItem value="auto">Auto (AI Decides)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-aspect-ratio" data-testid="label-default-aspect-ratio">Default Aspect Ratio</Label>
                <Select
                  value={settings?.defaultAspectRatio || ""}
                  onValueChange={(value) => handleUpdatePreference("defaultAspectRatio", value)}
                >
                  <SelectTrigger id="default-aspect-ratio" data-testid="select-default-aspect-ratio">
                    <SelectValue placeholder="Select aspect ratio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                    <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              These defaults will be automatically applied when generating new content. You can always change them for individual generations.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              <CardTitle data-testid="text-api-keys-title">API Keys</CardTitle>
            </div>
            <CardDescription>
              Add your own API keys for external services. Your keys are encrypted and stored securely.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                By adding your own API keys, you can use your own accounts with these services. This gives you full control over your usage and costs. If you don't add keys, the app will use shared keys (subject to rate limits).
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openrouter-api-key" data-testid="label-openrouter-api-key">
                  OpenRouter API Key
                  <span className="text-xs text-muted-foreground ml-2">(For AI script generation)</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="openrouter-api-key"
                    type={showApiKeys.openrouter ? "text" : "password"}
                    placeholder="sk-or-v1-..."
                    value={localApiKeys.openrouterApiKey || ''}
                    onChange={(e) => setLocalApiKeys(prev => ({ ...prev, openrouterApiKey: e.target.value }))}
                    data-testid="input-openrouter-api-key"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => toggleShowApiKey('openrouter')}
                    data-testid="button-toggle-openrouter-key"
                  >
                    {showApiKeys.openrouter ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="murf-api-key" data-testid="label-murf-api-key">
                  Murf.ai API Key
                  <span className="text-xs text-muted-foreground ml-2">(For text-to-speech)</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="murf-api-key"
                    type={showApiKeys.murf ? "text" : "password"}
                    placeholder="ap2_..."
                    value={localApiKeys.murfApiKey || ''}
                    onChange={(e) => setLocalApiKeys(prev => ({ ...prev, murfApiKey: e.target.value }))}
                    data-testid="input-murf-api-key"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => toggleShowApiKey('murf')}
                    data-testid="button-toggle-murf-key"
                  >
                    {showApiKeys.murf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pexels-api-key" data-testid="label-pexels-api-key">
                  Pexels API Key
                  <span className="text-xs text-muted-foreground ml-2">(For stock photos/videos)</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="pexels-api-key"
                    type={showApiKeys.pexels ? "text" : "password"}
                    placeholder="Your Pexels API key"
                    value={localApiKeys.pexelsApiKey || ''}
                    onChange={(e) => setLocalApiKeys(prev => ({ ...prev, pexelsApiKey: e.target.value }))}
                    data-testid="input-pexels-api-key"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => toggleShowApiKey('pexels')}
                    data-testid="button-toggle-pexels-key"
                  >
                    {showApiKeys.pexels ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="freesound-api-key" data-testid="label-freesound-api-key">
                  FreeSound API Key
                  <span className="text-xs text-muted-foreground ml-2">(For background music)</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="freesound-api-key"
                    type={showApiKeys.freesound ? "text" : "password"}
                    placeholder="Your FreeSound API key"
                    value={localApiKeys.freesoundApiKey || ''}
                    onChange={(e) => setLocalApiKeys(prev => ({ ...prev, freesoundApiKey: e.target.value }))}
                    data-testid="input-freesound-api-key"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => toggleShowApiKey('freesound')}
                    data-testid="button-toggle-freesound-key"
                  >
                    {showApiKeys.freesound ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cloudflare-api-key" data-testid="label-cloudflare-api-key">
                  Cloudflare AI API Key
                  <span className="text-xs text-muted-foreground ml-2">(For AI image generation)</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="cloudflare-api-key"
                    type={showApiKeys.cloudflare ? "text" : "password"}
                    placeholder="Your Cloudflare API key"
                    value={localApiKeys.cloudflareApiKey || ''}
                    onChange={(e) => setLocalApiKeys(prev => ({ ...prev, cloudflareApiKey: e.target.value }))}
                    data-testid="input-cloudflare-api-key"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => toggleShowApiKey('cloudflare')}
                    data-testid="button-toggle-cloudflare-key"
                  >
                    {showApiKeys.cloudflare ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cloudflare-worker-url" data-testid="label-cloudflare-worker-url">
                  Cloudflare Worker URL
                  <span className="text-xs text-muted-foreground ml-2">(Optional, for custom Cloudflare workers)</span>
                </Label>
                <Input
                  id="cloudflare-worker-url"
                  type="text"
                  placeholder="https://your-worker.workers.dev"
                  value={localApiKeys.cloudflareWorkerUrl || ''}
                  onChange={(e) => setLocalApiKeys(prev => ({ ...prev, cloudflareWorkerUrl: e.target.value }))}
                  data-testid="input-cloudflare-worker-url"
                />
              </div>
            </div>

            <Button
              onClick={handleSaveApiKeys}
              disabled={updateApiKeysMutation.isPending}
              data-testid="button-save-api-keys"
            >
              {updateApiKeysMutation.isPending ? "Saving..." : "Save API Keys"}
            </Button>

            <div className="p-4 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground">
                🔒 Your API keys are encrypted before being stored in our database. They are never shared with anyone and are only used when you generate content.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle data-testid="text-account-settings-title">Account Settings</CardTitle>
            <CardDescription>
              Manage your account and data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-2">YouTube Channel Connection</h3>
              <div className="flex items-center gap-2 mb-2">
                <Youtube className="h-5 w-5 text-red-600" />
                {youtubeLoading ? (
                  <Badge variant="outline" data-testid="badge-youtube-status">
                    Loading...
                  </Badge>
                ) : youtubeChannel ? (
                  <Badge variant="default" className="bg-green-600" data-testid="badge-youtube-status">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" data-testid="badge-youtube-status">
                    Not Connected
                  </Badge>
                )}
              </div>
              
              {youtubeChannel ? (
                <>
                  <div className="p-3 bg-muted rounded-md mb-3">
                    <p className="text-sm font-medium">{youtubeChannel.channelTitle}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {parseInt(youtubeChannel.subscriberCount).toLocaleString()} subscribers
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Connected {new Date(youtubeChannel.connectedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setLocation("/youtube/channel")}
                      data-testid="button-view-youtube-channel"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Channel Details
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => disconnectYoutubeMutation.mutate()}
                      disabled={disconnectYoutubeMutation.isPending}
                      data-testid="button-disconnect-youtube"
                    >
                      {disconnectYoutubeMutation.isPending ? "Disconnecting..." : "Disconnect"}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-3">
                    Connect your YouTube channel to enable direct uploads and analytics
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => connectYoutubeMutation.mutate()}
                    disabled={connectYoutubeMutation.isPending}
                    data-testid="button-connect-youtube"
                  >
                    <Youtube className="mr-2 h-4 w-4" />
                    {connectYoutubeMutation.isPending ? "Connecting..." : "Connect YouTube Channel"}
                  </Button>
                </>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-2">Export Your Data</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Download all your account data and generation history in JSON format
              </p>
              <Button
                variant="outline"
                onClick={() => exportDataMutation.mutate()}
                disabled={exportDataMutation.isPending}
                data-testid="button-export-data"
              >
                <Download className="mr-2 h-4 w-4" />
                {exportDataMutation.isPending ? "Exporting..." : "Export Data"}
              </Button>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-2 text-destructive">Danger Zone</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Button
                variant="destructive"
                data-testid="button-delete-account"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
