import { Card } from "@/components/ui/card";
import { Smile, Briefcase, Heart, Megaphone, Sparkles, Gauge, Zap, Rocket, Clock } from "lucide-react";

interface SelectionOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

interface SelectionBoxesProps {
  type: "mood" | "pace" | "length";
  selected: string;
  onSelect: (value: string) => void;
}

const moodOptions: SelectionOption[] = [
  { value: "happy", label: "Happy", icon: <Smile className="w-5 h-5" /> },
  { value: "casual", label: "Casual", icon: <Sparkles className="w-5 h-5" /> },
  { value: "sad", label: "Sad", icon: <Heart className="w-5 h-5" /> },
  { value: "promotional", label: "Promotional", icon: <Megaphone className="w-5 h-5" /> },
  { value: "enthusiastic", label: "Enthusiastic", icon: <Zap className="w-5 h-5" /> },
];

const paceOptions: SelectionOption[] = [
  { value: "normal", label: "Normal", icon: <Gauge className="w-5 h-5" /> },
  { value: "fast", label: "Fast", icon: <Zap className="w-5 h-5" /> },
  { value: "very_fast", label: "Very Fast", icon: <Rocket className="w-5 h-5" /> },
];

const lengthOptions: SelectionOption[] = [
  { value: "30", label: "30 seconds", icon: <Clock className="w-5 h-5" /> },
  { value: "60", label: "1 minute", icon: <Clock className="w-5 h-5" /> },
  { value: "120", label: "2 minutes", icon: <Clock className="w-5 h-5" /> },
  { value: "180", label: "3 minutes", icon: <Clock className="w-5 h-5" /> },
  { value: "300", label: "5 minutes", icon: <Clock className="w-5 h-5" /> },
];

export function SelectionBoxes({ type, selected, onSelect }: SelectionBoxesProps) {
  const options = type === "mood" ? moodOptions : type === "pace" ? paceOptions : lengthOptions;
  const title = type === "mood" ? "Select Mood" : type === "pace" ? "Select Pace" : "Video Length";

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-foreground">{title}</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {options.map((option) => {
          const isSelected = selected === option.value;
          return (
            <Card
              key={option.value}
              data-testid={`button-select-${type}-${option.value}`}
              onClick={() => onSelect(option.value)}
              className={`p-6 cursor-pointer transition-all hover-elevate active-elevate-2 ${
                isSelected
                  ? "border-2 border-primary shadow-lg shadow-primary/20"
                  : "border-border"
              }`}
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <div className={`${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                  {option.icon}
                </div>
                <span className={`text-sm font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                  {option.label}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
