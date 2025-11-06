const MURF_API_KEY = process.env.MURF_API_KEY;
const MURF_API_URL = "https://api.murf.ai/v1/speech/generate";

type Mood = "happy" | "casual" | "sad" | "promotional" | "enthusiastic";

export const voiceMoodMapping: Record<Mood, Array<{ voiceId: string; voiceName: string; style: string }>> = {
  happy: [
    { voiceId: "en-US-jayden", voiceName: "Jayden (Happy)", style: "Conversational" },
    { voiceId: "en-US-evander", voiceName: "Evander (Happy)", style: "Conversational" },
    { voiceId: "en-US-iris", voiceName: "Iris (Happy)", style: "Conversational" },
  ],
  casual: [
    { voiceId: "en-UK-ruby", voiceName: "Ruby (Casual)", style: "Conversational" },
    { voiceId: "it-IT-greta", voiceName: "Greta (Casual)", style: "Conversational" },
    { voiceId: "en-UK-harrison", voiceName: "Harrison (Casual)", style: "Conversational" },
  ],
  sad: [
    { voiceId: "en-US-samantha", voiceName: "Samantha (Sad)", style: "Sad" },
    { voiceId: "en-US-daisy", voiceName: "Daisy (Sad)", style: "Sad" },
    { voiceId: "en-US-ryan", voiceName: "Ryan (Sad)", style: "Sad" },
  ],
  promotional: [
    { voiceId: "en-US-june", voiceName: "June (Promotional)", style: "Promo" },
    { voiceId: "en-US-lucas", voiceName: "Lucas (Promotional)", style: "Promo" },
    { voiceId: "en-US-denzel", voiceName: "Denzel (Promotional)", style: "Promo" },
  ],
  enthusiastic: [
    { voiceId: "en-US-charles", voiceName: "Charles (Enthusiastic)", style: "Inspirational" },
    { voiceId: "en-US-miles", voiceName: "Miles (Enthusiastic)", style: "Inspirational" },
    { voiceId: "en-US-julia", voiceName: "Julia (Enthusiastic)", style: "Inspirational" },
  ],
};

export function getVoiceForMood(mood: Mood): { voiceId: string; voiceName: string; style: string } {
  const voices = voiceMoodMapping[mood];
  const randomIndex = Math.floor(Math.random() * voices.length);
  return voices[randomIndex];
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
