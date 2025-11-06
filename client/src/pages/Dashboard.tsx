import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Video, FileText, Mic, BarChart3, Image as ImageIcon, ArrowRight } from "lucide-react";

const tools = [
  {
    title: "Text to Video Script",
    description: "Generate complete video scripts with voiceover, music, and media recommendations",
    icon: Video,
    href: "/dashboard/text-to-video-script",
    color: "text-primary",
  },
  {
    title: "Script Generation",
    description: "Create engaging scripts for your YouTube videos",
    icon: FileText,
    href: "/dashboard/script",
    color: "text-blue-500",
  },
  {
    title: "Text to Speech",
    description: "Convert your scripts into professional voiceovers",
    icon: Mic,
    href: "/dashboard/text-to-speech",
    color: "text-green-500",
  },
  {
    title: "Analytics",
    description: "Track your channel's performance and growth",
    icon: BarChart3,
    href: "/dashboard/analytics",
    color: "text-orange-500",
  },
  {
    title: "Thumbnail Generator",
    description: "Create eye-catching thumbnails for your videos",
    icon: ImageIcon,
    href: "/dashboard/thumbnail",
    color: "text-purple-500",
  },
];

export default function Dashboard() {
  const { user, userProfile } = useAuth();

  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold" data-testid="text-welcome">
              Welcome back{userProfile?.channelName ? `, ${userProfile.channelName}` : ''}
            </h1>
            <p className="text-muted-foreground text-lg">
              Choose a tool to get started creating amazing content
            </p>
          </div>
          <Card className="min-w-[280px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Account Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" data-testid="text-email">
                    {user?.email}
                  </p>
                  {userProfile?.userType && (
                    <Badge variant="secondary" className="mt-1">
                      {userProfile.userType}
                    </Badge>
                  )}
                </div>
              </div>
              {userProfile?.selectedNiche && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">Niche</p>
                  <p className="text-sm font-medium" data-testid="text-niche">
                    {userProfile.selectedNiche}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Available Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.href} href={tool.href}>
                  <Card className="hover-elevate active-elevate-2 cursor-pointer h-full transition-all" data-testid={`card-tool-${tool.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="p-2 rounded-md bg-muted">
                          <Icon className={`h-6 w-6 ${tool.color}`} />
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <CardTitle className="text-lg">{tool.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {tool.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="ghost" size="sm" className="w-full" data-testid={`button-open-${tool.title.toLowerCase().replace(/\s+/g, '-')}`}>
                        Open Tool
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
