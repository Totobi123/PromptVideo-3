import type { GenerateScriptRequest, ScriptSegment, MediaItem } from "@shared/schema";
import { aiScriptResponseSchema } from "@shared/schema";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function generateVideoScript(request: GenerateScriptRequest): Promise<{ 
  segments: ScriptSegment[], 
  mediaItems: MediaItem[],
  seoPackage?: any,
  chapters?: any[],
  ctaPlacements?: any[],
  musicMixing?: any
}> {
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

  const audienceDescriptions = {
    kids: "simple language, fun examples, educational tone",
    teens: "relatable content, trending topics, casual but engaging",
    adults: "mature content, balanced tone, informative",
    professionals: "technical accuracy, formal tone, industry-specific",
    general: "accessible to everyone, clear explanations, broad appeal",
  };

  const categoryDescriptions = {
    tech: "technology reviews, tutorials, or news",
    cooking: "recipes, cooking techniques, or food content",
    travel: "destination guides, travel tips, or vlogs",
    education: "learning content, explanations, or tutorials",
    gaming: "gameplay, reviews, or gaming culture",
    fitness: "workouts, health tips, or wellness content",
    vlog: "personal stories, daily life, or experiences",
    review: "product or service evaluations",
    tutorial: "step-by-step guides or how-to content",
    entertainment: "fun, engaging, or comedic content",
  };

  let targetSegments = Math.max(3, Math.min(6, Math.round(lengthInSeconds / 25)));
  let avgSegmentDuration = Math.round(lengthInSeconds / targetSegments);
  
  if (avgSegmentDuration > 40) {
    targetSegments = Math.ceil(lengthInSeconds / 40);
    avgSegmentDuration = Math.round(lengthInSeconds / targetSegments);
  }

  const wordsPerSecond = {
    normal: 2.5,
    fast: 3.0,
    very_fast: 3.5,
  };

  const paceWordsPerSecond = wordsPerSecond[request.pace];
  const wordsPerSegment = Math.ceil(avgSegmentDuration * paceWordsPerSecond);
  const totalWords = Math.ceil(lengthInSeconds * paceWordsPerSecond);

  const systemPrompt = `You are a professional YouTube video script writer and SEO expert. Generate a complete video production package.

REQUIREMENTS:
- Video length: EXACTLY ${lengthInSeconds} seconds (must be precise)
- Target: ${targetSegments} segments of approximately ${avgSegmentDuration} seconds each
- WORD COUNT: Each segment needs at least ${wordsPerSegment} words (total script: minimum ${totalWords} words)
- Speaking pace: ${paceWordsPerSecond} words per second
- Mood: ${moodDescriptions[request.mood]}
- Pace: ${paceDescriptions[request.pace]}
- Target Audience: ${audienceDescriptions[request.audience]}
- Category: ${categoryDescriptions[request.category]}

OUTPUT FORMAT (return ONLY valid JSON, no markdown):
{
  "segments": [
    {
      "startTime": "00:00",
      "endTime": "00:15",
      "text": "Opening narration...",
      "emotionMarkers": [
        {"word": "amazing", "emotion": "emphasize"},
        {"word": "pause here", "emotion": "pause"}
      ]
    }
  ],
  "mediaItems": [
    {
      "type": "video",
      "startTime": "00:00",
      "endTime": "00:05",
      "description": "Specific, detailed description for stock search",
      "isThumbnailCandidate": true,
      "transition": "fade"
    },
    {
      "type": "image",
      "startTime": "00:05",
      "endTime": "00:10",
      "description": "Another detailed description",
      "isThumbnailCandidate": false,
      "transition": "cut"
    }
  ],
  "seoPackage": {
    "title": "Compelling 60-char YouTube title",
    "description": "SEO-optimized description with keywords",
    "hashtags": ["#relevant", "#hashtags", "#5-8total"]
  },
  "chapters": [
    {"timestamp": "00:00", "title": "Introduction"},
    {"timestamp": "00:15", "title": "Main Content"}
  ],
  "ctaPlacements": [
    {"timestamp": "00:10", "type": "subscribe", "message": "If you're enjoying this, subscribe!"},
    {"timestamp": "00:50", "type": "like", "message": "Hit that like button!"}
  ],
  "musicMixing": {
    "backgroundMusicVolume": 20,
    "voiceoverVolume": 100,
    "fadeInDuration": 2,
    "fadeOutDuration": 3
  }
}

CRITICAL TIMING RULES:
1. SCRIPT SEGMENTS: Create approximately ${targetSegments} segments totaling EXACTLY ${lengthInSeconds} seconds
   - Target ${avgSegmentDuration} seconds per segment (can vary ±5 seconds for narrative flow)
   - Calculate times precisely so all segments sum to exactly ${lengthInSeconds} seconds
   - Adjust individual segment lengths as needed, but total must equal ${lengthInSeconds}s

2. TEXT LENGTH - CRITICAL: Each segment's text MUST be long enough to fill its time duration when spoken aloud
   - At ${paceWordsPerSecond} words/second, each ${avgSegmentDuration}s segment needs AT LEAST ${wordsPerSegment} words (minimum)
   - Total script must contain AT LEAST ${totalWords} words to fill ${lengthInSeconds} seconds
   - Write complete, detailed, engaging narration - NOT just brief summaries or bullet points
   - The voiceover duration MUST match the segment timestamps
   - Example: A 30-second segment at normal pace needs MINIMUM 75 words, NOT 15-20 words
   - If a segment is 00:00-00:30 (30s), the text must take 30 seconds to speak when read aloud
   
3. AUDIENCE: Tailor language and examples for ${request.audience}

4. CATEGORY: Include ${request.category}-specific terminology and references

5. PACE:
   - fast: Short sentences (5-8 words), energetic language
   - very_fast: Very short sentences (3-6 words), punchy, dynamic
   
6. EMOTION MARKERS: Add 2-4 per segment marking key words to emphasize/pause

7. VISUALS - CRITICAL: Generate media items to completely cover each segment
   - MUST use a MIX of videos and images across all segments
   - Overall: 60-70% should be type "video", 30-40% should be type "image"
   - Per ${avgSegmentDuration}s segment: generate 3-5 media items
   - Each media item: 3-10 seconds duration (flexible to fit segment perfectly)
   - Media items MUST cover entire segment duration with NO gaps
   - Sequential timestamps covering full segment (e.g., 0:00-0:05, 0:05-0:12, 0:12-0:20)
   - Highly detailed, specific descriptions for better stock media search results
   - Mark 1-2 visually striking items per segment as thumbnail candidates
   - Transitions: "cut" for energy, "fade" for smooth, "zoom" for impact
   
8. SEO PACKAGE:
   - Title: 60 chars, keyword-rich, click-worthy
   - Description: 150-200 chars, includes main keywords
   - Hashtags: 5-8 relevant, trending-aware
   
9. CHAPTERS: Create 3-5 YouTube chapters with timestamps

10. CTA PLACEMENTS: Add 2-4 calls-to-action at strategic moments
    - Types: subscribe, like, comment, link, product
    - Natural timing (not in first 5 seconds)
   
11. MUSIC MIXING:
    - backgroundMusicVolume: 15-30 (percentage)
    - voiceoverVolume: 100
    - fadeInDuration: 2-4 seconds
    - fadeOutDuration: 2-5 seconds
    
12. Return ONLY the JSON object, no markdown

FINAL VERIFICATION CHECKLIST:
- Total of all segment durations = ${lengthInSeconds} seconds (exact)
- Created approximately ${targetSegments} segments averaging ${avgSegmentDuration}s each
- Each segment contains AT LEAST ${wordsPerSegment} words (total script: minimum ${totalWords} words)
- Voiceover text is long enough to fill segment time when spoken at ${paceWordsPerSecond} words/second
- Every segment has 3-5 media items with no time gaps
- Overall media mix is 60-70% videos, 30-40% images`;

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
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `Create a ${lengthInSeconds}-second ${request.category} video for ${request.audience} about: ${request.prompt}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: "json_object" },
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
    console.log("Raw AI response:", content.substring(0, 500));
    
    if (jsonContent.startsWith("```json")) {
      jsonContent = jsonContent.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonContent.startsWith("```")) {
      jsonContent = jsonContent.replace(/```\n?/g, "");
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("Failed to parse JSON:", jsonContent.substring(0, 500));
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
      seoPackage: validationResult.data.seoPackage,
      chapters: validationResult.data.chapters,
      ctaPlacements: validationResult.data.ctaPlacements,
      musicMixing: validationResult.data.musicMixing,
    };
  } catch (error) {
    console.error("Error generating script:", error);
    throw new Error(`Failed to generate script: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
