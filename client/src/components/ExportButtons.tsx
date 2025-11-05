import { Button } from "@/components/ui/button";
import { Download, FileText, Music, Images } from "lucide-react";
import { motion } from "framer-motion";

interface ExportButtonsProps {
  onExportScript: () => void;
  onExportAudio: () => void;
  onExportMedia: () => void;
}

const buttonVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: "easeOut",
    },
  }),
};

export function ExportButtons({ onExportScript, onExportAudio, onExportMedia }: ExportButtonsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <motion.div
        custom={0}
        variants={buttonVariants}
        initial="hidden"
        animate="visible"
      >
        <Button
          data-testid="button-export-script"
          onClick={onExportScript}
          variant="default"
          className="gap-2"
        >
          <FileText className="w-4 h-4" />
          Export Script
        </Button>
      </motion.div>
      <motion.div
        custom={1}
        variants={buttonVariants}
        initial="hidden"
        animate="visible"
      >
        <Button
          data-testid="button-export-audio"
          onClick={onExportAudio}
          variant="default"
          className="gap-2"
        >
          <Music className="w-4 h-4" />
          Export Audio
        </Button>
      </motion.div>
      <motion.div
        custom={2}
        variants={buttonVariants}
        initial="hidden"
        animate="visible"
      >
        <Button
          data-testid="button-export-media"
          onClick={onExportMedia}
          variant="default"
          className="gap-2"
        >
          <Images className="w-4 h-4" />
          Export Media List
        </Button>
      </motion.div>
      <motion.div
        custom={3}
        variants={buttonVariants}
        initial="hidden"
        animate="visible"
      >
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
      </motion.div>
    </div>
  );
}
