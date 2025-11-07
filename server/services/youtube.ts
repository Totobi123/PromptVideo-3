import { google } from "googleapis";
import type { YoutubeChannel } from "@shared/schema";

const youtube = google.youtube("v3");

function getOAuth2Client(redirectUri?: string) {
  return new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    redirectUri
  );
}

export function getAuthUrl(redirectUri: string): string {
  const oauth2Client = getOAuth2Client(redirectUri);
  const scopes = [
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.force-ssl",
    "https://www.googleapis.com/auth/youtubepartner",
  ];

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    redirect_uri: redirectUri,
    prompt: "consent",
  });
}

export async function exchangeCodeForTokens(code: string, redirectUri: string) {
  const oauth2Client = getOAuth2Client(redirectUri);
  const { tokens } = await oauth2Client.getToken(code);
  
  if (!tokens.access_token || !tokens.refresh_token) {
    throw new Error("Failed to obtain tokens from YouTube");
  }

  oauth2Client.setCredentials(tokens);
  
  const channelResponse = await youtube.channels.list({
    auth: oauth2Client,
    part: ["snippet", "statistics", "contentDetails"],
    mine: true,
  });

  const channel = channelResponse.data.items?.[0];
  if (!channel || !channel.id) {
    throw new Error("No channel found for this account");
  }

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600 * 1000),
    channelInfo: {
      channelId: channel.id,
      channelTitle: channel.snippet?.title || "",
      channelDescription: channel.snippet?.description || "",
      thumbnailUrl: channel.snippet?.thumbnails?.default?.url || "",
      subscriberCount: channel.statistics?.subscriberCount || "0",
      videoCount: channel.statistics?.videoCount || "0",
      viewCount: channel.statistics?.viewCount || "0",
    },
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  expiresAt: Date;
}> {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  const { credentials } = await oauth2Client.refreshAccessToken();
  
  if (!credentials.access_token) {
    throw new Error("Failed to refresh access token");
  }

  return {
    accessToken: credentials.access_token,
    expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : new Date(Date.now() + 3600 * 1000),
  };
}

export async function getChannelAnalytics(channel: YoutubeChannel) {
  const oauth2Client = getOAuth2Client();
  if (new Date() > new Date(channel.tokenExpiresAt)) {
    const refreshed = await refreshAccessToken(channel.refreshToken);
    oauth2Client.setCredentials({
      access_token: refreshed.accessToken,
      refresh_token: channel.refreshToken,
    });
  } else {
    oauth2Client.setCredentials({
      access_token: channel.accessToken,
      refresh_token: channel.refreshToken,
    });
  }

  const [channelResponse, videosResponse] = await Promise.all([
    youtube.channels.list({
      auth: oauth2Client,
      part: ["snippet", "statistics", "contentDetails"],
      id: [channel.channelId],
    }),
    youtube.search.list({
      auth: oauth2Client,
      part: ["snippet"],
      channelId: channel.channelId,
      order: "date",
      maxResults: 10,
      type: ["video"],
    }),
  ]);

  const channelData = channelResponse.data.items?.[0];
  const videoItems = videosResponse.data.items || [];

  const videoIds = videoItems.map((item: any) => item.id?.videoId).filter(Boolean) as string[];
  
  let videoStats: any[] = [];
  if (videoIds.length > 0) {
    const videoStatsResponse = await youtube.videos.list({
      auth: oauth2Client,
      part: ["statistics", "contentDetails"],
      id: videoIds,
    });
    videoStats = videoStatsResponse.data.items || [];
  }

  const recentVideos = videoItems.map((item: any, index: number) => {
    const stats = videoStats[index]?.statistics || {};
    const contentDetails = videoStats[index]?.contentDetails || {};
    
    return {
      videoId: item.id?.videoId || "",
      title: item.snippet?.title || "",
      description: item.snippet?.description || "",
      thumbnailUrl: item.snippet?.thumbnails?.medium?.url || "",
      publishedAt: item.snippet?.publishedAt || "",
      viewCount: parseInt(stats.viewCount || "0"),
      likeCount: parseInt(stats.likeCount || "0"),
      commentCount: parseInt(stats.commentCount || "0"),
      duration: contentDetails.duration || "",
    };
  });

  const totalViews = parseInt(channelData?.statistics?.viewCount || "0");
  const subscriberCount = parseInt(channelData?.statistics?.subscriberCount || "0");
  const videoCount = parseInt(channelData?.statistics?.videoCount || "0");

  return {
    channelInfo: {
      channelId: channel.channelId,
      title: channelData?.snippet?.title || "",
      description: channelData?.snippet?.description || "",
      thumbnailUrl: channelData?.snippet?.thumbnails?.default?.url || "",
      subscriberCount,
      videoCount,
      viewCount: totalViews,
    },
    recentVideos,
    analytics: {
      totalViews,
      totalWatchTime: 0,
      averageViewDuration: 0,
      subscriberChange: 0,
      estimatedRevenue: 0,
    },
  };
}

export async function uploadVideoToYoutube(
  channel: YoutubeChannel,
  videoPath: string,
  metadata: {
    title: string;
    description: string;
    tags?: string[];
    categoryId?: string;
    privacyStatus: "public" | "private" | "unlisted";
  }
) {
  const oauth2Client = getOAuth2Client();
  if (new Date() > new Date(channel.tokenExpiresAt)) {
    const refreshed = await refreshAccessToken(channel.refreshToken);
    oauth2Client.setCredentials({
      access_token: refreshed.accessToken,
      refresh_token: channel.refreshToken,
    });
  } else {
    oauth2Client.setCredentials({
      access_token: channel.accessToken,
      refresh_token: channel.refreshToken,
    });
  }

  const fs = await import("fs");
  
  const response = await youtube.videos.insert({
    auth: oauth2Client,
    part: ["snippet", "status"],
    requestBody: {
      snippet: {
        title: metadata.title,
        description: metadata.description,
        tags: metadata.tags,
        categoryId: metadata.categoryId || "22",
      },
      status: {
        privacyStatus: metadata.privacyStatus,
      },
    },
    media: {
      body: fs.createReadStream(videoPath),
    },
  });

  return {
    videoId: response.data.id || "",
    videoUrl: `https://www.youtube.com/watch?v=${response.data.id}`,
  };
}
