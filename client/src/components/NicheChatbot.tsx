import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NicheChatbotProps {
  onNicheSelect: (niche: string) => void;
}

export function NicheChatbot({ onNicheSelect }: NicheChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
    }
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
          }}
          data-testid="button-close-niche-chat"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Click on any niche above to learn more about it!
      </p>

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
