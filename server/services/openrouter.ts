import type { GenerateScriptRequest, ScriptSegment, MediaItem } from "@shared/schema";
import { aiScriptResponseSchema } from "@shared/schema";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function generateVideoScript(request: GenerateScriptRequest): Promise<{ 
  segments: ScriptSegment[], 
  mediaItems: MediaItem[],
  seoPackage?: any,
  chapters?: any[],
  ctaPlacements?: any[],
  musicMixing?: any
}> {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
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

  // Calculate word counts based on Murf AI realistic speech timing
  // Murf AI average: 1 minute ≈ 150 words
  // Slow/Emotional: 110-130 WPM | Normal/Conversational: 140-160 WPM | Fast/Energetic: 170-190 WPM
  const wordsPerMinute = {
    normal: 150,      // Murf AI conversational average
    fast: 180,        // Murf AI fast/energetic pace
    very_fast: 190,   // Murf AI upper fast limit
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

IMPORTANT MURF AI SPEECH TIMING GUIDELINES:
- Murf AI average: 1 minute ≈ 150 words
- Slow/Emotional pace: 110-130 words per minute
- Normal/Conversational pace: 140-160 words per minute (use 150 as target)
- Fast/Energetic pace: 170-190 words per minute (use 180 as target)
- Write concise, engaging content that fits these word counts EXACTLY

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
      "description": "Specific, detailed description for stock search or AI generation",
      "isThumbnailCandidate": true,
      "transition": "fade",
      "suggestedMediaSource": "stock"
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
    "backgroundMusicVolume": 0.2,
    "voiceoverVolume": 1.0,
    "fadeInDuration": 2,
    "fadeOutDuration": 3
  }
}

WORD COUNT TARGET (IMPORTANT):
Target: approximately ${estimatedTotalWords} total words (${paceWPM} words/minute at ${request.pace} pace)
Each ${avgSegmentDuration}-second segment should have approximately ${wordsPerSegment} words
Write concise, engaging content that matches these targets - not too brief, not too verbose.

GUIDELINES:
1. SCRIPT SEGMENTS: Create engaging, natural narration that flows well
   - Make segments approximately ${avgSegmentDuration} seconds each
   - Each segment should contain approximately ${wordsPerSegment} words (based on ${paceWPM} words/minute)
   - Total script should be approximately ${estimatedTotalWords} words to fill ${lengthInSeconds} seconds
   - Write engaging, well-paced content - concise but informative
   - Focus on quality over quantity - every word should add value
   - Remember: at ${request.pace} pace (${paceWPM} words/min), aim for ${estimatedTotalWords} total words
   
2. CATEGORY STRUCTURE: Follow the ${request.category} category structure
   - Structure: ${categoryGuide.structure}
   - Tone: ${categoryGuide.tone}
   - Keywords: ${categoryGuide.keywords}

3. VISUALS: Generate 4-8 media items per segment
   - Mix of videos (60-70%) and images (30-40%)
   - Media Preference: ${categoryGuide.mediaPreference}
   - Each media item: 3-8 seconds duration
   - Cover the full segment duration
   - IMPORTANT: For each media item, analyze the content and set "suggestedMediaSource":
     * Use "ai" for: Specific stories, abstract concepts, unique scenarios, detailed characters, fantasy/sci-fi, custom branding, specific emotions/expressions, historical recreations, educational diagrams, or anything requiring precise creative control
     * Use "stock" for: Generic scenes, nature/landscapes, common objects, typical people/activities, cityscapes, food, sports, business settings, or any widely available real-world content
   - Write HIGHLY SPECIFIC descriptions that will work well for both AI generation AND stock search
   - For AI items: Be very detailed about composition, style, mood, and specific elements
   - For stock items: Use clear, searchable keywords that match common stock library content
   - Mark 1-2 items as thumbnail candidates
   
4. SEO PACKAGE:
   - Title: 60 chars max, keyword-rich, compelling
   - Description: 150-200 chars, includes main keywords
   - Hashtags: 5-8 relevant tags
   
