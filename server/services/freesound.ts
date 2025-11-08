import { getUserApiKey } from "../lib/userApiKeys";

const FREESOUND_API_URL = "https://freesound.org/apiv2/search/text/";

type Mood = "happy" | "casual" | "sad" | "promotional" | "enthusiastic";

const moodToKeywordMap: Record<Mood, string> = {
  happy: "uplifting cheerful positive",
  casual: "relaxing ambient chill",
  sad: "emotional melancholic piano",
  promotional: "cinematic corporate motivational",
  enthusiastic: "energetic upbeat exciting",
};

interface FreesoundSearchResult {
  id: number;
  name: string;
  tags: string[];
  license: string;
  username: string;
  duration: number;
  previews: {
    "preview-hq-mp3": string;
    "preview-lq-mp3": string;
  };
}

interface FreesoundSearchResponse {
  count: number;
  results: FreesoundSearchResult[];
}

export async function searchBackgroundMusic(
  mood: Mood,
  userId?: string
): Promise<{ url: string; title: string; creator: string; license: string } | null> {
  const userApiKey = await getUserApiKey(userId, 'freesound');
  const FREESOUND_API_KEY = userApiKey || process.env.FREESOUND_API_KEY;
  if (!FREESOUND_API_KEY) {
    console.error("FREESOUND_API_KEY is not configured");
    return null;
  }

  try {
    const keyword = moodToKeywordMap[mood];
    
    // Build search URL with filters for music and reasonable duration
    const params = new URLSearchParams({
      query: keyword,
      token: FREESOUND_API_KEY,
      filter: "duration:[30 TO 300] tag:music",
      fields: "id,name,tags,license,username,duration,previews",
      page_size: "15",
    });

    const url = `${FREESOUND_API_URL}?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`FreeSound API error: ${response.status} - ${response.statusText}`);
      return null;
    }

    const data: FreesoundSearchResponse = await response.json();

    if (data.results && data.results.length > 0) {
      // Select a random track from the results
      const randomIndex = Math.floor(Math.random() * data.results.length);
      const selectedTrack = data.results[randomIndex];

      return {
        url: selectedTrack.previews["preview-hq-mp3"],
        title: selectedTrack.name,
        creator: selectedTrack.username,
        license: selectedTrack.license,
      };
    } else {
      console.warn("No music found for mood:", mood);
      return null;
    }
  } catch (error) {
    console.error("Error fetching background music from FreeSound:", error);
    return null;
  }
}
