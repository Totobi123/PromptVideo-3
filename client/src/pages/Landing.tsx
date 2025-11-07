import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import { Hero } from "@/components/landing/Hero";
import { TrustBadges } from "@/components/landing/TrustBadges";
import { ProductPreview } from "@/components/landing/ProductPreview";
import { FeatureCards } from "@/components/landing/FeatureCards";
import { Testimonials } from "@/components/landing/Testimonials";
import { FinalCTA } from "@/components/landing/FinalCTA";

export default function Landing() {
  return (
    <div className="min-h-screen w-full bg-background">
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" data-testid="link-home-logo">
            <div className="flex items-center gap-2 cursor-pointer hover-elevate rounded-lg px-2 py-1 -ml-2">
              <Video className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Tivideo</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/signin">
              <Button variant="ghost" data-testid="button-signin">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button data-testid="button-signup">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <Hero />
        <TrustBadges />
        <ProductPreview />
        <FeatureCards />
        <Testimonials />
        <FinalCTA />
      </main>

      <footer className="border-t border-border/50 py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2" data-testid="text-footer-logo">
              <Video className="h-5 w-5 text-primary" />
              <span className="font-bold">Tivideo</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors" data-testid="link-privacy">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors" data-testid="link-terms">
                Terms of Service
              </Link>
              <a href="#" className="hover:text-foreground transition-colors" data-testid="link-contact">
                Contact
              </a>
            </div>
            <div className="text-sm text-muted-foreground" data-testid="text-copyright">
              &copy; 2025 Tivideo. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
