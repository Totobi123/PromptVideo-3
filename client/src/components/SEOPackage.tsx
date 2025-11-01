import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface SEOPackageProps {
  seoPackage: {
    title: string;
    description: string;
    hashtags: string[];
  };
}

export function SEOPackage({ seoPackage }: SEOPackageProps) {
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({
      title: "Copied!",
      description: `${field} copied to clipboard`,
    });
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">SEO Package</h3>
        
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-muted-foreground">YouTube Title</label>
              <button
                data-testid="button-copy-title"
                onClick={() => copyToClipboard(seoPackage.title, "Title")}
                className="p-1 hover:bg-accent rounded"
              >
                {copiedField === "Title" ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
            <p data-testid="text-seo-title" className="text-sm text-foreground bg-muted p-3 rounded">
              {seoPackage.title}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <button
                data-testid="button-copy-description"
                onClick={() => copyToClipboard(seoPackage.description, "Description")}
                className="p-1 hover:bg-accent rounded"
              >
                {copiedField === "Description" ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
            <p data-testid="text-seo-description" className="text-sm text-foreground bg-muted p-3 rounded">
              {seoPackage.description}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-muted-foreground">Hashtags</label>
              <button
                data-testid="button-copy-hashtags"
                onClick={() => copyToClipboard(seoPackage.hashtags.join(" "), "Hashtags")}
                className="p-1 hover:bg-accent rounded"
              >
                {copiedField === "Hashtags" ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {seoPackage.hashtags.map((tag, index) => (
                <Badge key={index} variant="secondary" data-testid={`badge-hashtag-${index}`}>
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
