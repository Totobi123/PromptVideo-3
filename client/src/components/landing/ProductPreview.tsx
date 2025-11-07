import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export function ProductPreview() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Card className="relative overflow-hidden bg-card border-2 border-primary/20 rounded-2xl p-1">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <div className="relative bg-card/50 backdrop-blur rounded-xl p-8 md:p-12">
              <div className="aspect-video bg-gradient-to-br from-muted/30 to-background border border-border rounded-lg flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
                
                <div className="relative z-10 text-center">
                  <Button 
                    size="icon" 
                    variant="outline"
                    className="bg-primary/20 backdrop-blur-sm border-primary/30"
                    data-testid="button-video-preview"
                  >
                    <Play className="h-5 w-5 text-primary" fill="currentColor" />
                  </Button>
                  <p className="text-muted-foreground mt-4" data-testid="text-video-preview-label">Watch Video Preview</p>
                </div>

                <div className="absolute bottom-6 left-6 right-6 bg-card/80 backdrop-blur-md border border-border rounded-lg p-4 hidden md:block">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-1 bg-primary rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-2 bg-primary/30 rounded-full w-3/4" />
                      <div className="h-2 bg-muted rounded-full w-1/2" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
