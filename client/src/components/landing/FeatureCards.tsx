import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Zap, Globe } from "lucide-react";

export function FeatureCards() {
  const features = [
    {
      icon: Sparkles,
      title: "Simple editor",
      description: "Create professional video scripts as easily as writing an email with our intuitive interface.",
      color: "from-pink-500/20 to-primary/20"
    },
    {
      icon: Zap,
      title: "Fast creation",
      description: "Generate complete video scripts with AI-powered voiceovers and media suggestions in minutes.",
      color: "from-purple-500/20 to-primary/20"
    },
    {
      icon: Globe,
      title: "Multi-language support",
      description: "Create high-quality video content in multiple languages with natural-sounding AI voices.",
      color: "from-primary/20 to-orange-500/20"
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-features-title">
            Tivideo is built for <span className="text-primary">content creators</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 bg-card hover-elevate h-full" data-testid={`card-feature-${index}`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-50`} />
                <CardContent className="relative pt-8 pb-8 px-6">
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-3" data-testid={`text-feature-title-${index}`}>{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed" data-testid={`text-feature-description-${index}`}>
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
