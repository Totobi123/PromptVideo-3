import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function PromptInput({ value, onChange, disabled }: PromptInputProps) {
  const [charCount, setCharCount] = useState(value.length);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setCharCount(newValue.length);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Describe Your Video
        </label>
        <span className="text-xs text-muted-foreground">
          {charCount} characters
        </span>
      </div>
      <Textarea
        data-testid="input-video-prompt"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder="Describe your video in detail... For example: 'Create a 2-minute educational video about the life cycle of butterflies, targeting children aged 8-12. Include colorful visuals and a cheerful tone.'"
        className="min-h-[160px] text-base bg-card border-border resize-none focus-visible:ring-primary"
      />
      <p className="text-xs text-muted-foreground">
        Be as detailed as possible for better results. Include topic, target audience, tone, and key points.
      </p>
    </div>
  );
}
