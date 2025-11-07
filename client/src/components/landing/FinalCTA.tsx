import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight" data-testid="text-cta-title">
            Ready to transform your
            <br />
            <span className="text-primary">content creation?</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-10" data-testid="text-cta-description">
            Join thousands of creators who are already using Tivideo to create
            stunning videos with AI-powered tools.
          </p>
          <Link href="/signup">
            <Button 
              size="lg" 
              className="group"
              data-testid="button-final-cta"
            >
              Start creating for free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4" data-testid="text-cta-note">
            No credit card required • Free tier available
          </p>
        </motion.div>
      </div>
    </section>
  );
}
