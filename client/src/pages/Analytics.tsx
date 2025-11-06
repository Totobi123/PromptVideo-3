import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Video, Eye, Users } from "lucide-react";

export default function Analytics() {
  const stats = [
    { label: "Total Videos", value: "0", icon: Video, change: "+0%" },
    { label: "Total Views", value: "0", icon: Eye, change: "+0%" },
    { label: "Subscribers", value: "0", icon: Users, change: "+0%" },
    { label: "Engagement Rate", value: "0%", icon: TrendingUp, change: "+0%" },
  ];

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Analytics</h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          Track your channel performance and growth
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {stats.map((stat, idx) => (
          <Card key={idx}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" data-testid={`text-stat-label-${idx}`}>
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" data-testid={`icon-stat-${idx}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid={`text-stat-value-${idx}`}>{stat.value}</div>
              <p className="text-xs text-muted-foreground" data-testid={`text-stat-change-${idx}`}>
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle data-testid="text-connect-title">Connect Your YouTube Channel</CardTitle>
          <CardDescription data-testid="text-connect-subtitle">
            Connect your YouTube account to see real-time analytics and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4" data-testid="text-connect-message">
              Analytics will be available once you connect your YouTube channel
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
