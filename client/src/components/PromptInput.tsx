import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { AlertCircle, Sparkles, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  userNiche?: string;
  channelDescription?: string;
}

export function PromptInput({ value, onChange, disabled, userNiche, channelDescription }: PromptInputProps) {
  const [charCount, setCharCount] = useState(value.length);
  const [wordCount, setWordCount] = useState(0);
  const [showCharWarning, setShowCharWarning] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setCharCount(newValue.length);
    
    const words = newValue.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  };

  useEffect(() => {
    const words = value.trim().split(/\s+/).filter(word => word.length > 0);
    const count = words.length;
    setWordCount(count);
    setShowCharWarning(value.trim().length > 0 && value.trim().length < 10);
  }, [value]);

  const handleImprovePrompt = async () => {
    if (value.trim().length < 10) {
      toast({
        title: "Prompt too short",
        description: "Please add at least 10 characters before improving.",
        variant: "destructive",
      });
      return;
    }

    setIsImproving(true);
    try {
      const response = await fetch("/api/improve-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: value }),
      });

      if (!response.ok) {
        throw new Error("Failed to improve prompt");
      }

      const data = await response.json();
      onChange(data.improvedPrompt);
      
      toast({
        title: "Prompt improved!",
        description: "Your prompt has been enhanced with AI suggestions.",
      });
    } catch (error) {
      console.error("Error improving prompt:", error);
      toast({
        title: "Error",
        description: "Failed to improve prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImproving(false);
    }
  };

  const handleGenerateIdea = async () => {
    if (!userNiche) {
      toast({
        title: "No niche selected",
        description: "Please complete your channel setup first to generate ideas.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingIdea(true);
    try {
      const response = await fetch("/api/generate-video-idea", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          niche: userNiche,
          channelDescription: channelDescription 
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate video idea");
      }

      const data = await response.json();
      const generatedPrompt = `${data.title}\n\n${data.description}`;
      onChange(generatedPrompt);
      
      toast({
        title: "Idea generated!",
        description: "A video idea has been created based on your niche.",
      });
    } catch (error) {
      console.error("Error generating video idea:", error);
      toast({
        title: "Error",
        description: "Failed to generate video idea. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingIdea(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Describe Your Video
        </label>
        <div className="flex items-center gap-3">
          <span 
            className="text-xs font-medium text-muted-foreground"
            data-testid="text-word-count"
          >
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </span>
          <span className="text-xs text-muted-foreground">
            {charCount} characters
          </span>
        </div>
      </div>
      <Textarea
        data-testid="input-video-prompt"
        value={value}
        onChange={handleChange}
        disabled={disabled || isImproving}
        placeholder="Describe your video in detail... For example: 'Create a 2-minute educational video about the life cycle of butterflies, targeting children aged 8-12. Include colorful visuals and a cheerful tone.'"
        className={cn(
          "min-h-[160px] text-base bg-card resize-none focus-visible:ring-primary",
          showCharWarning ? "border-destructive" : "border-border"
        )}
      />
      <div className="flex justify-end gap-2">
        {userNiche && (
          <Button
            data-testid="button-generate-idea"
            onClick={handleGenerateIdea}
            disabled={disabled || isGeneratingIdea}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Lightbulb className="w-4 h-4" />
            {isGeneratingIdea ? "Generating..." : "Generate Idea"}
          </Button>
        )}
        <Button
          data-testid="button-improve-prompt"
          onClick={handleImprovePrompt}
          disabled={disabled || isImproving || value.trim().length < 10}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {isImproving ? "Improving..." : "Optimize Prompt"}
        </Button>
      </div>
      {showCharWarning && (
        <div 
          className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20"
          data-testid="warning-word-count"
        >
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-xs text-destructive">
            Please add at least 10 characters to your description for better results. More detail helps create a more accurate video script!
          </p>
        </div>
      )}
      {!showCharWarning && (
        <p className="text-xs text-muted-foreground">
          Be as detailed as possible for better results. Include topic, target audience, tone, and key points.
        </p>
      )}
    </div>
  );
}
