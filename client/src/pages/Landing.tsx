import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Video, Sparkles, Zap, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen w-full bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Tivideo</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/signin">
              <Button variant="ghost" data-testid="button-signin">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button data-testid="button-signup">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Create Professional Video Scripts with AI
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Generate YouTube-style video scripts complete with voiceover recommendations, 
                stock media suggestions, and royalty-free background music—all powered by AI.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/signup">
                  <Button size="lg" className="text-lg px-8" data-testid="button-hero-signup">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Start Creating Free
                  </Button>
                </Link>
                <Link href="/signin">
                  <Button size="lg" variant="outline" className="text-lg px-8" data-testid="button-hero-signin">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Choose Tivideo?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to create engaging video content in minutes
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <Sparkles className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">AI-Powered Scripts</h3>
                  <p className="text-muted-foreground">
                    Generate professional video scripts tailored to your topic, mood, and audience with advanced AI.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <Zap className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Complete Production</h3>
                  <p className="text-muted-foreground">
                    Get voiceover recommendations, stock media suggestions, and background music all in one place.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <Users className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Easy to Use</h3>
                  <p className="text-muted-foreground">
                    Simple, streamlined workflow that takes you from idea to ready-to-produce video script.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join creators who are already using Tivideo to streamline their video production workflow.
              </p>
              <Link href="/signup">
                <Button size="lg" className="text-lg px-8" data-testid="button-cta-signup">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Create Your First Script
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Tivideo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
