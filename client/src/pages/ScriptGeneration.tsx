import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Zap, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { GenerateVideoIdeaResponse } from "@shared/schema";

export default function ScriptGeneration() {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [topic, setTopic] = useState("");
  const [script, setScript] = useState("");
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
      setTopic(data.title);
      toast({
        title: "Topic Generated!",
        description: "Now generate your script based on this idea.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate topic",
        variant: "destructive",
      });
    },
  });

  const enhanceTopicMutation = useMutation({
    mutationFn: async (topicToEnhance: string) => {
      return await apiRequest<{ improvedPrompt: string }>("/api/improve-prompt", "POST", {
        prompt: topicToEnhance,
      });
    },
    onSuccess: (data) => {
      setTopic(data.improvedPrompt);
      toast({
        title: "Topic Enhanced!",
        description: "Your topic has been improved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to enhance topic",
        variant: "destructive",
      });
    },
  });

  const generateScriptMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/generate-script", "POST", {
        prompt: topic,
        mood: generatedIdea?.mood || "casual",
        pace: "normal",
        length: generatedIdea?.length || 90,
        audience: generatedIdea?.audience || "general",
        category: generatedIdea?.category || "entertainment",
        mediaSource: "stock",
      });
    },
    onSuccess: (data: any) => {
      const scriptText = data.segments.map((seg: any) => seg.text).join("\n\n");
      setScript(scriptText);
      toast({
        title: "Script Generated!",
        description: "Your video script is ready.",
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

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Script Generation</h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          Create professional video scripts powered by AI
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap space-y-0">
              <div>
                <CardTitle data-testid="text-topic-title">Video Topic</CardTitle>
                <CardDescription data-testid="text-topic-subtitle">
                  Enter your topic or auto-generate one
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => generateIdeaMutation.mutate()}
                disabled={generateIdeaMutation.isPending}
                data-testid="button-auto-generate-topic"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {generateIdeaMutation.isPending ? "Generating..." : "Auto Generate"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Textarea
                id="topic"
                placeholder="Enter your video topic..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="min-h-[100px] resize-none"
                data-testid="input-script-topic"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                variant="secondary"
                onClick={() => enhanceTopicMutation.mutate(topic)}
                disabled={!topic.trim() || enhanceTopicMutation.isPending}
                data-testid="button-enhance-topic"
              >
                <Zap className="mr-2 h-4 w-4" />
                {enhanceTopicMutation.isPending ? "Enhancing..." : "Enhance Topic"}
              </Button>
              <Button
                onClick={() => generateScriptMutation.mutate()}
                disabled={!topic.trim() || generateScriptMutation.isPending}
                data-testid="button-generate-script"
              >
                <FileText className="mr-2 h-4 w-4" />
                {generateScriptMutation.isPending ? "Generating..." : "Generate Script"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {script && (
          <Card>
            <CardHeader>
              <CardTitle data-testid="text-generated-script-title">Generated Script</CardTitle>
              <CardDescription data-testid="text-generated-script-subtitle">
                Your AI-generated video script
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  className="min-h-[400px] font-mono text-sm resize-none"
                  data-testid="textarea-generated-script"
                />
                <Button variant="outline" className="w-full" data-testid="button-copy-script">
                  Copy Script
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
