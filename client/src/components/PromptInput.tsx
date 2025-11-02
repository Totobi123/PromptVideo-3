import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function PromptInput({ value, onChange, disabled }: PromptInputProps) {
  const [charCount, setCharCount] = useState(value.length);
  const [wordCount, setWordCount] = useState(0);
  const [showCharWarning, setShowCharWarning] = useState(false);

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
        disabled={disabled}
        placeholder="Describe your video in detail... For example: 'Create a 2-minute educational video about the life cycle of butterflies, targeting children aged 8-12. Include colorful visuals and a cheerful tone.'"
        className={cn(
          "min-h-[160px] text-base bg-card resize-none focus-visible:ring-primary",
          showCharWarning ? "border-destructive" : "border-border"
        )}
      />
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
