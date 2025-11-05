import { Card } from "@/components/ui/card";
import { Mic, Music } from "lucide-react";
import { AudioPlayer } from "./AudioPlayer";
import { motion } from "framer-motion";

interface VoiceAndMusicInfoProps {
  voiceName: string;
  audioUrl?: string;
  musicTitle?: string;
  musicUrl?: string;
  musicCreator?: string;
  musicLicense?: string;
  onDownloadVoiceover?: () => void;
  onDownloadMusic?: () => void;
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: "easeOut",
    },
  }),
};

export function VoiceAndMusicInfo({
  voiceName,
  audioUrl,
  musicTitle,
  musicUrl,
  musicCreator,
  musicLicense,
  onDownloadVoiceover,
  onDownloadMusic,
}: VoiceAndMusicInfoProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Voice & Music Settings
          </h3>
        </motion.div>

        <div className="space-y-4">
          <motion.div
            custom={0}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="flex items-start gap-3"
          >
            <div className="rounded-full bg-primary/10 p-2">
              <Mic className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Voiceover</p>
              <p className="text-sm text-muted-foreground mb-3">{voiceName}</p>
              {audioUrl && (
                <AudioPlayer
                  url={audioUrl}
                  title={voiceName}
                  onDownload={onDownloadVoiceover}
                />
              )}
            </div>
          </motion.div>

          {musicTitle && musicUrl && (
            <motion.div
              custom={1}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="flex items-start gap-3"
            >
              <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
                <Music className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Background Music</p>
                <p className="text-sm text-muted-foreground">{musicTitle}</p>
                {musicCreator && (
                  <p className="text-xs text-muted-foreground" data-testid="text-music-creator">
                    By {musicCreator}
                  </p>
                )}
                {musicLicense && (
                  <p className="text-xs text-muted-foreground mb-3" data-testid="text-music-license">
                    License: {musicLicense}
                  </p>
                )}
                {!musicCreator && !musicLicense && <div className="mb-3" />}
                <AudioPlayer
                  url={musicUrl}
                  title={musicTitle}
                  onDownload={onDownloadMusic}
                />
              </div>
            </motion.div>
          )}

          {!musicTitle && (
            <motion.div
              custom={1}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="flex items-start gap-3"
            >
              <div className="rounded-full bg-muted p-2">
                <Music className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Background Music</p>
                <p className="text-sm text-muted-foreground">No music available</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Card>
  );
}
