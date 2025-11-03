import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { PromptInput } from "@/components/PromptInput";
import { SelectionBoxes } from "@/components/SelectionBoxes";
import { ProgressSteps } from "@/components/ProgressSteps";
import { ScriptTimeline, type ScriptSegment } from "@/components/ScriptTimeline";
import { MediaRecommendations, type MediaItem } from "@/components/MediaRecommendations";
import { LoadingState } from "@/components/LoadingState";
import { ExportButtons } from "@/components/ExportButtons";
import { VoiceAndMusicInfo } from "@/components/VoiceAndMusicInfo";
import { SEOPackage } from "@/components/SEOPackage";
import { ProductionInfo } from "@/components/ProductionInfo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, RefreshCw, AlertCircle, Video, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Step = "prompt" | "details" | "generating" | "results";

const steps = [
  { id: "prompt", label: "Prompt" },
  { id: "details", label: "Details" },
  { id: "generating", label: "Generate" },
  { id: "results", label: "Results" },
];

const stepVariants = {
  initial: {
    opacity: 0,
    x: 50,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: -50,
  },
};

const stepTransition = {
  duration: 0.4,
  ease: "easeInOut",
};

export default function Dashboard() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<Step>("prompt");
  const [prompt, setPrompt] = useState("");
  const [mood, setMood] = useState("");
  const [pace, setPace] = useState("");
  const [length, setLength] = useState("");
  const [audience, setAudience] = useState("");
  const [category, setCategory] = useState("");
  const [mediaSource, setMediaSource] = useState("stock");
  const [progress, setProgress] = useState(0);
  const [scriptSegments, setScriptSegments] = useState<ScriptSegment[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [voiceId, setVoiceId] = useState<string>("");
  const [voiceName, setVoiceName] = useState<string>("");
  const [musicUrl, setMusicUrl] = useState<string>("");
  const [musicTitle, setMusicTitle] = useState<string>("");
  const [musicCreator, setMusicCreator] = useState<string>("");
  const [musicLicense, setMusicLicense] = useState<string>("");
  const [seoPackage, setSeoPackage] = useState<{
    title: string;
    description: string;
    hashtags: string[];
  } | null>(null);
  const [chapters, setChapters] = useState<Array<{
    timestamp: string;
    title: string;
  }>>([]);
  const [ctaPlacements, setCtaPlacements] = useState<Array<{
    timestamp: string;
    type: "subscribe" | "like" | "comment" | "link" | "product";
    message: string;
  }>>([]);
  const [musicMixing, setMusicMixing] = useState<{
    backgroundMusicVolume: number;
    voiceoverVolume: number;
    fadeInDuration: number;
    fadeOutDuration: number;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [renderJobId, setRenderJobId] = useState<string>("");

  const handleContinueToDetails = () => {
    if (prompt.trim()) {
      setCurrentStep("details");
    }
  };

  const handleAutoFill = async () => {
    if (!prompt.trim()) {
      toast({
        title: "No prompt",
        description: "Please enter a video description first.",
        variant: "destructive",
      });
      return;
    }

    setIsAutoFilling(true);
    try {
      const response = await fetch("/api/suggest-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to get suggestions");
      }

      const data = await response.json();
      
      setMood(data.mood);
      setCategory(data.category);
      setPace(data.pace);
      setAudience(data.audience);
      setLength(data.length.toString());
      
      toast({
        title: "Auto-filled!",
        description: "AI has selected the best settings for your video.",
      });
    } catch (error) {
      console.error("Error auto-filling details:", error);
      toast({
        title: "Error",
        description: "Failed to auto-fill details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleGenerate = async () => {
    if (mood && pace && length && audience && category) {
      setCurrentStep("generating");
      setProgress(0);
      setIsGenerating(true);
      
      try {
        const response = await fetch("/api/generate-script", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt,
            mood,
            pace,
            length: parseInt(length),
            audience,
            category,
            mediaSource,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to generate script");
        }

        const data = await response.json();
        
        setScriptSegments(data.segments);
        setMediaItems(data.mediaItems);
        setVoiceId(data.voiceId);
        setVoiceName(data.voiceName);
        setAudioUrl(data.audioUrl || "");
        setMusicUrl(data.musicUrl || "");
        setMusicTitle(data.musicTitle || "");
        setMusicCreator(data.musicCreator || "");
        setMusicLicense(data.musicLicense || "");
        setSeoPackage(data.seoPackage || null);
        setChapters(data.chapters || []);
        setCtaPlacements(data.ctaPlacements || []);
        setMusicMixing(data.musicMixing || null);
        setProgress(100);
        
        setTimeout(() => {
          setCurrentStep("results");
          setIsGenerating(false);
          
          toast({
            title: "Script Generated!",
            description: `Your video script is ready with voiceover and music.`,
          });
        }, 500);
      } catch (error) {
        console.error("Error generating script:", error);
        setIsGenerating(false);
        setCurrentStep("details");
        
        toast({
          title: "Generation Failed",
          description: error instanceof Error ? error.message : "Failed to generate script. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleStartOver = () => {
    setCurrentStep("prompt");
    setPrompt("");
    setMood("");
    setPace("");
    setLength("");
    setAudience("");
    setCategory("");
    setMediaSource("stock");
    setProgress(0);
    setScriptSegments([]);
    setMediaItems([]);
    setAudioUrl("");
    setVoiceId("");
    setVoiceName("");
    setMusicUrl("");
    setMusicTitle("");
    setMusicCreator("");
    setMusicLicense("");
    setSeoPackage(null);
    setChapters([]);
    setCtaPlacements([]);
    setMusicMixing(null);
  };

  const handleExportScript = () => {
    const scriptText = scriptSegments
      .map((s) => `[${s.startTime} - ${s.endTime}]\n${s.text}`)
      .join("\n\n");
    const blob = new Blob([scriptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "video-script.txt";
    a.click();
    
    toast({
      title: "Script Exported",
      description: "Your video script has been downloaded.",
    });
  };

  const handleDownloadVoiceover = () => {
    if (audioUrl) {
      const a = document.createElement("a");
      a.href = audioUrl;
      a.download = "voiceover.mp3";
      a.click();
      
      toast({
        title: "Voiceover Downloaded",
        description: "Your voiceover has been downloaded.",
      });
    }
  };

  const handleExportAudio = async () => {
    if (audioUrl) {
      window.open(audioUrl, "_blank");
      toast({
        title: "Voiceover Opened",
        description: "Your voiceover has been opened in a new tab.",
      });
      return;
    }

    // Fallback: Generate audio if not already generated
    try {
      const fullText = scriptSegments.map(s => s.text).join(" ");
      
      if (fullText.length > 3000) {
        toast({
          title: "Script Too Long for Audio",
          description: `Your script is ${fullText.length} characters. Murf's API has a 3000 character limit. Please use the exported script with a different text-to-speech tool.`,
          variant: "destructive",
        });
        return;
      }
      
      const response = await fetch("/api/generate-audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: fullText,
          voiceId: voiceId || "en-US-terrell",
          pace: pace as "normal" | "fast" | "very_fast",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate audio");
      }

      const data = await response.json();
      setAudioUrl(data.audioUrl);
      
      window.open(data.audioUrl, "_blank");
      
      toast({
        title: "Audio Generated",
        description: "Your voiceover has been generated and opened in a new tab.",
      });
    } catch (error) {
      console.error("Error generating audio:", error);
      toast({
        title: "Audio Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate voiceover. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportMedia = () => {
    const mediaText = mediaItems
      .map((m) => `[${m.startTime} - ${m.endTime}] ${m.type.toUpperCase()}: ${m.description}\nURL: ${m.url || "N/A"}`)
      .join("\n\n");
    const blob = new Blob([mediaText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "media-list.txt";
    a.click();
    
    toast({
      title: "Media List Exported",
      description: "Your stock media list has been downloaded.",
    });
  };

  const handleDownloadMusic = () => {
    if (musicUrl && musicTitle) {
      const a = document.createElement("a");
      a.href = musicUrl;
      a.download = `${musicTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.mp3`;
      a.click();
      
      toast({
        title: "Music Downloaded",
        description: "Background music has been downloaded.",
      });
    }
  };

  const handleMakeVideo = async () => {
    if (!audioUrl) {
      toast({
        title: "Missing Voiceover",
        description: "Please generate voiceover audio first.",
        variant: "destructive",
      });
      return;
    }

    if (mediaItems.length === 0 || !mediaItems[0].url) {
      toast({
        title: "Missing Media",
        description: "Please ensure media items have been loaded.",
        variant: "destructive",
      });
      return;
    }

    setIsRendering(true);
    setRenderProgress(0);
    setVideoUrl("");

    try {
      const response = await fetch("/api/render-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          segments: scriptSegments,
          mediaItems: mediaItems,
          audioUrl: audioUrl,
          musicUrl: musicUrl || undefined,
          musicMixing: musicMixing || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start video rendering");
      }

      const job = await response.json();
      setRenderJobId(job.jobId);

      const checkInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`/api/render-video/${job.jobId}`);
          if (!statusResponse.ok) {
            clearInterval(checkInterval);
            throw new Error("Failed to check render status");
          }

          const status = await statusResponse.json();
          setRenderProgress(status.progress);

          if (status.status === "completed") {
            clearInterval(checkInterval);
            setVideoUrl(status.videoUrl);
            setIsRendering(false);
            toast({
              title: "Video Ready!",
              description: "Your video has been rendered successfully.",
            });
          } else if (status.status === "failed") {
            clearInterval(checkInterval);
            setIsRendering(false);
            throw new Error(status.error || "Video rendering failed");
          }
        } catch (error) {
          clearInterval(checkInterval);
          setIsRendering(false);
          console.error("Error checking render status:", error);
        }
      }, 2000);

    } catch (error) {
      setIsRendering(false);
      console.error("Error rendering video:", error);
      toast({
        title: "Rendering Failed",
        description: error instanceof Error ? error.message : "Failed to render video. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadVideo = () => {
    if (videoUrl) {
      const a = document.createElement("a");
      a.href = videoUrl;
      a.download = "video.mp4";
      a.click();
      
      toast({
        title: "Video Downloaded",
        description: "Your video has been downloaded.",
      });
    }
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

  // Update progress during generation
  useEffect(() => {
    if (isGenerating && progress < 90) {
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 300);
      return () => clearInterval(interval);
    }
  }, [isGenerating, progress]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <ProgressSteps currentStep={getCurrentStepNumber()} steps={steps} />
        </div>

        <AnimatePresence mode="wait">
          {currentStep === "prompt" && (
            <motion.div
              key="prompt"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={stepVariants}
              transition={stepTransition}
            >
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
            </motion.div>
          )}

          {currentStep === "details" && (
            <motion.div
              key="details"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={stepVariants}
              transition={stepTransition}
            >
              <Card className="p-8 max-w-5xl mx-auto">
                <div className="space-y-8">
                  <div className="text-center space-y-4">
                    <h2 className="text-2xl font-serif font-bold text-foreground">
                      Customize Your Video
                    </h2>
                    <p className="text-muted-foreground">
                      Select the mood, pace, and length for your video
                    </p>
                    <Button
                      data-testid="button-autofill-details"
                      onClick={handleAutoFill}
                      disabled={isAutoFilling}
                      variant="default"
                      className="gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      {isAutoFilling ? "Auto-filling..." : "Auto-fill with AI"}
                    </Button>
                  </div>
                  <SelectionBoxes type="audience" selected={audience} onSelect={setAudience} />
                  <SelectionBoxes type="category" selected={category} onSelect={setCategory} />
                  <SelectionBoxes type="mediaSource" selected={mediaSource} onSelect={setMediaSource} />
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
                      disabled={!mood || !pace || !length || !audience || !category}
                      size="lg"
                      className="gap-2"
                    >
                      <Sparkles className="w-5 h-5" />
                      Generate Script
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {currentStep === "generating" && (
            <motion.div
              key="generating"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={stepVariants}
              transition={stepTransition}
            >
              <div className="max-w-2xl mx-auto">
                <LoadingState
                  message={`AI is generating your video script with ${mediaSource === "ai" ? "AI-generated images" : "stock media"}...`}
                  progress={progress}
                />
              </div>
            </motion.div>
          )}

          {currentStep === "results" && (
            <motion.div
              key="results"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={stepVariants}
              transition={stepTransition}
            >
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
                
                {scriptSegments.length === 0 && (
                  <Card className="p-6">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <AlertCircle className="w-5 h-5" />
                      <p>No script segments generated. Please try again.</p>
                    </div>
                  </Card>
                )}
                
                <div className="grid lg:grid-cols-2 gap-6">
                  <ScriptTimeline segments={scriptSegments} />
                  <MediaRecommendations items={mediaItems} />
                </div>
                
                <VoiceAndMusicInfo
                  voiceName={voiceName}
                  audioUrl={audioUrl}
                  musicTitle={musicTitle}
                  musicUrl={musicUrl}
                  musicCreator={musicCreator}
                  musicLicense={musicLicense}
                  onDownloadVoiceover={handleDownloadVoiceover}
                  onDownloadMusic={handleDownloadMusic}
                />

                {seoPackage && (
                  <SEOPackage seoPackage={seoPackage} />
                )}

                {(chapters.length > 0 || ctaPlacements.length > 0 || musicMixing) && (
                  <ProductionInfo
                    chapters={chapters}
                    ctaPlacements={ctaPlacements}
                    musicMixing={musicMixing || undefined}
                  />
                )}

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

                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-foreground">
                        Render Final Video
                      </h3>
                      {videoUrl && (
                        <Button
                          data-testid="button-download-video"
                          onClick={handleDownloadVideo}
                          variant="outline"
                          className="gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download Video
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Combine your script, voiceover, music, and media into a final MP4 video.
                    </p>
                    
                    {isRendering && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Rendering video...</span>
                          <span className="font-medium">{renderProgress}%</span>
                        </div>
                        <Progress value={renderProgress} data-testid="progress-video-render" />
                      </div>
                    )}

                    {videoUrl && (
                      <div className="rounded-lg border overflow-hidden">
                        <video
                          data-testid="video-preview"
                          controls
                          className="w-full"
                          src={videoUrl}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}

                    <Button
                      data-testid="button-make-video"
                      onClick={handleMakeVideo}
                      disabled={isRendering || !audioUrl}
                      size="lg"
                      className="w-full gap-2"
                    >
                      <Video className="w-5 h-5" />
                      {isRendering ? "Rendering..." : videoUrl ? "Render Again" : "Make Video Now"}
                    </Button>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