5. CHAPTERS: Create 3-5 YouTube chapters with timestamps

6. CTAs: Add 2-4 calls-to-action
   - CTA Style: ${categoryGuide.ctaFocus}
   - Types: subscribe, like, comment, link, product
   
7. MUSIC MIXING (volumes must be 0.0 to 1.0):
   - backgroundMusicVolume: 0.15-0.30 (background music volume, 0.0 = silent, 1.0 = full)
   - voiceoverVolume: 1.0 (voiceover volume, keep at 1.0 for clarity)
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

TARGET: At ${request.pace} pace (${paceWPM} words/minute), aim for approximately ${estimatedTotalWords} total words to fill ${lengthInSeconds} seconds.
Each segment should be approximately ${wordsPerSegment} words.

Write concise, engaging narration that matches this word count - not too brief, not too verbose. Focus on quality and pacing.

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

    if (parsedResult.musicMixing) {
      if (parsedResult.musicMixing.backgroundMusicVolume > 1) {
        parsedResult.musicMixing.backgroundMusicVolume = parsedResult.musicMixing.backgroundMusicVolume / 100;
      }
      if (parsedResult.musicMixing.voiceoverVolume > 1) {
        parsedResult.musicMixing.voiceoverVolume = parsedResult.musicMixing.voiceoverVolume / 100;
      }
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

export async function improvePrompt(originalPrompt: string): Promise<string> {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const systemPrompt = `You are an AI assistant that helps improve video prompts for better video generation. 
Your task is to take a user's basic video idea and expand it into a detailed, specific prompt that will result in a better video.

IMPROVEMENTS TO MAKE:
1. Add specific details about what should be shown or explained
2. Clarify the target audience if not mentioned
3. Add tone/style suggestions if appropriate
4. Include key points that should be covered
5. Make it more actionable and specific
6. Keep it concise but informative (2-4 sentences)

DO NOT change the core idea - only enhance and clarify it.
Return ONLY the improved prompt text, no explanations or meta-commentary.`;

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
            content: `Improve this video prompt:\n\n${originalPrompt}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const improvedPrompt = data.choices?.[0]?.message?.content?.trim();

    if (!improvedPrompt) {
      throw new Error("No improved prompt received from AI");
    }

    return improvedPrompt;
  } catch (error) {
    console.error("Error improving prompt:", error);
    throw new Error(`Failed to improve prompt: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function suggestDetails(prompt: string): Promise<{
  mood: string;
  category: string;
  pace: string;
  audience: string;
  length: number;
}> {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const systemPrompt = `You are an AI assistant that analyzes video prompts and suggests the best settings for video generation.

Analyze the prompt and suggest:
- mood: happy, casual, sad, promotional, or enthusiastic
- category: tech, cooking, travel, education, gaming, fitness, vlog, review, tutorial, entertainment, or gospel
- pace: normal, fast, or very_fast
- audience: kids, teens, adults, professionals, or general
- length: suggested video length in seconds (30-300)

Return ONLY a JSON object with these exact fields, no markdown wrappers:
{
  "mood": "casual",
  "category": "tech",
  "pace": "normal",
  "audience": "general",
  "length": 60
}`;

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
            content: `Analyze this video prompt and suggest the best settings:\n\n${prompt}`,
          },
        ],
        temperature: 0.5,
        max_tokens: 200,
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
      throw new Error("No suggestions received from AI");
    }

    let jsonContent = content.trim();
    if (jsonContent.startsWith("```json")) {
      jsonContent = jsonContent.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonContent.startsWith("```")) {
      jsonContent = jsonContent.replace(/```\n?/g, "");
    }

    const suggestions = JSON.parse(jsonContent);
    
    return {
      mood: suggestions.mood,
      category: suggestions.category,
      pace: suggestions.pace,
      audience: suggestions.audience,
      length: suggestions.length,
    };
  } catch (error) {
    console.error("Error suggesting details:", error);
    throw new Error(`Failed to suggest details: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
