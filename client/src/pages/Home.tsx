import { useState } from "react";
import { Header } from "@/components/Header";
import { PromptInput } from "@/components/PromptInput";
import { SelectionBoxes } from "@/components/SelectionBoxes";
import { ProgressSteps } from "@/components/ProgressSteps";
import { ScriptTimeline, type ScriptSegment } from "@/components/ScriptTimeline";
import { MediaRecommendations, type MediaItem } from "@/components/MediaRecommendations";
import { LoadingState } from "@/components/LoadingState";
import { ExportButtons } from "@/components/ExportButtons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, RefreshCw } from "lucide-react";

type Step = "prompt" | "details" | "generating" | "results";

const steps = [
  { id: "prompt", label: "Prompt" },
  { id: "details", label: "Details" },
  { id: "generating", label: "Generate" },
  { id: "results", label: "Results" },
];

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>("prompt");
  const [prompt, setPrompt] = useState("");
  const [mood, setMood] = useState("");
  const [pace, setPace] = useState("");
  const [length, setLength] = useState("");
  const [progress, setProgress] = useState(0);
  const [scriptSegments, setScriptSegments] = useState<ScriptSegment[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  const handleContinueToDetails = () => {
    if (prompt.trim()) {
      setCurrentStep("details");
    }
  };

  const handleGenerate = () => {
    if (mood && pace && length) {
      setCurrentStep("generating");
      setProgress(0);
      
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setScriptSegments([
                {
                  startTime: "00:00",
                  endTime: "00:20",
                  text: "Welcome to our exploration of " + prompt.substring(0, 50) + "... Let's dive into this fascinating topic.",
                },
                {
                  startTime: "00:20",
                  endTime: "00:50",
                  text: "In this video, we'll cover the key aspects and important details you need to know.",
                },
                {
                  startTime: "00:50",
                  endTime: "01:20",
                  text: "Understanding these concepts will help you gain valuable insights and knowledge.",
                },
              ]);
              setMediaItems([
                {
                  type: "image",
                  startTime: "00:00",
                  endTime: "00:20",
                  description: "Opening scene with relevant imagery",
                },
                {
                  type: "video",
                  startTime: "00:20",
                  endTime: "00:50",
                  description: "Dynamic footage showing key concepts",
                },
                {
                  type: "image",
                  startTime: "00:50",
                  endTime: "01:20",
                  description: "Closing visual summary",
                },
              ]);
              setCurrentStep("results");
            }, 500);
            return 100;
          }
          return prev + 2;
        });
      }, 50);
    }
  };

  const handleStartOver = () => {
    setCurrentStep("prompt");
    setPrompt("");
    setMood("");
    setPace("");
    setLength("");
    setProgress(0);
    setScriptSegments([]);
    setMediaItems([]);
  };

  const handleExportScript = () => {
    console.log("Exporting script...");
    const scriptText = scriptSegments
      .map((s) => `[${s.startTime} - ${s.endTime}]\n${s.text}`)
      .join("\n\n");
    const blob = new Blob([scriptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "video-script.txt";
    a.click();
  };

  const handleExportAudio = () => {
    console.log("Exporting audio...");
    alert("Audio export would integrate with Murf AI TTS service");
  };

  const handleExportMedia = () => {
    console.log("Exporting media list...");
    const mediaText = mediaItems
      .map((m) => `[${m.startTime} - ${m.endTime}] ${m.type.toUpperCase()}: ${m.description}`)
      .join("\n");
    const blob = new Blob([mediaText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "media-list.txt";
    a.click();
  };

  const getCurrentStepNumber = () => {
    const stepMap: Record<Step, number> = {
      prompt: 1,
      details: 2,
      generating: 3,
      results: 4,
    };
    return stepMap[currentStep];
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <ProgressSteps currentStep={getCurrentStepNumber()} steps={steps} />
        </div>

        {currentStep === "prompt" && (
          <Card className="p-8 max-w-3xl mx-auto">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-serif font-bold text-foreground">
                  Create Your Video Script
                </h2>
                <p className="text-muted-foreground">
                  Describe your video idea and let AI generate a professional script with voiceover and media recommendations
                </p>
              </div>
              <PromptInput value={prompt} onChange={setPrompt} />
              <Button
                data-testid="button-continue-to-details"
                onClick={handleContinueToDetails}
                disabled={!prompt.trim()}
                size="lg"
                className="w-full gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Continue to Details
              </Button>
            </div>
          </Card>
        )}

        {currentStep === "details" && (
          <Card className="p-8 max-w-5xl mx-auto">
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-serif font-bold text-foreground">
                  Customize Your Video
                </h2>
                <p className="text-muted-foreground">
                  Select the mood, pace, and length for your video
                </p>
              </div>
              <SelectionBoxes type="mood" selected={mood} onSelect={setMood} />
              <SelectionBoxes type="pace" selected={pace} onSelect={setPace} />
              <SelectionBoxes type="length" selected={length} onSelect={setLength} />
              <div className="flex gap-3 justify-center">
                <Button
                  data-testid="button-back-to-prompt"
                  onClick={() => setCurrentStep("prompt")}
                  variant="outline"
                  size="lg"
                >
                  Back
                </Button>
                <Button
                  data-testid="button-generate-script"
                  onClick={handleGenerate}
                  disabled={!mood || !pace || !length}
                  size="lg"
                  className="gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Generate Script
                </Button>
              </div>
            </div>
          </Card>
        )}

        {currentStep === "generating" && (
          <div className="max-w-2xl mx-auto">
            <LoadingState
              message="AI is generating your video script..."
              progress={progress}
            />
          </div>
        )}

        {currentStep === "results" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif font-bold text-foreground">
                Your Video Script is Ready!
              </h2>
              <Button
                data-testid="button-start-over"
                onClick={handleStartOver}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Start Over
              </Button>
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <ScriptTimeline segments={scriptSegments} />
              <MediaRecommendations items={mediaItems} />
            </div>
            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Export Your Content
                </h3>
                <ExportButtons
                  onExportScript={handleExportScript}
                  onExportAudio={handleExportAudio}
                  onExportMedia={handleExportMedia}
                />
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
