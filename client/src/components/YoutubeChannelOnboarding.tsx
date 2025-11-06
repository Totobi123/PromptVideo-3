import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Youtube, Sparkles, Loader2, Upload, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NicheChatbot } from "./NicheChatbot";

interface YoutubeChannelOnboardingProps {
  open: boolean;
  onComplete: (data: {
    hasYoutubeChannel: string;
    channelDescription?: string;
    selectedNiche?: string;
    channelName?: string;
    channelLogo?: string;
  }) => void;
}

type Step = "question" | "hasChannel" | "nicheSelection" | "channelName" | "logoSelection";

export function YoutubeChannelOnboarding({ open, onComplete }: YoutubeChannelOnboardingProps) {
  const [step, setStep] = useState<Step>("question");
  const [channelDescription, setChannelDescription] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("");
  const [aiNiches, setAiNiches] = useState<string[]>([]);
  const [loadingNiches, setLoadingNiches] = useState(false);
  const [hasChannelName, setHasChannelName] = useState<boolean | null>(null);
  const [inputChannelName, setInputChannelName] = useState("");
  const [generatedChannelNames, setGeneratedChannelNames] = useState<string[]>([]);
  const [selectedChannelName, setSelectedChannelName] = useState("");
  const [loadingChannelNames, setLoadingChannelNames] = useState(false);
  const [hasLogo, setHasLogo] = useState<boolean | null>(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [generatingLogo, setGeneratingLogo] = useState(false);
  const { toast } = useToast();

  const handleYes = () => {
    setStep("hasChannel");
  };

  const handleNo = async () => {
    setStep("nicheSelection");
    await loadAINiches();
  };

  const loadAINiches = async () => {
    setLoadingNiches(true);
    try {
      const response = await fetch("/api/generate-niche-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error("Failed to generate niches");
      }

      const data = await response.json();
      setAiNiches(data.niches || []);
    } catch (error) {
      console.error("Error generating niches:", error);
      toast({
        title: "Error",
        description: "Failed to generate niche suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingNiches(false);
    }
  };

  const handleExistingChannelSubmit = () => {
    if (channelDescription.trim().length < 20) {
      return;
    }
    onComplete({
      hasYoutubeChannel: "yes",
      channelDescription,
    });
  };

  const handleNicheSelection = () => {
    if (!selectedNiche) {
      return;
    }
    setStep("channelName");
  };

  const handleChannelNameChoice = async (hasName: boolean) => {
    setHasChannelName(hasName);
    if (!hasName) {
      await loadChannelNames();
    }
  };

  const loadChannelNames = async () => {
    setLoadingChannelNames(true);
    try {
      const response = await fetch("/api/generate-channel-name-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ niche: selectedNiche, count: 6 }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate channel names");
      }

      const data = await response.json();
      setGeneratedChannelNames(data.channelNames || []);
    } catch (error) {
      console.error("Error generating channel names:", error);
      toast({
        title: "Error",
        description: "Failed to generate channel names. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingChannelNames(false);
    }
  };

  const handleChannelNameSubmit = () => {
    const finalChannelName = hasChannelName ? inputChannelName : selectedChannelName;
    if (!finalChannelName) {
      return;
    }
    setStep("logoSelection");
  };

  const handleLogoChoice = async (has: boolean) => {
    setHasLogo(has);
    if (!has) {
      await generateLogo();
    }
  };

  const generateLogo = async () => {
    setGeneratingLogo(true);
    try {
      const finalChannelName = hasChannelName ? inputChannelName : selectedChannelName;
      const response = await fetch("/api/generate-channel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ niche: selectedNiche }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate logo");
      }

      const data = await response.json();
      setLogoUrl(data.logoUrl);
      toast({
        title: "Logo Generated!",
        description: "Your channel logo has been created.",
      });
    } catch (error) {
      console.error("Error generating logo:", error);
      toast({
        title: "Error",
        description: "Failed to generate logo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingLogo(false);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinalSubmit = () => {
    const finalChannelName = hasChannelName ? inputChannelName : selectedChannelName;
    onComplete({
      hasYoutubeChannel: "no",
      selectedNiche,
      channelName: finalChannelName,
      channelLogo: logoUrl,
    });
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto" 
        data-testid="dialog-youtube-onboarding"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {step === "question" && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <Youtube className="h-12 w-12 text-primary" />
                </div>
              </div>
              <DialogTitle className="text-2xl text-center" data-testid="text-youtube-question-title">
                Do you have a YouTube channel?
              </DialogTitle>
              <DialogDescription className="text-center text-base" data-testid="text-youtube-question-description">
                This helps us personalize your content creation experience
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3 py-6">
              <Button 
                size="lg" 
                onClick={handleYes}
                className="h-16 text-lg"
                data-testid="button-has-channel-yes"
              >
                <Youtube className="mr-2 h-5 w-5" />
                Yes, I have a channel
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={handleNo}
                className="h-16 text-lg"
                data-testid="button-has-channel-no"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                No, help me start one
              </Button>
            </div>
          </>
        )}

        {step === "hasChannel" && (
          <>
            <DialogHeader>
              <DialogTitle data-testid="text-channel-description-title">
                Tell us about your channel
              </DialogTitle>
              <DialogDescription data-testid="text-channel-description-subtitle">
                Share details about your channel so we can create content that matches your style
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="channelDescription" className="text-base">
                  Channel Description
                </Label>
                <Textarea
                  id="channelDescription"
                  placeholder="Describe your channel's niche, target audience, content style, and what makes it unique..."
                  value={channelDescription}
                  onChange={(e) => setChannelDescription(e.target.value)}
                  className="min-h-[150px] resize-none"
                  data-testid="input-channel-description"
                />
                <p className="text-sm text-muted-foreground">
                  Example: "Tech review channel focused on budget smartphones for students. Casual, informative style with weekly uploads."
                </p>
              </div>

              <Button
                onClick={handleExistingChannelSubmit}
                disabled={channelDescription.trim().length < 20}
                className="w-full"
                data-testid="button-submit-channel-description"
              >
                Continue
              </Button>
            </div>
          </>
        )}

        {step === "nicheSelection" && (
          <>
            <DialogHeader>
              <DialogTitle data-testid="text-niche-selection-title">
                Choose Your Niche
              </DialogTitle>
              <DialogDescription data-testid="text-niche-selection-subtitle">
                Select a niche that interests you. We'll help you create a unique channel.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              {loadingNiches ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Generating personalized niches...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2 max-h-[350px] overflow-y-auto pr-2">
                    {aiNiches.map((niche) => (
                      <Card
                        key={niche}
                        className={`p-4 cursor-pointer transition-all hover-elevate ${
                          selectedNiche === niche
                            ? "border-primary bg-primary/5 ring-2 ring-primary"
                            : ""
                        }`}
                        onClick={() => setSelectedNiche(niche)}
                        data-testid={`card-niche-${niche.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <p className="text-sm font-medium text-center">{niche}</p>
                      </Card>
                    ))}
                  </div>

                  <NicheChatbot onNicheSelect={setSelectedNiche} />

                  <Button
                    onClick={handleNicheSelection}
                    disabled={!selectedNiche}
                    className="w-full"
                    data-testid="button-submit-niche-selection"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Continue
                  </Button>
                </>
              )}
            </div>
          </>
        )}

        {step === "channelName" && (
          <>
            <DialogHeader>
              <DialogTitle data-testid="text-channel-name-title">
                Do you have a channel name?
              </DialogTitle>
              <DialogDescription data-testid="text-channel-name-subtitle">
                We can help you come up with creative names if you need inspiration
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {hasChannelName === null ? (
                <div className="flex flex-col gap-3">
                  <Button 
                    size="lg" 
                    onClick={() => handleChannelNameChoice(true)}
                    className="h-16"
                    data-testid="button-has-name-yes"
                  >
                    <Check className="mr-2 h-5 w-5" />
                    Yes, I have a name
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    onClick={() => handleChannelNameChoice(false)}
                    className="h-16"
                    data-testid="button-has-name-no"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    No, generate names for me
                  </Button>
                </div>
              ) : hasChannelName ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="channelName" className="text-base">
                      Enter Your Channel Name
                    </Label>
                    <Input
                      id="channelName"
                      placeholder="My Awesome Channel"
                      value={inputChannelName}
                      onChange={(e) => setInputChannelName(e.target.value)}
                      data-testid="input-channel-name"
                    />
                  </div>
                  <Button
                    onClick={handleChannelNameSubmit}
                    disabled={!inputChannelName.trim()}
                    className="w-full"
                    data-testid="button-submit-channel-name"
                  >
                    Continue
                  </Button>
                </>
              ) : (
                <>
                  {loadingChannelNames ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-3">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Generating creative names...</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label className="text-base">Choose a Name</Label>
                        <div className="grid grid-cols-1 gap-2">
                          {generatedChannelNames.map((name) => (
                            <Button
                              key={name}
                              variant={selectedChannelName === name ? "default" : "outline"}
                              className="justify-start h-auto py-3 px-4"
                              onClick={() => setSelectedChannelName(name)}
                              data-testid={`button-name-${name.toLowerCase().replace(/\s+/g, "-")}`}
                            >
                              {name}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <Button
                        onClick={handleChannelNameSubmit}
                        disabled={!selectedChannelName}
                        className="w-full"
                        data-testid="button-submit-generated-name"
                      >
                        Continue
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {step === "logoSelection" && (
          <>
            <DialogHeader>
              <DialogTitle data-testid="text-logo-selection-title">
                Channel Logo
              </DialogTitle>
              <DialogDescription data-testid="text-logo-selection-subtitle">
                Do you have a logo, or would you like us to generate one?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {hasLogo === null ? (
                <div className="flex flex-col gap-3">
                  <Button 
                    size="lg" 
                    onClick={() => handleLogoChoice(true)}
                    className="h-16"
                    data-testid="button-has-logo-yes"
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    I have a logo to upload
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    onClick={() => handleLogoChoice(false)}
                    className="h-16"
                    data-testid="button-has-logo-no"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate a logo for me
                  </Button>
                </div>
              ) : hasLogo ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="logoUpload" className="text-base">
                      Upload Your Logo
                    </Label>
                    <Input
                      id="logoUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      data-testid="input-logo-upload"
                    />
                  </div>
                  {logoUrl && (
                    <div className="flex flex-col items-center gap-3">
                      <img src={logoUrl} alt="Channel Logo" className="w-32 h-32 rounded-md object-cover" />
                      <Button
                        onClick={handleFinalSubmit}
                        className="w-full"
                        data-testid="button-complete-onboarding"
                      >
                        Complete Setup
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {generatingLogo ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-3">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Generating your logo...</p>
                    </div>
                  ) : logoUrl ? (
                    <div className="flex flex-col items-center gap-3">
                      <img src={logoUrl} alt="Generated Logo" className="w-32 h-32 rounded-md object-cover" />
                      <Button
                        onClick={handleFinalSubmit}
                        className="w-full"
                        data-testid="button-complete-onboarding"
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Complete Setup
                      </Button>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
