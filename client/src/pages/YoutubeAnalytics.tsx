import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Users, 
  Video, 
  Eye, 
  Lightbulb, 
  ThumbsUp, 
  MessageSquare,
  Loader2,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { useLocation } from "wouter";
import type { YoutubeAnalyticsResponse } from "@shared/schema";

export default function YoutubeAnalytics() {
  const [, setLocation] = useLocation();

  const { data, isLoading, error } = useQuery<YoutubeAnalyticsResponse>({
    queryKey: ["/api/youtube/analytics"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Unable to Load Analytics
            </CardTitle>
            <CardDescription>
              {error instanceof Error && error.message.includes("No YouTube channel")
                ? "You need to connect your YouTube channel first"
                : "There was an error loading your analytics"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/youtube/channel")} data-testid="button-connect-channel">
              Connect YouTube Channel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">YouTube Analytics</h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          AI-powered insights for {data.channelInfo.title}
        </p>
      </div>

      <div className="grid gap-6">
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Subscribers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-2xl font-bold" data-testid="text-analytics-subscribers">
                  {data.channelInfo.subscriberCount.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Videos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-muted-foreground" />
                <span className="text-2xl font-bold" data-testid="text-analytics-videos">
                  {data.channelInfo.videoCount.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <span className="text-2xl font-bold" data-testid="text-analytics-views">
                  {data.channelInfo.viewCount.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Views/Video</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-2xl font-bold" data-testid="text-analytics-avg-views">
                  {data.channelInfo.videoCount > 0
                    ? Math.round(data.channelInfo.viewCount / data.channelInfo.videoCount).toLocaleString()
                    : "0"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground" data-testid="text-ai-summary">
              {data.aiInsights.performanceSummary}
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-green-600" />
                Channel Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.aiInsights.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2" data-testid={`text-strength-${index}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-600 mt-2 flex-shrink-0" />
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.aiInsights.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-2" data-testid={`text-improvement-${index}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-2 flex-shrink-0" />
                    <span className="text-sm">{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              AI Recommendations
            </CardTitle>
            <CardDescription>
              Actionable strategies to grow your channel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.aiInsights.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-3" data-testid={`text-recommendation-${index}`}>
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5 text-blue-600" />
              Recent Videos
            </CardTitle>
            <CardDescription>
              Performance overview of your latest uploads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentVideos.slice(0, 5).map((video) => (
                <div
                  key={video.videoId}
                  className="flex items-start gap-4 p-3 rounded-lg hover-elevate cursor-pointer"
                  onClick={() => window.open(`https://youtube.com/watch?v=${video.videoId}`, "_blank")}
                  data-testid={`card-video-${video.videoId}`}
                >
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-32 h-18 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2 mb-1">{video.title}</h4>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {video.viewCount.toLocaleString()} views
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        {video.likeCount.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {video.commentCount.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(video.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {data.aiInsights.trendingTopics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Trending Topics
              </CardTitle>
              <CardDescription>
                Content themes to explore based on your niche
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.aiInsights.trendingTopics.map((topic, index) => (
                  <Badge key={index} variant="secondary" data-testid={`badge-topic-${index}`}>
                    {topic}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
