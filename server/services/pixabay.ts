type Mood = "happy" | "casual" | "sad" | "promotional" | "enthusiastic";

// Curated royalty-free music from Kevin MacLeod (incompetech.com)
// All tracks are CC BY 4.0 licensed and free to use
const moodToMusicLibrary: Record<Mood, Array<{ url: string; title: string; artist: string }>> = {
  happy: [
    {
      url: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Wallpaper.mp3",
      title: "Wallpaper",
      artist: "Kevin MacLeod (incompetech.com)",
    },
    {
      url: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Carefree.mp3",
      title: "Carefree",
      artist: "Kevin MacLeod (incompetech.com)",
    },
  ],
  casual: [
    {
      url: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Straight.mp3",
      title: "Straight",
      artist: "Kevin MacLeod (incompetech.com)",
    },
    {
      url: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Comfortable%20Mystery%201%20-%20Film%20Noire.mp3",
      title: "Comfortable Mystery",
      artist: "Kevin MacLeod (incompetech.com)",
    },
  ],
  sad: [
    {
      url: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Invariance.mp3",
      title: "Invariance",
      artist: "Kevin MacLeod (incompetech.com)",
    },
    {
      url: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Meditation%20Impromptu%2001.mp3",
      title: "Meditation Impromptu",
      artist: "Kevin MacLeod (incompetech.com)",
    },
  ],
  promotional: [
    {
      url: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Rising.mp3",
      title: "Rising",
      artist: "Kevin MacLeod (incompetech.com)",
    },
    {
      url: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Deliberate%20Thought.mp3",
      title: "Deliberate Thought",
      artist: "Kevin MacLeod (incompetech.com)",
    },
  ],
  enthusiastic: [
    {
      url: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Pumped.mp3",
      title: "Pumped",
      artist: "Kevin MacLeod (incompetech.com)",
    },
    {
      url: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Gotta%20Get%20Up.mp3",
      title: "Gotta Get Up",
      artist: "Kevin MacLeod (incompetech.com)",
    },
  ],
};

export async function searchBackgroundMusic(mood: Mood): Promise<{ url: string; title: string } | null> {
  try {
    const musicOptions = moodToMusicLibrary[mood];
    
    if (!musicOptions || musicOptions.length === 0) {
      console.warn("No music tracks available for mood:", mood);
      return null;
    }

    // Select a random track from the mood's music options
    const selectedTrack = musicOptions[Math.floor(Math.random() * musicOptions.length)];

    return {
      url: selectedTrack.url,
      title: `${selectedTrack.title} - ${selectedTrack.artist}`,
    };
  } catch (error) {
    console.error("Error fetching background music:", error);
    return null;
  }
}
