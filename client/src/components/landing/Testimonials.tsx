import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Quote } from "lucide-react";

export function Testimonials() {
  const testimonials = [
    {
      quote: "Incredible AI Voices + Lightning Fast",
      content: "I've been using Tivideo for the past few weeks and I'm impressed. The AI voices are remarkably natural, and the script generation is incredibly fast. This tool has streamlined our entire video production workflow.",
      author: "Sarah Mitchell",
      role: "Content Marketing Manager",
      avatar: "SM",
      bgColor: "from-primary/10 to-purple-500/10"
    },
    {
      quote: "Exactly what we needed!",
      content: "This is the video script tool I've been waiting for. The AI understands context perfectly and generates professional scripts that need minimal editing. It's saved us countless hours of work.",
      author: "Michael Chen",
      role: "Video Producer",
      avatar: "MC",
      bgColor: "from-purple-500/10 to-primary/10"
    }
  ];

  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold" data-testid="text-testimonials-title">
            Content creation has
            <br />
            never been this easy
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Card className="relative overflow-hidden border border-primary/20 bg-card hover-elevate h-full" data-testid={`card-testimonial-${index}`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${testimonial.bgColor} opacity-30`} />
                <CardContent className="relative pt-8 pb-8 px-6">
                  <Quote className="h-8 w-8 text-primary/40 mb-4" />
                  <h3 className="text-xl font-bold mb-3" data-testid={`text-testimonial-quote-${index}`}>{testimonial.quote}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed" data-testid={`text-testimonial-content-${index}`}>
                    {testimonial.content}
                  </p>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {testimonial.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold" data-testid={`text-testimonial-author-${index}`}>{testimonial.author}</div>
                      <div className="text-sm text-muted-foreground" data-testid={`text-testimonial-role-${index}`}>{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
