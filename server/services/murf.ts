const MURF_API_KEY = process.env.MURF_API_KEY;
const MURF_API_URL = "https://api.murf.ai/v1/speech/generate";

export async function generateVoiceover(text: string, voiceId: string = "en-US-terrell"): Promise<string> {
  if (!MURF_API_KEY) {
    throw new Error("MURF_API_KEY is not configured");
  }

  try {
    const response = await fetch(MURF_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "api-key": MURF_API_KEY,
      },
      body: JSON.stringify({
        text,
        voiceId,
      }),
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
