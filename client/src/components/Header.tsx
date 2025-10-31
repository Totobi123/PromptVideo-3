import { Video } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-md">
            <Video className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-serif font-bold text-foreground">
            Tivideo
          </h1>
        </div>
        <p className="text-sm text-muted-foreground hidden sm:block">
          AI-Powered Video Script Generator
        </p>
      </div>
    </header>
  );
}
