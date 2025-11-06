import { useState } from "react";
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
import { Card } from "@/components/ui/card";
import { Youtube, Sparkles } from "lucide-react";
import { YOUTUBE_NICHES } from "@shared/schema";

interface YoutubeChannelOnboardingProps {
  open: boolean;
  onComplete: (data: {
    hasYoutubeChannel: string;
    channelDescription?: string;
    selectedNiche?: string;
  }) => void;
}

export function YoutubeChannelOnboarding({ open, onComplete }: YoutubeChannelOnboardingProps) {
  const [step, setStep] = useState<"question" | "hasChannel" | "noChannel">("question");
  const [channelDescription, setChannelDescription] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("");

  const handleYes = () => {
    setStep("hasChannel");
  };

  const handleNo = () => {
    setStep("noChannel");
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

  const handleNewChannelSubmit = () => {
    if (!selectedNiche) {
      return;
    }
    onComplete({
      hasYoutubeChannel: "no",
      selectedNiche,
    });
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-[600px]" 
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

        {step === "noChannel" && (
          <>
            <DialogHeader>
              <DialogTitle data-testid="text-niche-selection-title">
                Choose Your Niche
              </DialogTitle>
              <DialogDescription data-testid="text-niche-selection-subtitle">
                Select a niche that interests you. We'll help you create a unique channel name and logo.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-2">
                {YOUTUBE_NICHES.map((niche) => (
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

              <Button
                onClick={handleNewChannelSubmit}
                disabled={!selectedNiche}
                className="w-full mt-4"
                data-testid="button-submit-niche-selection"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate My Channel
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
