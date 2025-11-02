const MURF_API_KEY = process.env.MURF_API_KEY;
const MURF_API_URL = "https://api.murf.ai/v1/speech/generate";

type Mood = "happy" | "casual" | "sad" | "promotional" | "enthusiastic";

export const voiceMoodMapping: Record<Mood, { voiceId: string; voiceName: string; style: string }> = {
  happy: { voiceId: "en-US-natalie", voiceName: "Natalie (Conversational)", style: "Conversational" },
  casual: { voiceId: "en-US-amara", voiceName: "Amara (Conversational)", style: "Conversational" },
  sad: { voiceId: "en-US-ken", voiceName: "Ken (Sad)", style: "Sad" },
  promotional: { voiceId: "en-US-miles", voiceName: "Miles (Promo)", style: "Promo" },
  enthusiastic: { voiceId: "en-US-natalie", voiceName: "Natalie (Inspirational)", style: "Inspirational" },
};

export function getVoiceForMood(mood: Mood): { voiceId: string; voiceName: string; style: string } {
  return voiceMoodMapping[mood];
}

type Pace = "normal" | "fast" | "very_fast";

function getSpeedForPace(pace: Pace): number {
  const speedMap: Record<Pace, number> = {
    normal: 1.0,
    fast: 1.2,
    very_fast: 1.5,
  };
  return speedMap[pace];
}

export async function generateVoiceover(
  text: string, 
  voiceId: string = "en-US-natalie",
  pace: Pace = "normal",
  style?: string
): Promise<string> {
  if (!MURF_API_KEY) {
    throw new Error("MURF_API_KEY is not configured");
  }

  const speed = getSpeedForPace(pace);

  const requestBody: Record<string, any> = {
    text,
    voiceId,
    speed,
  };

  if (style) {
    requestBody.style = style;
  }

  try {
    const response = await fetch(MURF_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "api-key": MURF_API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Murf API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.audioFile) {
      throw new Error("No audio file received from Murf API");
    }

    return data.audioFile;
  } catch (error) {
    console.error("Error generating voiceover:", error);
    throw new Error(`Failed to generate voiceover: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
