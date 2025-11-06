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
import { OnboardingSurvey, type OnboardingData } from "@/components/OnboardingSurvey";
import { YoutubeChannelOnboarding } from "@/components/YoutubeChannelOnboarding";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw, AlertCircle, Video, Download, Keyboard, Bell, BellOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { GenerateChannelNameResponse } from "@shared/schema";
import { renderManager } from "@/lib/renderManager";
import { requestNotificationPermission, hasNotificationPermission, isNotificationSupported } from "@/lib/notifications";

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
  duration: 0.5,
  ease: [0.22, 1, 0.36, 1],
};

const resultsContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const resultsCardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function TextToVideo() {
  const { toast } = useToast();
  const { userProfile, updateUserProfile } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showYoutubeOnboarding, setShowYoutubeOnboarding] = useState(false);
  const [isGeneratingChannel, setIsGeneratingChannel] = useState(false);
  const sessionKey = "video-session";
  const [currentStep, setCurrentStep] = useLocalStorage<Step>("video-current-step", "prompt", 2, sessionKey);
  const [prompt, setPrompt] = useLocalStorage("video-prompt", "", 2, sessionKey);
  const [mood, setMood] = useLocalStorage("video-mood", "", 2, sessionKey);
  const [pace, setPace] = useLocalStorage("video-pace", "", 2, sessionKey);
  const [length, setLength] = useLocalStorage("video-length", "", 2, sessionKey);
  const [audience, setAudience] = useLocalStorage("video-audience", "", 2, sessionKey);
  const [category, setCategory] = useLocalStorage("video-category", "", 2, sessionKey);
  const [mediaSource, setMediaSource] = useLocalStorage("video-media-source", "stock", 2, sessionKey);
  const [progress, setProgress] = useState(0);
  const [scriptSegments, setScriptSegments] = useLocalStorage<ScriptSegment[]>("video-script-segments", [], 2, sessionKey);
  const [mediaItems, setMediaItems] = useLocalStorage<MediaItem[]>("video-media-items", [], 2, sessionKey);
  const [audioUrl, setAudioUrl] = useLocalStorage<string>("video-audio-url", "", 2, sessionKey);
  const [voiceId, setVoiceId] = useLocalStorage<string>("video-voice-id", "", 2, sessionKey);
  const [voiceName, setVoiceName] = useLocalStorage<string>("video-voice-name", "", 2, sessionKey);
  const [musicUrl, setMusicUrl] = useLocalStorage<string>("video-music-url", "", 2, sessionKey);
  const [musicTitle, setMusicTitle] = useLocalStorage<string>("video-music-title", "", 2, sessionKey);
  const [musicCreator, setMusicCreator] = useLocalStorage<string>("video-music-creator", "", 2, sessionKey);
  const [musicLicense, setMusicLicense] = useLocalStorage<string>("video-music-license", "", 2, sessionKey);
  const [seoPackage, setSeoPackage] = useLocalStorage<{
    title: string;
    description: string;
    hashtags: string[];
  } | null>("video-seo-package", null, 2, sessionKey);
  const [chapters, setChapters] = useLocalStorage<Array<{
    timestamp: string;
    title: string;
  }>>("video-chapters", [], 2, sessionKey);
  const [ctaPlacements, setCtaPlacements] = useLocalStorage<Array<{
    timestamp: string;
    type: "subscribe" | "like" | "comment" | "link" | "product";
    message: string;
  }>>("video-cta-placements", [], 2, sessionKey);
  const [musicMixing, setMusicMixing] = useLocalStorage<{
    backgroundMusicVolume: number;
    voiceoverVolume: number;
    fadeInDuration: number;
    fadeOutDuration: number;
  } | null>("video-music-mixing", null, 2, sessionKey);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useLocalStorage<string>("video-rendered-url", "", 2, sessionKey);
  const [renderJobId, setRenderJobId] = useLocalStorage<string>("video-render-job-id", "", 2, sessionKey);
  const [aspectRatio, setAspectRatio] = useLocalStorage("video-aspect-ratio", "16:9", 2, sessionKey);
  const [fitMode, setFitMode] = useLocalStorage("video-fit-mode", "fit", 2, sessionKey);
  const [notificationsEnabled, setNotificationsEnabled] = useState(hasNotificationPermission());

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
    setAspectRatio("16:9");
    setFitMode("fit");
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

    if (renderJobId) {
      renderManager.acknowledgeJob(renderJobId);
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
          aspectRatio: aspectRatio,
          fitMode: fitMode,
          musicMixing: musicMixing || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start video rendering");
      }

      const job = await response.json();
      setRenderJobId(job.jobId);

      await renderManager.startRenderJob(job.jobId, {
        onProgress: (progress) => {
          setRenderProgress(progress);
        },
        onComplete: (url) => {
          setVideoUrl(url);
          setIsRendering(false);
          toast({
            title: "Video Ready!",
            description: "Your video has been rendered successfully.",
          });
        },
        onError: (error) => {
          setIsRendering(false);
          setRenderJobId("");
          toast({
            title: "Rendering Failed",
            description: error || "Failed to render video. Please try again.",
            variant: "destructive",
          });
        },
      });

      toast({
        title: "Rendering Started",
        description: "Your video is being rendered. You can switch tabs and we'll notify you when it's ready.",
      });

    } catch (error) {
      setIsRendering(false);
      setRenderJobId("");
      console.error("Error rendering video:", error);
      toast({
        title: "Rendering Failed",
        description: error instanceof Error ? error.message : "Failed to render video. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateOptimizedFilename = (title: string | undefined): string => {
    if (!title) {
      return "video.mp4";
    }
    
    const sanitized = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 50);
    
    return sanitized ? `${sanitized}.mp4` : "video.mp4";
  };

  const handleDownloadVideo = () => {
    if (videoUrl) {
      const filename = generateOptimizedFilename(seoPackage?.title);
      const a = document.createElement("a");
      a.href = videoUrl;
      a.download = filename;
      a.click();
      
      toast({
        title: "Video Downloaded",
        description: "Your video has been downloaded.",
      });
    }
  };

  const handleToggleNotifications = async () => {
    if (!isNotificationSupported()) {
      toast({
        title: "Not Supported",
        description: "Your browser doesn't support notifications.",
        variant: "destructive",
      });
      return;
    }

    if (hasNotificationPermission()) {
      toast({
        title: "Notifications Enabled",
        description: "We'll notify you when your video is ready.",
      });
    } else {
      const granted = await requestNotificationPermission();
      setNotificationsEnabled(granted);
      
      if (granted) {
        toast({
          title: "Notifications Enabled",
          description: "We'll notify you when your video is ready.",
        });
      } else {
        toast({
          title: "Permission Denied",
          description: "You won't receive notifications when videos are ready.",
          variant: "destructive",
        });
      }
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

  // Request notification permission on mount and cleanup old jobs
  useEffect(() => {
    const requestPermission = async () => {
      if (isNotificationSupported() && !hasNotificationPermission()) {
        const granted = await requestNotificationPermission();
        setNotificationsEnabled(granted);
      }
    };
    requestPermission();
    
    renderManager.cleanupOldJobs();
  }, []);

  // Check for existing render job on mount
  useEffect(() => {
    if (renderJobId) {
      const existingJob = renderManager.getActiveJob(renderJobId);
      if (existingJob) {
        setIsRendering(true);
        setRenderProgress(existingJob.progress);
        
        if (existingJob.videoUrl) {
          setVideoUrl(existingJob.videoUrl);
          setIsRendering(false);
        } else {
          renderManager.registerCallbacks(renderJobId, {
            onProgress: (progress) => {
              setRenderProgress(progress);
            },
            onComplete: (url) => {
              setVideoUrl(url);
              setIsRendering(false);
              toast({
                title: "Video Ready!",
                description: "Your video has been rendered successfully.",
              });
            },
            onError: (error) => {
              setIsRendering(false);
              setRenderJobId("");
              toast({
                title: "Rendering Failed",
                description: error || "Failed to render video. Please try again.",
                variant: "destructive",
              });
            },
          });
        }
      } else {
        setRenderJobId("");
        setIsRendering(false);
      }
    }
  }, []);

  // Cleanup callbacks on unmount
  useEffect(() => {
    return () => {
      if (renderJobId) {
        renderManager.unregisterCallbacks(renderJobId);
      }
    };
  }, [renderJobId]);

  // Check if YouTube and regular onboarding are needed
  useEffect(() => {
    if (userProfile) {
      if (!userProfile.hasYoutubeChannel) {
        setShowYoutubeOnboarding(true);
      } else if (!userProfile.onboardingCompleted) {
        setShowOnboarding(true);
      }
    }
  }, [userProfile]);

  // Handle YouTube channel onboarding completion
  const handleYoutubeOnboardingComplete = async (data: {
    hasYoutubeChannel: string;
    channelDescription?: string;
    selectedNiche?: string;
    channelName?: string;
    channelLogo?: string;
  }) => {
    try {
      setIsGeneratingChannel(true);
      const channelName = data.channelName || "";
      const channelLogo = data.channelLogo || "";

      const { error } = await updateUserProfile({
        hasYoutubeChannel: data.hasYoutubeChannel,
        channelDescription: data.channelDescription,
        selectedNiche: data.selectedNiche,
        channelName: channelName || undefined,
        channelLogo: channelLogo || undefined,
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to save channel information. Please try again.",
          variant: "destructive",
        });
      } else {
        setShowYoutubeOnboarding(false);
        setShowOnboarding(true);
        if (channelName) {
          toast({
            title: `Welcome to ${channelName}!`,
            description: "Your channel has been created. Let's complete your profile.",
          });
        } else {
          toast({
            title: "Channel Connected!",
            description: "Now let's complete your profile.",
          });
        }
      }
    } catch (error) {
      console.error("Error completing YouTube onboarding:", error);
      toast({
        title: "Error",
        description: "Failed to save channel information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingChannel(false);
    }
  };

  // Handle onboarding completion
  const handleOnboardingComplete = async (data: OnboardingData) => {
    try {
      const { error } = await updateUserProfile({
        ...data,
        onboardingCompleted: true
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to save onboarding data. Please try again.",
          variant: "destructive",
        });
      } else {
        setShowOnboarding(false);
        toast({
          title: "Welcome!",
          description: "Your profile has been set up successfully.",
        });
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast({
        title: "Error",
        description: "Failed to save onboarding data. Please try again.",
        variant: "destructive",
      });
    }
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement ||
        isGenerating ||
        isRendering
      ) {
        return;
      }

      const isMod = e.metaKey || e.ctrlKey;

      // Global shortcuts
      if (currentStep === "prompt") {
        // Enter to continue
        if (e.key === "Enter" && !isMod && prompt.trim()) {
          e.preventDefault();
          handleContinueToDetails();
        }
      }

      if (currentStep === "details") {
        // Escape to go back
        if (e.key === "Escape") {
          e.preventDefault();
          setCurrentStep("prompt");
        }
        
        // Ctrl/Cmd + Enter to generate
        if (e.key === "Enter" && isMod && mood && pace && length && audience && category) {
          e.preventDefault();
          handleGenerate();
        }

        // Ctrl/Cmd + A to autofill
        if (e.key === "a" && isMod && !isAutoFilling) {
          e.preventDefault();
          handleAutoFill();
        }
      }

      if (currentStep === "results") {
        // Escape to start over
        if (e.key === "Escape" && e.shiftKey) {
          e.preventDefault();
          handleStartOver();
        }

        // Ctrl/Cmd + E to export script
        if (e.key === "e" && isMod && scriptSegments.length > 0) {
          e.preventDefault();
          handleExportScript();
        }

        // Ctrl/Cmd + M to make video
        if (e.key === "m" && isMod && audioUrl && !isRendering) {
          e.preventDefault();
          handleMakeVideo();
        }

        // Ctrl/Cmd + D to download video
        if (e.key === "d" && isMod && videoUrl) {
          e.preventDefault();
          handleDownloadVideo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentStep, 
    prompt, 
    mood, 
    pace, 
    length, 
    audience, 
    category, 
    isGenerating,
    isAutoFilling,
    isRendering,
    scriptSegments,
    audioUrl,
    videoUrl
  ]);

  return (
    <div className="min-h-screen bg-background">
      <YoutubeChannelOnboarding 
        open={showYoutubeOnboarding} 
        onComplete={handleYoutubeOnboardingComplete} 
      />
      <OnboardingSurvey open={showOnboarding} onComplete={handleOnboardingComplete} />
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
                  <PromptInput 
                    value={prompt} 
                    onChange={setPrompt} 
                    userNiche={userProfile?.selectedNiche}
                    channelDescription={userProfile?.channelDescription}
                  />
                  <div className="space-y-2">
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
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Keyboard className="w-3 h-3" />
                      <span>Press <Badge variant="outline" className="px-1 py-0 text-xs">Enter</Badge> to continue</span>
                    </div>
                  </div>
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
                    <Tooltip>
                      <TooltipTrigger asChild>
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
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ctrl/Cmd + A</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <SelectionBoxes type="audience" selected={audience} onSelect={setAudience} />
                  <SelectionBoxes type="category" selected={category} onSelect={setCategory} />
                  <SelectionBoxes type="mediaSource" selected={mediaSource} onSelect={setMediaSource} />
                  <SelectionBoxes type="mood" selected={mood} onSelect={setMood} />
                  <SelectionBoxes type="pace" selected={pace} onSelect={setPace} />
                  <SelectionBoxes type="length" selected={length} onSelect={setLength} />
                  <div className="space-y-2">
                    <div className="flex gap-3 justify-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            data-testid="button-back-to-prompt"
                            onClick={() => setCurrentStep("prompt")}
                            variant="outline"
                            size="lg"
                          >
                            Back
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Esc</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
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
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Ctrl/Cmd + Enter</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Keyboard className="w-3 h-3" />
                      <span>
                        <Badge variant="outline" className="px-1 py-0 text-xs">Esc</Badge> to go back • 
                        <Badge variant="outline" className="px-1 py-0 text-xs mx-1">Ctrl/Cmd+Enter</Badge> to generate
                      </span>
                    </div>
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
              <motion.div
                variants={resultsContainerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                <motion.div
                  variants={resultsCardVariants}
                  className="flex items-center justify-between"
                >
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
                </motion.div>
                
                {scriptSegments.length === 0 && (
                  <motion.div variants={resultsCardVariants}>
                    <Card className="p-6">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <AlertCircle className="w-5 h-5" />
                        <p>No script segments generated. Please try again.</p>
                      </div>
                    </Card>
                  </motion.div>
                )}
                
                <motion.div
                  variants={resultsCardVariants}
                  className="grid lg:grid-cols-2 gap-6"
                >
                  <ScriptTimeline segments={scriptSegments} />
                  <MediaRecommendations items={mediaItems} />
                </motion.div>
                
                <motion.div variants={resultsCardVariants}>
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
                </motion.div>

                {seoPackage && (
                  <motion.div variants={resultsCardVariants}>
                    <SEOPackage seoPackage={seoPackage} />
                  </motion.div>
                )}

                {(chapters.length > 0 || ctaPlacements.length > 0 || musicMixing) && (
                  <motion.div variants={resultsCardVariants}>
                    <ProductionInfo
                      chapters={chapters}
                      ctaPlacements={ctaPlacements}
                      musicMixing={musicMixing || undefined}
                    />
                  </motion.div>
                )}

                <motion.div variants={resultsCardVariants}>
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
                </motion.div>

                <motion.div variants={resultsCardVariants}>
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
                      <div className="flex items-start gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <AlertCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-primary">
                          Rendering continues in the background. You can switch tabs or close this page - we'll notify you when it's ready!
                        </p>
                      </div>
                    )}

                    <SelectionBoxes type="aspectRatio" selected={aspectRatio} onSelect={setAspectRatio} />
                    <SelectionBoxes type="fitMode" selected={fitMode} onSelect={setFitMode} />
                    
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

                    <div className="flex items-center gap-2">
                      <Button
                        data-testid="button-make-video"
                        onClick={handleMakeVideo}
                        disabled={isRendering || !audioUrl}
                        size="lg"
                        className="flex-1 gap-2"
                      >
                        <Video className="w-5 h-5" />
                        {isRendering ? "Rendering..." : videoUrl ? "Render Again" : "Make Video Now"}
                      </Button>
                      
                      {isNotificationSupported() && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              data-testid="button-toggle-notifications"
                              onClick={handleToggleNotifications}
                              variant={notificationsEnabled ? "default" : "outline"}
                              size="lg"
                              className="gap-2"
                            >
                              {notificationsEnabled ? (
                                <Bell className="w-5 h-5" />
                              ) : (
                                <BellOff className="w-5 h-5" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{notificationsEnabled ? "Notifications enabled" : "Enable notifications"}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </Card>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
