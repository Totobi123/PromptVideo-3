import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Zap, Video, Download, Shuffle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { GenerateVideoIdeaResponse, ScriptSegment, MediaItem } from "@shared/schema";
import { ScriptTimeline } from "@/components/ScriptTimeline";
import { MediaRecommendations } from "@/components/MediaRecommendations";
import { VoiceAndMusicInfo } from "@/components/VoiceAndMusicInfo";

type MediaSource = "stock" | "ai" | "auto";

export default function TextToVideo() {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [mood, setMood] = useState("");
  const [pace, setPace] = useState("");
  const [length, setLength] = useState("");
  const [audience, setAudience] = useState("");
  const [category, setCategory] = useState("");
  const [mediaSource, setMediaSource] = useState<MediaSource>("auto");
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [fitMode, setFitMode] = useState<"fit" | "crop">("crop");
  const [transitionType, setTransitionType] = useState("fade");
  const [motionEffect, setMotionEffect] = useState("none");
  
  const [scriptSegments, setScriptSegments] = useState<ScriptSegment[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [voiceId, setVoiceId] = useState("");
  const [voiceName, setVoiceName] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [musicUrl, setMusicUrl] = useState("");
  const [musicTitle, setMusicTitle] = useState("");
  const [musicCreator, setMusicCreator] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [renderProgress, setRenderProgress] = useState(0);

  const generateRandomIdeaMutation = useMutation({
    mutationFn: async () => {
      const niche = userProfile?.selectedNiche || userProfile?.channelDescription || "general content";
      return await apiRequest<GenerateVideoIdeaResponse>("/api/generate-video-idea", "POST", {
        niche,
        channelDescription: userProfile?.channelDescription,
      });
    },
    onSuccess: (data) => {
      setPrompt(data.title);
      setMood(data.mood);
      setPace("normal");
      setLength(data.length.toString());
      setAudience(data.audience);
      setCategory(data.category);
      toast({
        title: "Random Idea Generated!",
        description: "A video idea based on your channel niche.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate idea",
        variant: "destructive",
      });
    },
  });

  const enhancePromptMutation = useMutation({
    mutationFn: async (promptToEnhance: string) => {
      return await apiRequest<{ improvedPrompt: string }>("/api/improve-prompt", "POST", {
        prompt: promptToEnhance,
      });
    },
    onSuccess: (data) => {
      setPrompt(data.improvedPrompt);
      toast({
        title: "Prompt Enhanced!",
        description: "Your prompt has been improved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to enhance prompt",
        variant: "destructive",
      });
    },
  });

  const generateScriptMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/generate-script", "POST", {
        prompt,
        mood,
        pace,
        length: parseInt(length),
        audience,
        category,
        mediaSource,
      });
    },
    onSuccess: (data: any) => {
      setScriptSegments(data.segments as ScriptSegment[]);
      setMediaItems(data.mediaItems as MediaItem[]);
      setVoiceId(data.voiceId);
      setVoiceName(data.voiceName);
      setAudioUrl(data.audioUrl);
      setMusicUrl(data.musicUrl);
      setMusicTitle(data.musicTitle);
      setMusicCreator(data.musicCreator);
      toast({
        title: "Script Generated!",
        description: "Your video script with media and audio is ready.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate script",
        variant: "destructive",
      });
    },
  });

  const renderVideoMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/render-video", "POST", {
        audioUrl,
        musicUrl,
        mediaItems,
        aspectRatio,
        fitMode,
        transitionType,
        motionEffect,
      });
    },
    onSuccess: (data: any) => {
      setVideoUrl(data.videoUrl);
      setRenderProgress(100);
      toast({
        title: "Video Rendered!",
        description: "Your video is ready to download.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to render video",
        variant: "destructive",
      });
      setRenderProgress(0);
    },
  });

  const handleRenderVideo = () => {
    setRenderProgress(10);
    renderVideoMutation.mutate();
  };

  const isFormComplete = prompt && mood && pace && length && audience && category;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Text to Video</h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          Create complete videos from text with AI-generated scripts, voiceover, and visuals
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap space-y-0">
              <div>
                <CardTitle data-testid="text-prompt-title">Video Prompt</CardTitle>
                <CardDescription data-testid="text-prompt-subtitle">
                  Describe your video idea
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => generateRandomIdeaMutation.mutate()}
                disabled={generateRandomIdeaMutation.isPending}
                data-testid="button-random-idea"
              >
                <Shuffle className="mr-2 h-4 w-4" />
                {generateRandomIdeaMutation.isPending ? "Generating..." : "Random Idea"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Enter your video idea..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px] resize-none"
                data-testid="input-video-prompt"
              />
            </div>

            <Button
              variant="secondary"
              onClick={() => enhancePromptMutation.mutate(prompt)}
              disabled={!prompt.trim() || enhancePromptMutation.isPending}
              className="w-full"
              data-testid="button-enhance-prompt"
            >
              <Zap className="mr-2 h-4 w-4" />
              {enhancePromptMutation.isPending ? "Enhancing..." : "Enhance Prompt"}
            </Button>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mood">Mood</Label>
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger id="mood" data-testid="select-mood">
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
                <Label htmlFor="pace">Pace</Label>
                <Select value={pace} onValueChange={setPace}>
                  <SelectTrigger id="pace" data-testid="select-pace">
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
                <Label htmlFor="length">Length (seconds)</Label>
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger id="length" data-testid="select-length">
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 seconds (Short)</SelectItem>
                    <SelectItem value="60">60 seconds (Medium)</SelectItem>
                    <SelectItem value="90">90 seconds (Long)</SelectItem>
                    <SelectItem value="120">120 seconds (Extended)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience">Audience</Label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger id="audience" data-testid="select-audience">
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="teens">Teens</SelectItem>
                    <SelectItem value="adults">Adults</SelectItem>
                    <SelectItem value="professionals">Professionals</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category" data-testid="select-category">
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
                <Label htmlFor="mediaSource">Media Source</Label>
                <Select value={mediaSource} onValueChange={(v) => setMediaSource(v as MediaSource)}>
                  <SelectTrigger id="mediaSource" data-testid="select-media-source">
                    <SelectValue placeholder="Select media source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stock">Stock Images/Videos</SelectItem>
                    <SelectItem value="ai">AI Generated Images</SelectItem>
                    <SelectItem value="auto">Auto-Select (Smart)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={() => generateScriptMutation.mutate()}
              disabled={!isFormComplete || generateScriptMutation.isPending}
              className="w-full gap-2"
              size="lg"
              data-testid="button-generate-script"
            >
              <Sparkles className="w-5 h-5" />
              {generateScriptMutation.isPending ? "Generating Script..." : "Generate Script & Media"}
            </Button>
          </CardContent>
        </Card>

        {scriptSegments.length > 0 && (
          <>
            <ScriptTimeline segments={scriptSegments} />
            <MediaRecommendations items={mediaItems} />
            <VoiceAndMusicInfo
              voiceName={voiceName}
              audioUrl={audioUrl}
              musicTitle={musicTitle}
              musicCreator={musicCreator}
              musicUrl={musicUrl}
            />

            <Card>
              <CardHeader>
                <CardTitle data-testid="text-video-settings-title">Video Settings</CardTitle>
                <CardDescription data-testid="text-video-settings-subtitle">
                  Configure your video rendering options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="aspectRatio">Aspect Ratio</Label>
                    <Select value={aspectRatio} onValueChange={(v) => setAspectRatio(v as "16:9" | "9:16")}>
                      <SelectTrigger id="aspectRatio" data-testid="select-aspect-ratio">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="16:9">16:9 (Landscape - YouTube)</SelectItem>
                        <SelectItem value="9:16">9:16 (Portrait - TikTok/Instagram)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fitMode">Scaling Mode</Label>
                    <Select value={fitMode} onValueChange={(v) => setFitMode(v as "fit" | "crop")}>
                      <SelectTrigger id="fitMode" data-testid="select-fit-mode">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fit">Fit (Add Padding)</SelectItem>
                        <SelectItem value="crop">Crop (Zoom to Fill)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transitionType">Transition</Label>
                    <Select value={transitionType} onValueChange={setTransitionType}>
                      <SelectTrigger id="transitionType" data-testid="select-transition">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fade">Fade</SelectItem>
                        <SelectItem value="cut">Cut</SelectItem>
                        <SelectItem value="fadeblack">Fade Black</SelectItem>
                        <SelectItem value="fadewhite">Fade White</SelectItem>
                        <SelectItem value="dissolve">Dissolve</SelectItem>
                        <SelectItem value="wipeleft">Wipe Left</SelectItem>
                        <SelectItem value="wiperight">Wipe Right</SelectItem>
                        <SelectItem value="slideleft">Slide Left</SelectItem>
                        <SelectItem value="slideright">Slide Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="motionEffect">Motion Effect</Label>
                    <Select value={motionEffect} onValueChange={setMotionEffect}>
                      <SelectTrigger id="motionEffect" data-testid="select-motion">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="zoomin">Zoom In</SelectItem>
                        <SelectItem value="zoomout">Zoom Out</SelectItem>
                        <SelectItem value="panleft">Pan Left</SelectItem>
                        <SelectItem value="panright">Pan Right</SelectItem>
                        <SelectItem value="kenburns">Ken Burns</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleRenderVideo}
                  disabled={!audioUrl || renderVideoMutation.isPending}
                  className="w-full gap-2"
                  size="lg"
                  data-testid="button-render-video"
                >
                  <Video className="w-5 h-5" />
                  {renderVideoMutation.isPending ? "Rendering Video..." : "Render Video"}
                </Button>

                {renderVideoMutation.isPending && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Rendering...</span>
                      <span>{renderProgress}%</span>
                    </div>
                    <Progress value={renderProgress} />
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {videoUrl && (
          <Card>
            <CardHeader>
              <CardTitle data-testid="text-video-preview-title">Video Preview</CardTitle>
              <CardDescription data-testid="text-video-preview-subtitle">
                Your rendered video is ready
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <video controls className="w-full rounded-lg" data-testid="video-player">
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video element.
              </video>
              <Button variant="outline" className="w-full gap-2" asChild data-testid="button-download-video">
                <a href={videoUrl} download="video.mp4">
                  <Download className="h-4 w-4" />
                  Download Video
                </a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
