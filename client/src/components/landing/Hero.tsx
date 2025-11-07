import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles, Play } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10 py-20">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="flex items-center justify-center gap-6 mb-8 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="flex items-center gap-2" data-testid="stat-rating-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">4.8/5</span>
            </div>
            <div className="flex items-center gap-2" data-testid="stat-users">
              <Play className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">137K</span>
            </div>
            <div className="flex items-center gap-2" data-testid="stat-rating-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">4.6/5</span>
            </div>
          </motion.div>

          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            data-testid="text-hero-title"
          >
            Transform <span className="text-primary">text</span> into
            <br />
            videos with AI voices
          </motion.h1>

          <motion.p 
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            data-testid="text-hero-description"
          >
            Effortlessly create professional videos with AI-powered voiceovers. Transform your ideas
            into engaging content featuring realistic voices, dynamic media recommendations,
            and a complete suite of video production tools.
          </motion.p>

          <motion.div 
            className="flex flex-wrap items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Link href="/signup">
              <Button 
                size="lg" 
                data-testid="button-hero-signup"
              >
                Create your first video today
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              data-testid="button-watch-demo"
            >
              No credit card required
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
