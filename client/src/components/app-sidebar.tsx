import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { 
  Home,
  Video,
  FileText, 
  Mic, 
  BarChart3, 
  Image, 
  LogOut,
  Youtube,
  History,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Text to Video",
    url: "/dashboard/text-to-video",
    icon: Video,
  },
  {
    title: "Script Generation",
    url: "/dashboard/script",
    icon: FileText,
  },
  {
    title: "Text to Speech",
    url: "/dashboard/text-to-speech",
    icon: Mic,
  },
  {
    title: "Thumbnail Generator",
    url: "/dashboard/thumbnail",
    icon: Image,
  },
  {
    title: "My Project",
    url: "/dashboard/my-project",
    icon: History,
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user, userProfile, signOut } = useAuth();

  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-md">
            <Youtube className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-bold">Tivideo</h2>
            <p className="text-xs text-muted-foreground">YouTube Creator Studio</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {userProfile?.channelName && (
          <SidebarGroup>
            <SidebarGroupLabel>Your Channel</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-3 py-2">
                <p className="font-medium text-sm">{userProfile.channelName}</p>
                <p className="text-xs text-muted-foreground">{userProfile.selectedNiche}</p>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3 mb-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.email}</p>
            <p className="text-xs text-muted-foreground truncate">
              {userProfile?.userType || "Creator"}
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={signOut}
          className="w-full"
          data-testid="button-signout-sidebar"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
