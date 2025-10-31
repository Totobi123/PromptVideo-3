import { Button } from "@/components/ui/button";
import { Download, FileText, Music, Images } from "lucide-react";

interface ExportButtonsProps {
  onExportScript: () => void;
  onExportAudio: () => void;
  onExportMedia: () => void;
}

export function ExportButtons({ onExportScript, onExportAudio, onExportMedia }: ExportButtonsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        data-testid="button-export-script"
        onClick={onExportScript}
        variant="default"
        className="gap-2"
      >
        <FileText className="w-4 h-4" />
        Export Script
      </Button>
      <Button
        data-testid="button-export-audio"
        onClick={onExportAudio}
        variant="default"
        className="gap-2"
      >
        <Music className="w-4 h-4" />
        Export Audio
      </Button>
      <Button
        data-testid="button-export-media"
        onClick={onExportMedia}
        variant="default"
        className="gap-2"
      >
        <Images className="w-4 h-4" />
        Export Media List
      </Button>
      <Button
        data-testid="button-download-all"
        onClick={() => {
          onExportScript();
          onExportAudio();
          onExportMedia();
        }}
        variant="outline"
        className="gap-2"
      >
        <Download className="w-4 h-4" />
        Download All
      </Button>
    </div>
  );
}
