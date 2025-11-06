import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { GenerateVideoIdeaResponse } from "@shared/schema";

export default function TextToVideo() {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [generatedIdea, setGeneratedIdea] = useState<GenerateVideoIdeaResponse | null>(null);

  const generateIdeaMutation = useMutation({
    mutationFn: async () => {
      const niche = userProfile?.selectedNiche || userProfile?.channelDescription || "general content";
      return await apiRequest<GenerateVideoIdeaResponse>("/api/generate-video-idea", "POST", {
        niche,
        channelDescription: userProfile?.channelDescription,
      });
    },
    onSuccess: (data) => {
      setGeneratedIdea(data);
      setPrompt(data.description);
      toast({
        title: "Video Idea Generated!",
        description: "Your video concept is ready to customize.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate video idea",
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

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Text to Video</h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          Create engaging videos from your ideas with AI-powered generation
        </p>
      </div>

      <div className="grid gap-6">
        {generatedIdea && (
          <Card>
            <CardHeader>
              <CardTitle data-testid="text-generated-idea-title">Generated Video Idea</CardTitle>
              <CardDescription data-testid="text-generated-idea-subtitle">
                Here's your AI-generated video concept
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Title</Label>
                <p className="text-lg font-semibold" data-testid="text-idea-title">{generatedIdea.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">SEO Title</Label>
                <p data-testid="text-idea-seo-title">{generatedIdea.seoTitle}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-muted-foreground" data-testid="text-idea-description">{generatedIdea.seoDescription}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {generatedIdea.hashtags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                    data-testid={`badge-hashtag-${idx}`}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap space-y-0">
              <div>
                <CardTitle data-testid="text-video-prompt-title">Video Prompt</CardTitle>
                <CardDescription data-testid="text-video-prompt-subtitle">
                  Describe your video or generate a random idea
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => generateIdeaMutation.mutate()}
                disabled={generateIdeaMutation.isPending}
                data-testid="button-random-generate"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {generateIdeaMutation.isPending ? "Generating..." : "Random Generate"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Video Description</Label>
              <Textarea
                id="prompt"
                placeholder="Describe what you want your video to be about..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[150px] resize-none"
                data-testid="input-video-prompt"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                variant="secondary"
                onClick={() => enhancePromptMutation.mutate(prompt)}
                disabled={!prompt.trim() || enhancePromptMutation.isPending}
                data-testid="button-enhance-prompt"
              >
                <Zap className="mr-2 h-4 w-4" />
                {enhancePromptMutation.isPending ? "Enhancing..." : "Enhance Prompt"}
              </Button>
              <Button
                disabled={!prompt.trim()}
                data-testid="button-generate-video"
              >
                Generate Video
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
