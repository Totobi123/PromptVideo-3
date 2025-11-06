import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Video, FileText, Lightbulb, Image, Mic, Clock } from "lucide-react";
import type { GenerationCountsResponse, UsageOverTimeResponse, MostUsedSettingsResponse, QuickStatsResponse } from "@shared/schema";

export default function Analytics() {
  const [timePeriod, setTimePeriod] = useState<"daily" | "weekly" | "monthly">("daily");

  const { data: generationCounts, isLoading: countsLoading } = useQuery<GenerationCountsResponse>({
    queryKey: ["/api/analytics/generation-counts"],
  });

  const { data: usageOverTime, isLoading: usageLoading } = useQuery<UsageOverTimeResponse>({
    queryKey: ["/api/analytics/usage-over-time", timePeriod],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/usage-over-time?period=${timePeriod}`, {
        headers: {
          "x-user-id": localStorage.getItem("userId") || "",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch usage over time");
      return res.json();
    },
  });

  const { data: mostUsedSettings, isLoading: settingsLoading } = useQuery<MostUsedSettingsResponse>({
    queryKey: ["/api/analytics/most-used-settings"],
  });

  const { data: quickStats, isLoading: statsLoading } = useQuery<QuickStatsResponse>({
    queryKey: ["/api/analytics/quick-stats"],
  });

  const generationStats = [
    { 
      label: "Scripts Generated", 
      value: generationCounts?.scripts || 0, 
      icon: FileText,
      color: "text-blue-600"
    },
    { 
      label: "Channel Names", 
      value: generationCounts?.channelNames || 0, 
      icon: Video,
      color: "text-purple-600"
    },
    { 
      label: "Video Ideas", 
      value: generationCounts?.ideas || 0, 
      icon: Lightbulb,
      color: "text-yellow-600"
    },
    { 
      label: "Thumbnails", 
      value: generationCounts?.thumbnails || 0, 
      icon: Image,
      color: "text-green-600"
    },
    { 
      label: "Audio Files", 
      value: generationCounts?.audio || 0, 
      icon: Mic,
      color: "text-red-600"
    },
  ];

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Usage & Analytics</h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          Track your content generation activity and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {generationStats.map((stat, idx) => (
          <Card key={idx}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" data-testid={`text-stat-label-${idx}`}>
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} data-testid={`icon-stat-${idx}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid={`text-stat-value-${idx}`}>
                {countsLoading ? "..." : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" data-testid="text-total-generations">
              Total Generations
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-generations-value">
              {statsLoading ? "..." : quickStats?.totalGenerations || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" data-testid="text-avg-script-length">
              Avg Script Length
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-avg-script-length-value">
              {statsLoading ? "..." : `${quickStats?.averageScriptLength || 0} chars`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" data-testid="text-total-render-time">
              Total Render Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-render-time-value">
              {statsLoading ? "..." : formatTime(quickStats?.totalRenderTime || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle data-testid="text-usage-chart-title">Usage Over Time</CardTitle>
              <CardDescription data-testid="text-usage-chart-subtitle">
                Your generation activity
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={timePeriod === "daily" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimePeriod("daily")}
                data-testid="button-period-daily"
              >
                Daily
              </Button>
              <Button
                variant={timePeriod === "weekly" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimePeriod("weekly")}
                data-testid="button-period-weekly"
              >
                Weekly
              </Button>
              <Button
                variant={timePeriod === "monthly" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimePeriod("monthly")}
                data-testid="button-period-monthly"
              >
                Monthly
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {usageLoading ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground">Loading chart...</p>
            </div>
          ) : usageOverTime?.data && usageOverTime.data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usageOverTime.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    if (timePeriod === "monthly") {
                      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                    }
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => {
                    const date = new Date(value as string);
                    return date.toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    });
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground" data-testid="text-no-data">
                No generation data yet. Start creating content to see your analytics!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg" data-testid="text-most-used-moods-title">Most Used Moods</CardTitle>
          </CardHeader>
          <CardContent>
            {settingsLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : mostUsedSettings?.moods && mostUsedSettings.moods.length > 0 ? (
              <div className="space-y-2">
                {mostUsedSettings.moods.map((mood, idx) => (
                  <div key={idx} className="flex items-center justify-between" data-testid={`mood-item-${idx}`}>
                    <Badge variant="secondary" className="capitalize">
                      {mood.name}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{mood.count}x</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg" data-testid="text-most-used-paces-title">Most Used Paces</CardTitle>
          </CardHeader>
          <CardContent>
            {settingsLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : mostUsedSettings?.paces && mostUsedSettings.paces.length > 0 ? (
              <div className="space-y-2">
                {mostUsedSettings.paces.map((pace, idx) => (
                  <div key={idx} className="flex items-center justify-between" data-testid={`pace-item-${idx}`}>
                    <Badge variant="secondary" className="capitalize">
                      {pace.name.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{pace.count}x</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg" data-testid="text-most-used-categories-title">Most Used Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {settingsLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : mostUsedSettings?.categories && mostUsedSettings.categories.length > 0 ? (
              <div className="space-y-2">
                {mostUsedSettings.categories.map((category, idx) => (
                  <div key={idx} className="flex items-center justify-between" data-testid={`category-item-${idx}`}>
                    <Badge variant="secondary" className="capitalize">
                      {category.name}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{category.count}x</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle data-testid="text-aspect-ratio-title">Most Common Aspect Ratio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="text-aspect-ratio-value">
            {statsLoading ? "..." : quickStats?.mostCommonAspectRatio || "16:9"}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Based on your video generations
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
