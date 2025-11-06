import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Volume2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function TextToSpeech() {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [voiceId, setVoiceId] = useState("en-US-natalie");
  const [pace, setPace] = useState("normal");
  const [audioUrl, setAudioUrl] = useState("");

  const generateAudioMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest<{ audioUrl: string }>("/api/generate-audio", "POST", {
        text,
        voiceId,
        pace,
      });
    },
    onSuccess: (data) => {
      setAudioUrl(data.audioUrl);
      toast({
        title: "Audio Generated!",
        description: "Your text-to-speech audio is ready.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate audio",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Text to Speech</h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          Convert your text into professional voiceover audio
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle data-testid="text-tts-input-title">Text Input</CardTitle>
            <CardDescription data-testid="text-tts-input-subtitle">
              Enter the text you want to convert to speech
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text">Script Text</Label>
              <Textarea
                id="text"
                placeholder="Enter your script text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[200px] resize-none"
                data-testid="input-tts-text"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="voice">Voice</Label>
                <Select value={voiceId} onValueChange={setVoiceId}>
                  <SelectTrigger id="voice" data-testid="select-voice">
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-US-natalie">Natalie (Female, Natural)</SelectItem>
                    <SelectItem value="en-US-ryan">Ryan (Male, Professional)</SelectItem>
                    <SelectItem value="en-US-aria">Aria (Female, Energetic)</SelectItem>
                    <SelectItem value="en-US-davis">Davis (Male, Deep)</SelectItem>
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
            </div>

            <Button
              onClick={() => generateAudioMutation.mutate()}
              disabled={!text.trim() || generateAudioMutation.isPending}
              className="w-full"
              data-testid="button-generate-audio"
            >
              <Volume2 className="mr-2 h-4 w-4" />
              {generateAudioMutation.isPending ? "Generating..." : "Generate Audio"}
            </Button>
          </CardContent>
        </Card>

        {audioUrl && (
          <Card>
            <CardHeader>
              <CardTitle data-testid="text-audio-preview-title">Audio Preview</CardTitle>
              <CardDescription data-testid="text-audio-preview-subtitle">
                Listen to your generated audio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <audio controls className="w-full" data-testid="audio-player">
                <source src={audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
              <Button variant="outline" className="w-full" asChild data-testid="button-download-audio">
                <a href={audioUrl} download="voiceover.mp3">
                  <Download className="mr-2 h-4 w-4" />
                  Download Audio
                </a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
