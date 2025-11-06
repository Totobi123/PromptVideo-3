import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Loader2, Sparkles, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NicheChatbotProps {
  onNicheSelect: (niche: string) => void;
}

export function NicheChatbot({ onNicheSelect }: NicheChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedNiches, setSuggestedNiches] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleNicheClick = async (niche: string) => {
    setSelectedNiche(niche);
    setIsLoading(true);
    setExplanation(null);

    try {
      const response = await fetch("/api/explain-niche", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ niche }),
      });

      if (!response.ok) {
        throw new Error("Failed to get explanation");
      }

      const data = await response.json();
      setExplanation(data.explanation);
    } catch (error) {
      console.error("Error explaining niche:", error);
      toast({
        title: "Error",
        description: "Failed to get niche explanation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChooseThis = () => {
    if (selectedNiche) {
      onNicheSelect(selectedNiche);
      setIsOpen(false);
      setSelectedNiche(null);
      setExplanation(null);
      setSearchQuery("");
      setSuggestedNiches([]);
    }
  };

  const handleGenerateNiches = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Enter your interests",
        description: "Please describe what you're interested in.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setSuggestedNiches([]);
    setSelectedNiche(null);
    setExplanation(null);

    try {
      const response = await fetch("/api/generate-niche-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userInterests: searchQuery }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate niches");
      }

      const data = await response.json();
      setSuggestedNiches(data.niches || []);
      
      if (data.niches && data.niches.length > 0) {
        toast({
          title: "Niches Generated!",
          description: `Found ${data.niches.length} niches based on your interests.`,
        });
      }
    } catch (error) {
      console.error("Error generating niches:", error);
      toast({
        title: "Error",
        description: "Failed to generate niche suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectSuggestedNiche = (niche: string) => {
    setSelectedNiche(niche);
    handleNicheClick(niche);
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
        data-testid="button-open-niche-chat"
      >
        <MessageCircle className="w-4 h-4" />
        Need help choosing a niche?
      </Button>
    );
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          Niche Helper
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setIsOpen(false);
            setSelectedNiche(null);
            setExplanation(null);
            setSearchQuery("");
            setSuggestedNiches([]);
          }}
          data-testid="button-close-niche-chat"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Tell me your interests and I'll suggest perfect niches for you!
      </p>

      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="e.g., gaming, cooking, travel, tech..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerateNiches()}
            disabled={isGenerating}
            data-testid="input-niche-search"
          />
          <Button
            onClick={handleGenerateNiches}
            disabled={isGenerating || !searchQuery.trim()}
            data-testid="button-generate-niches"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {isGenerating && (
        <div className="flex flex-col items-center justify-center py-6 space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Generating personalized niches...</p>
        </div>
      )}

      {suggestedNiches.length > 0 && (
        <div className="space-y-2 pt-2 border-t">
          <p className="text-sm font-medium">Suggested Niches:</p>
          <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto">
            {suggestedNiches.map((niche) => (
              <Button
                key={niche}
                variant={selectedNiche === niche ? "default" : "outline"}
                className="justify-start h-auto py-2 px-3 text-left"
                onClick={() => handleSelectSuggestedNiche(niche)}
                data-testid={`button-suggested-niche-${niche.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <Sparkles className="w-3 h-3 mr-2 flex-shrink-0" />
                <span className="text-sm">{niche}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {selectedNiche && (
        <div className="space-y-3 pt-2 border-t">
          <div>
            <p className="text-sm font-medium">{selectedNiche}</p>
            {isLoading ? (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Getting explanation...</span>
              </div>
            ) : explanation ? (
              <p className="text-sm text-muted-foreground mt-2">{explanation}</p>
            ) : null}
          </div>

          {explanation && (
            <Button
              size="sm"
              onClick={handleChooseThis}
              className="w-full"
              data-testid="button-choose-explained-niche"
            >
              Choose This Niche
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
