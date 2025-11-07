import { motion } from "framer-motion";
import { Building2, Zap, Globe, Video, Sparkles, Users } from "lucide-react";

export function TrustBadges() {
  const badges = [
    { name: "CreativeHub", icon: Sparkles },
    { name: "MediaPro", icon: Video },
    { name: "ContentFlow", icon: Zap },
    { name: "GlobalCreate", icon: Globe },
    { name: "TeamWork", icon: Users },
    { name: "StudioMax", icon: Building2 },
  ];

  return (
    <section className="py-12 border-y border-border/50">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm text-muted-foreground uppercase tracking-wider" data-testid="text-trusted-by">
            TRUSTED BY TEAMS WORLDWIDE
          </p>
        </motion.div>
        
        <motion.div 
          className="flex flex-wrap items-center justify-center gap-8 md:gap-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {badges.map((badge, index) => (
            <div 
              key={index} 
              className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
              data-testid={`badge-company-${index}`}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20">
                <badge.icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-base font-semibold text-foreground/80">
                {badge.name}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
