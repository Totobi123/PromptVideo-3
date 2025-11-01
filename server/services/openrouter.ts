import type { GenerateScriptRequest, ScriptSegment, MediaItem } from "@shared/schema";
import { aiScriptResponseSchema } from "@shared/schema";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function generateVideoScript(request: GenerateScriptRequest): Promise<{ segments: ScriptSegment[], mediaItems: MediaItem[] }> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const lengthInSeconds = request.length;
  const moodDescriptions = {
    happy: "upbeat, cheerful, and positive",
    casual: "relaxed, conversational, and friendly",
    sad: "somber, emotional, and reflective",
    promotional: "persuasive, exciting, and professional",
    enthusiastic: "energetic, passionate, and engaging",
  };

  const paceDescriptions = {
    normal: "moderate pace with clear pauses and natural rhythm",
    fast: "fast-paced with short, punchy sentences. Use energetic language and quick transitions between ideas",
    very_fast: "very fast-paced with extremely concise sentences. Use dynamic, high-energy language with rapid-fire delivery and minimal pauses",
  };

  const systemPrompt = `You are a professional YouTube video script writer. Generate a timestamped video script based on the user's requirements.

REQUIREMENTS:
- Video length: ${lengthInSeconds} seconds
- Mood: ${moodDescriptions[request.mood]}
- Pace: ${paceDescriptions[request.pace]}

OUTPUT FORMAT (return ONLY valid JSON, no markdown):
{
  "segments": [
    {
      "startTime": "00:00",
      "endTime": "00:15",
      "text": "Opening narration text..."
    }
  ],
  "mediaItems": [
    {
      "type": "image",
      "startTime": "00:00",
      "endTime": "00:05",
      "description": "Detailed description for finding stock media"
    },
    {
      "type": "video",
      "startTime": "00:05",
      "endTime": "00:10",
      "description": "Detailed description for finding stock media"
    },
    {
      "type": "image",
      "startTime": "00:10",
      "endTime": "00:15",
      "description": "Detailed description for finding stock media"
    }
  ]
}

RULES:
1. Create 3-6 segments that add up to exactly ${lengthInSeconds} seconds
2. Each segment should be 10-30 seconds long
3. Write natural, engaging narration that matches the mood and pace
4. IMPORTANT FOR PACE:
   - For "fast" pace: Use shorter sentences (5-8 words). Keep it energetic and concise.
   - For "very fast" pace: Use very short sentences (3-6 words). Make it punchy and dynamic.
5. IMPORTANT FOR VISUALS: Generate 2-3 media items per segment for dynamic visual variety
   - Each media item should display for 5-15 seconds
   - Media items within a segment should have sequential timestamps that cover the segment's duration
   - Use detailed, specific descriptions for better stock media search results
6. Alternate between "image" and "video" types for visual variety
7. Return ONLY the JSON object, no additional text or markdown`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://tivideo.replit.app",
        "X-Title": "Tivideo",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `Create a ${lengthInSeconds}-second video script about: ${request.prompt}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from OpenRouter API");
    }

    // Parse the JSON response, handling potential markdown wrapper
    let jsonContent = content.trim();
    if (jsonContent.startsWith("```json")) {
      jsonContent = jsonContent.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonContent.startsWith("```")) {
      jsonContent = jsonContent.replace(/```\n?/g, "");
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(jsonContent);
    } catch (parseError) {
      throw new Error("AI response was not valid JSON. Please try again.");
    }

    // Validate the response against the schema
    const validationResult = aiScriptResponseSchema.safeParse(parsedResult);
    if (!validationResult.success) {
      console.error("Schema validation failed:", validationResult.error);
      throw new Error("AI response did not match expected format. Please try again.");
    }

    return {
      segments: validationResult.data.segments,
      mediaItems: validationResult.data.mediaItems,
    };
  } catch (error) {
    console.error("Error generating script:", error);
    throw new Error(`Failed to generate script: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
