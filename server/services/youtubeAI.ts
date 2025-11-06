const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

interface ChannelAnalyticsData {
  channelInfo: {
    channelId: string;
    title: string;
    description: string;
    subscriberCount: number;
    videoCount: number;
    viewCount: number;
  };
  recentVideos: Array<{
    videoId: string;
    title: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    publishedAt: string;
  }>;
  analytics: {
    totalViews: number;
    totalWatchTime: number;
    averageViewDuration: number;
    subscriberChange: number;
  };
}

export async function generateChannelInsights(
  analyticsData: ChannelAnalyticsData
): Promise<{
  performanceSummary: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  trendingTopics: string[];
}> {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const systemPrompt = `You are an expert YouTube channel analyst. Analyze the provided channel data and recent video performance to provide actionable insights.

Your analysis should include:
1. Performance Summary: A brief overview of the channel's current state
2. Strengths: 3-5 things the channel is doing well
3. Areas for Improvement: 3-5 specific areas that need attention
4. Recommendations: 3-5 actionable strategies to grow the channel
5. Trending Topics: 3-5 content themes or topics the channel should explore

Base your analysis on:
- Subscriber count and growth patterns
- Video performance metrics (views, likes, comments)
- Engagement rates
- Publishing consistency
- Content diversity

Return ONLY a JSON object with these exact fields:
{
  "performanceSummary": "string",
  "strengths": ["string", "string", ...],
  "improvements": ["string", "string", ...],
  "recommendations": ["string", "string", ...],
  "trendingTopics": ["string", "string", ...]
}`;

  const userPrompt = `Channel: ${analyticsData.channelInfo.title}
Subscribers: ${analyticsData.channelInfo.subscriberCount}
Total Videos: ${analyticsData.channelInfo.videoCount}
Total Views: ${analyticsData.channelInfo.viewCount}

Recent Videos Performance:
${analyticsData.recentVideos.map((v, i) => `
${i + 1}. "${v.title}"
   - Published: ${new Date(v.publishedAt).toLocaleDateString()}
   - Views: ${v.viewCount}
   - Likes: ${v.likeCount}
   - Comments: ${v.commentCount}
   - Engagement Rate: ${v.viewCount > 0 ? ((v.likeCount + v.commentCount) / v.viewCount * 100).toFixed(2) : 0}%
`).join('\n')}

Channel Analytics:
- Average Views per Video: ${analyticsData.channelInfo.videoCount > 0 ? (analyticsData.channelInfo.viewCount / analyticsData.channelInfo.videoCount).toFixed(0) : 0}
- Subscriber Change (Recent): ${analyticsData.analytics.subscriberChange}

Please analyze this data and provide detailed insights.`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://tivideo.replit.app",
        "X-Title": "Tivideo YouTube Analytics",
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
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
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
      throw new Error("No insights received from AI");
    }

    let jsonContent = content.trim();
    if (jsonContent.startsWith("```json")) {
      jsonContent = jsonContent.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonContent.startsWith("```")) {
      jsonContent = jsonContent.replace(/```\n?/g, "");
    }

    const insights = JSON.parse(jsonContent);

    return {
      performanceSummary: insights.performanceSummary || "No summary available",
      strengths: insights.strengths || [],
      improvements: insights.improvements || [],
      recommendations: insights.recommendations || [],
      trendingTopics: insights.trendingTopics || [],
    };
  } catch (error) {
    console.error("Error generating channel insights:", error);
    throw new Error(`Failed to generate insights: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
