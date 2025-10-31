const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;
const PIXABAY_MUSIC_API_URL = "https://pixabay.com/api/music/";

type Mood = "happy" | "casual" | "sad" | "promotional" | "enthusiastic";

const moodToMusicKeywords: Record<Mood, string> = {
  happy: "upbeat happy cheerful",
  casual: "relaxed chill ambient",
  sad: "emotional melancholic piano",
  promotional: "corporate motivational inspiring",
  enthusiastic: "energetic uplifting dynamic",
};

export async function searchBackgroundMusic(mood: Mood): Promise<{ url: string; title: string } | null> {
  if (!PIXABAY_API_KEY) {
    console.warn("PIXABAY_API_KEY is not configured, skipping music generation");
    return null;
  }

  try {
    const keywords = moodToMusicKeywords[mood];
    const response = await fetch(
      `${PIXABAY_MUSIC_API_URL}?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(keywords)}&per_page=3`
    );

    if (!response.ok) {
      console.error(`Pixabay Music API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const track = data.hits?.[0];

    if (!track) {
      console.warn("No music tracks found for mood:", mood);
      return null;
    }

    return {
      url: track.audio,
      title: track.name || "Background Music",
    };
  } catch (error) {
    console.error("Error fetching background music:", error);
    return null;
  }
}
