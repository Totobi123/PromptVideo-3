const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;
const PIXABAY_AUDIO_API_URL = "https://pixabay.com/api/audio/";

type Mood = "happy" | "casual" | "sad" | "promotional" | "enthusiastic";

const moodToKeywordMap: Record<Mood, string> = {
  happy: "uplifting",
  casual: "relaxing",
  sad: "emotional",
  promotional: "cinematic",
  enthusiastic: "energetic",
};

interface PixabayAudioHit {
  id: number;
  name: string;
  tags: string;
  duration: number;
  audio: string;
  previewURL: string;
}

interface PixabayAudioResponse {
  total: number;
  totalHits: number;
  hits: PixabayAudioHit[];
}

export async function searchBackgroundMusic(mood: Mood): Promise<{ url: string; title: string } | null> {
  if (!PIXABAY_API_KEY) {
    console.error("PIXABAY_API_KEY is not configured");
    return null;
  }

  try {
    const keyword = moodToKeywordMap[mood];
    const url = `${PIXABAY_AUDIO_API_URL}?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(keyword)}&per_page=5`;

    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Pixabay API error: ${response.status} - ${response.statusText}`);
      return null;
    }

    const data: PixabayAudioResponse = await response.json();

    if (data.hits && data.hits.length > 0) {
      // Select a random track from the results
      const randomIndex = Math.floor(Math.random() * data.hits.length);
      const selectedTrack = data.hits[randomIndex];

      return {
        url: selectedTrack.audio,
        title: selectedTrack.name,
      };
    } else {
      console.warn("No music found for mood:", mood);
      return null;
    }
  } catch (error) {
    console.error("Error fetching background music from Pixabay:", error);
    return null;
  }
}
