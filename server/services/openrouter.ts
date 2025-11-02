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
    fast: "fast-paced with short, punchy sentences",
    very_fast: "very fast-paced with extremely concise sentences",
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
    gospel: "faith-based content, spiritual messages, or religious teachings",
  };

  const categoryGuidelines = {
    tech: {
      structure: "Hook with problem/innovation → Explanation → Features/Benefits → Conclusion",
      tone: "Professional, informative, clear technical explanations",
      mediaPreference: "Product shots, screen recordings, tech demos, close-ups of devices",
      ctaFocus: "Subscribe for tech updates, like if helpful, comment questions",
      keywords: "specs, features, performance, innovation, technology",
    },
    cooking: {
      structure: "Dish introduction → Ingredients overview → Step-by-step process → Final presentation",
      tone: "Warm, inviting, encouraging, appetizing descriptions",
      mediaPreference: "Food close-ups, cooking process shots, ingredient displays, finished dish beauty shots",
      ctaFocus: "Subscribe for recipes, like if you'll try it, comment your variations",
      keywords: "recipe, ingredients, delicious, easy, homemade, cooking",
    },
    travel: {
      structure: "Destination introduction → Key attractions → Local culture/tips → Call to adventure",
      tone: "Adventurous, inspiring, descriptive, wanderlust-inducing",
      mediaPreference: "Scenic landscapes, local culture, landmarks, street scenes, aerial views",
      ctaFocus: "Subscribe for travel guides, like if you want to visit, comment your experiences",
      keywords: "destination, explore, adventure, culture, travel tips, journey",
    },
    education: {
      structure: "Question/Topic → Core concept explanation → Examples → Key takeaways",
      tone: "Clear, patient, structured, encouraging learning",
      mediaPreference: "Diagrams, educational graphics, real-world examples, demonstration visuals",
      ctaFocus: "Subscribe to learn more, like if this helped, comment questions",
      keywords: "learn, understand, concept, explained, educational, knowledge",
    },
    gaming: {
      structure: "Game intro → Gameplay highlights → Tips/strategies → Verdict/recommendation",
      tone: "Energetic, excited, relatable to gamers, insider language",
      mediaPreference: "Gameplay footage, character shots, action sequences, gaming setups",
      ctaFocus: "Subscribe for gaming content, like for more, comment your gameplay",
      keywords: "gaming, gameplay, epic, strategy, level, multiplayer",
    },
    fitness: {
      structure: "Fitness goal → Exercise demonstration → Form tips → Motivation/results",
      tone: "Motivational, supportive, health-focused, empowering",
      mediaPreference: "Exercise demonstrations, fitness activities, healthy lifestyle, gym/outdoor workouts",
      ctaFocus: "Subscribe for workouts, like if you're motivated, comment your progress",
      keywords: "fitness, workout, health, exercise, strength, wellness",
    },
    vlog: {
      structure: "Personal intro → Daily activities/story → Reflections → Personal sign-off",
      tone: "Authentic, personal, conversational, relatable",
      mediaPreference: "Lifestyle shots, personal moments, daily activities, behind-the-scenes",
      ctaFocus: "Subscribe to follow journey, like if you relate, comment your thoughts",
      keywords: "life, daily, personal, story, experience, sharing",
    },
    review: {
      structure: "Product intro → Features analysis → Pros & Cons → Final recommendation",
      tone: "Honest, balanced, detailed, consumer-focused",
      mediaPreference: "Product shots, comparison visuals, feature demonstrations, usage scenarios",
      ctaFocus: "Subscribe for reviews, like if helpful, comment your experience",
      keywords: "review, pros, cons, worth it, honest, recommendation",
    },
    tutorial: {
      structure: "What you'll learn → Step 1 → Step 2 → Step 3 → Results/Summary",
      tone: "Instructional, clear, step-by-step, encouraging",
      mediaPreference: "Step-by-step visuals, process shots, before/after, how-to demonstrations",
      ctaFocus: "Subscribe for tutorials, like if this helped, comment your results",
      keywords: "how to, tutorial, step-by-step, guide, learn, easy",
    },
    entertainment: {
      structure: "Attention-grabbing hook → Entertaining content → Callbacks/punchlines → Strong outro",
      tone: "Fun, engaging, humorous, entertaining",
      mediaPreference: "Dynamic shots, expressive visuals, entertaining scenes, varied content",
      ctaFocus: "Subscribe for entertainment, smash like, comment your favorite part",
      keywords: "fun, amazing, hilarious, entertaining, awesome, incredible",
    },
    gospel: {
      structure: "Scripture/Message intro → Spiritual teaching → Application to life → Inspirational close",
      tone: "Inspirational, reverent, hopeful, compassionate",
      mediaPreference: "Peaceful nature scenes, worship settings, contemplative visuals, uplifting imagery",
      ctaFocus: "Subscribe for faith content, like to share hope, comment your testimony",
      keywords: "faith, hope, blessed, spiritual, grace, testimony",
    },
  };

  const targetSegments = Math.max(3, Math.min(8, Math.round(lengthInSeconds / 20)));
  const avgSegmentDuration = Math.round(lengthInSeconds / targetSegments);

  // Calculate word counts based on realistic speech timing
  // 1-minute speech = 100-150 words (conversational average: 125-150)
  // Slower pace: ~110 words/minute, Fast pace: ~170 words/minute
  const wordsPerMinute = {
    normal: 130,      // conversational pace
    fast: 170,        // fast pace
    very_fast: 200,   // very fast pace
  };

  const paceWPM = wordsPerMinute[request.pace];
  const totalMinutes = lengthInSeconds / 60;
  const estimatedTotalWords = Math.round(totalMinutes * paceWPM);
  const wordsPerSegment = Math.round(estimatedTotalWords / targetSegments);

  const categoryGuide = categoryGuidelines[request.category as keyof typeof categoryGuidelines];
  if (!categoryGuide) {
    throw new Error(`Invalid category: ${request.category}`);
  }

  const systemPrompt = `You are a professional YouTube video script writer and SEO expert. Generate a complete video production package.

IMPORTANT SPEECH TIMING GUIDELINES:
- A 1-minute speech typically contains 100 to 150 words, with 125-150 words being a common average for a conversational pace
- Slower pace: ~110 words per minute
- Normal pace: ~130 words per minute  
- Fast pace: ~170 words per minute
- Very fast pace: ~200 words per minute
- AI speech timing varies, so write enough content to fill the time naturally

REQUIREMENTS:
- Video length: approximately ${lengthInSeconds} seconds (${Math.round(totalMinutes * 10) / 10} minutes)
- Create ${targetSegments} segments of roughly ${avgSegmentDuration} seconds each
- Target word count: approximately ${estimatedTotalWords} total words (${paceWPM} words/minute at ${request.pace} pace)
- Each segment should have approximately ${wordsPerSegment} words
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
      "text": "Engaging narration that fills the time naturally...",
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
    }
  ],
  "seoPackage": {
    "title": "Compelling 60-char YouTube title",
    "description": "SEO-optimized description with keywords",
    "hashtags": ["#relevant", "#hashtags"]
  },
  "chapters": [
    {"timestamp": "00:00", "title": "Introduction"},
    {"timestamp": "00:15", "title": "Main Content"}
  ],
  "ctaPlacements": [
    {"timestamp": "00:10", "type": "subscribe", "message": "If you're enjoying this, subscribe!"}
  ],
  "musicMixing": {
    "backgroundMusicVolume": 20,
    "voiceoverVolume": 100,
    "fadeInDuration": 2,
    "fadeOutDuration": 3
  }
}

CRITICAL WORD COUNT REQUIREMENT - THIS IS MANDATORY:
⚠️ YOU MUST GENERATE AT LEAST ${estimatedTotalWords} TOTAL WORDS ⚠️
Each ${avgSegmentDuration}-second segment MUST contain AT LEAST ${wordsPerSegment} words.
Do NOT generate brief summaries. Write FULL, DETAILED, ELABORATE narration with examples, explanations, and rich descriptions.

GUIDELINES:
1. SCRIPT SEGMENTS: Create engaging, natural narration that flows well
   - Make segments approximately ${avgSegmentDuration} seconds each
   - Each segment MUST contain AT LEAST ${wordsPerSegment} words (based on ${paceWPM} words/minute)
   - Total script MUST contain AT LEAST ${estimatedTotalWords} words to fill ${lengthInSeconds} seconds
   - Write FULL, DETAILED, ENGAGING content with examples and elaboration
   - Add specific details, stories, explanations, and descriptions to reach the word count
   - DO NOT write short, brief segments - expand every idea with rich detail
   - Remember: at ${request.pace} pace (${paceWPM} words/min), you need SUBSTANTIAL content to fill the time
   
2. CATEGORY STRUCTURE: Follow the ${request.category} category structure
   - Structure: ${categoryGuide.structure}
   - Tone: ${categoryGuide.tone}
   - Keywords: ${categoryGuide.keywords}

3. VISUALS: Generate 4-8 media items per segment
   - Mix of videos (60-70%) and images (30-40%)
   - Media Preference: ${categoryGuide.mediaPreference}
   - Each media item: 3-8 seconds duration
   - Cover the full segment duration
   - Detailed descriptions for better stock search results
   - Mark 1-2 items as thumbnail candidates
   
4. SEO PACKAGE:
   - Title: 60 chars max, keyword-rich, compelling
   - Description: 150-200 chars, includes main keywords
   - Hashtags: 5-8 relevant tags
   
5. CHAPTERS: Create 3-5 YouTube chapters with timestamps

6. CTAs: Add 2-4 calls-to-action
   - CTA Style: ${categoryGuide.ctaFocus}
   - Types: subscribe, like, comment, link, product
   
7. MUSIC MIXING:
   - backgroundMusicVolume: 15-30
   - voiceoverVolume: 100
   - fadeInDuration: 2-4 seconds
   - fadeOutDuration: 2-5 seconds

8. Return ONLY the JSON object, no markdown wrappers`;

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
        model: "x-ai/grok-4-fast",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `Create a ${lengthInSeconds}-second ${request.category} video for ${request.audience} about: ${request.prompt}

⚠️ CRITICAL REQUIREMENT - DO NOT IGNORE ⚠️
At ${request.pace} pace (${paceWPM} words/minute), you MUST generate AT LEAST ${estimatedTotalWords} total words to fill ${lengthInSeconds} seconds.
Each segment needs AT LEAST ${wordsPerSegment} words.

COUNT YOUR WORDS before submitting. If any segment has fewer than ${wordsPerSegment} words, ADD MORE DETAIL, EXAMPLES, and ELABORATION.
DO NOT submit brief summaries. Write FULL, DETAILED, ENGAGING narration that actually fills the time.

Generate a complete script with engaging narration, stock media recommendations, SEO package, chapters, CTAs, and music mixing recommendations.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 8000,
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
      
      // Try to use what we got if segments exist
      if (parsedResult.segments && parsedResult.segments.length > 0) {
        console.log("Using partial result despite validation errors");
        return {
          segments: parsedResult.segments || [],
          mediaItems: parsedResult.mediaItems || [],
          seoPackage: parsedResult.seoPackage || null,
          chapters: parsedResult.chapters || [],
          ctaPlacements: parsedResult.ctaPlacements || [],
          musicMixing: parsedResult.musicMixing || null,
        };
      }
      
      throw new Error("AI response did not match expected format. Please try again.");
    }

    console.log(`Generated script with ${validationResult.data.segments.length} segments and ${validationResult.data.mediaItems.length} media items`);

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
