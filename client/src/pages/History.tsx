import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, 
  FileText, 
  Image as ImageIcon, 
  Lightbulb, 
  Video, 
  Download, 
  Trash2,
  Mic
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface GenerationHistory {
  id: string;
  user_id: string;
  type: 'script' | 'channel_name' | 'video_idea' | 'thumbnail' | 'audio';
  prompt?: string;
  result: any;
  created_at: string;
  expires_at: string;
}

const typeIcons = {
  script: Video,
  channel_name: FileText,
  video_idea: Lightbulb,
  thumbnail: ImageIcon,
  audio: Mic,
};

const typeLabels = {
  script: 'Video Script',
  channel_name: 'Channel Name',
  video_idea: 'Video Idea',
  thumbnail: 'Thumbnail',
  audio: 'Audio',
};

const typeColors = {
  script: 'bg-blue-500/10 text-blue-500',
  channel_name: 'bg-purple-500/10 text-purple-500',
  video_idea: 'bg-yellow-500/10 text-yellow-500',
  thumbnail: 'bg-green-500/10 text-green-500',
  audio: 'bg-pink-500/10 text-pink-500',
};

export default function MyProject() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const { data: history = [], isLoading } = useQuery<GenerationHistory[]>({
    queryKey: ['/api/history', { type: selectedType === 'all' ? undefined : selectedType, limit: 100 }],
    enabled: !!user,
    refetchInterval: 30000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/history/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/history'] });
      toast({
        title: "Deleted",
        description: "History item deleted successfully",
      });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete item",
        variant: "destructive",
      });
    },
  });

  const handleDownload = (item: GenerationHistory) => {
    let downloadContent: string;
    let filename: string;
    let mimeType: string;

    switch (item.type) {
      case 'script':
        const scriptText = item.result.segments?.map((seg: any) => seg.text).join('\n\n') || '';
        const seoInfo = item.result.seoPackage ? `\n\n=== SEO Package ===\nTitle: ${item.result.seoPackage.title}\nDescription: ${item.result.seoPackage.description}\nHashtags: ${item.result.seoPackage.hashtags?.join(', ')}\n` : '';
        downloadContent = `${scriptText}${seoInfo}`;
        filename = `script-${item.id}.txt`;
        mimeType = 'text/plain';
        break;
      
      case 'channel_name':
        downloadContent = JSON.stringify(item.result, null, 2);
        filename = `channel-${item.id}.json`;
        mimeType = 'application/json';
        break;
      
      case 'video_idea':
        downloadContent = JSON.stringify(item.result, null, 2);
        filename = `video-idea-${item.id}.json`;
        mimeType = 'application/json';
        break;
      
      case 'thumbnail':
        if (item.result.thumbnailUrl) {
          window.open(item.result.thumbnailUrl, '_blank');
          return;
        }
        toast({
          title: "No download available",
          description: "Thumbnail URL not found",
          variant: "destructive",
        });
        return;
      
      case 'audio':
        if (item.result.audioUrl) {
          window.open(item.result.audioUrl, '_blank');
          return;
        }
        toast({
          title: "No download available",
          description: "Audio URL not found",
          variant: "destructive",
        });
        return;
      
      default:
        downloadContent = JSON.stringify(item.result, null, 2);
        filename = `generation-${item.id}.json`;
        mimeType = 'application/json';
    }

    const blob = new Blob([downloadContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: "File downloaded successfully",
    });
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">My Project</h1>
          <p className="text-muted-foreground" data-testid="text-page-description">
            Loading your projects...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">My Project</h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          View, download, and manage your generated content. Items expire after 2 hours.
        </p>
      </div>

      <Tabs value={selectedType} onValueChange={setSelectedType} className="w-full">
        <TabsList className="mb-6" data-testid="tabs-history-filter">
          <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
          <TabsTrigger value="script" data-testid="tab-script">Scripts</TabsTrigger>
          <TabsTrigger value="video_idea" data-testid="tab-ideas">Video Ideas</TabsTrigger>
          <TabsTrigger value="channel_name" data-testid="tab-channels">Channel Names</TabsTrigger>
          <TabsTrigger value="thumbnail" data-testid="tab-thumbnails">Thumbnails</TabsTrigger>
          <TabsTrigger value="audio" data-testid="tab-audio">Audio</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedType} className="mt-0">
          {history.length === 0 ? (
            <Card data-testid="card-empty-history">
              <CardContent className="py-16 text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                <p className="text-muted-foreground">
                  {selectedType === 'all' 
                    ? "Start creating content to see your projects here"
                    : `No ${typeLabels[selectedType as keyof typeof typeLabels]?.toLowerCase()} generations found`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {history.map((item) => {
                const Icon = typeIcons[item.type];
                const expiresIn = formatDistanceToNow(new Date(item.expires_at), { addSuffix: true });
                const createdAt = formatDistanceToNow(new Date(item.created_at), { addSuffix: true });

                return (
                  <Card key={item.id} data-testid={`card-history-item-${item.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2.5 rounded-md ${typeColors[item.type]}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Badge variant="secondary" className="text-xs">
                                {typeLabels[item.type]}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Created {createdAt}
                              </span>
                            </div>
                            <CardTitle className="text-base mb-1">
                              {item.prompt || 'Untitled'}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3" />
                              <span>Expires {expiresIn}</span>
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(item)}
                            data-testid={`button-download-${item.id}`}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(item.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-${item.id}`}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {item.type === 'script' && item.result?.seoPackage?.title && (
                        <div className="bg-muted/50 rounded-md p-3">
                          <p className="text-sm font-medium mb-1">
                            {item.result.seoPackage.title}
                          </p>
                          {item.result.seoPackage.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {item.result.seoPackage.description}
                            </p>
                          )}
                          {item.result.seoPackage.hashtags && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {item.result.seoPackage.hashtags.slice(0, 5).map((tag: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {item.type === 'channel_name' && item.result?.channelName && (
                        <div className="bg-muted/50 rounded-md p-3 flex items-center gap-3">
                          {item.result.logoUrl && (
                            <img 
                              src={item.result.logoUrl} 
                              alt="Channel Logo" 
                              className="w-12 h-12 rounded-md object-cover"
                            />
                          )}
                          <div>
                            <p className="text-sm font-medium">{item.result.channelName}</p>
                            {item.prompt && (
                              <p className="text-xs text-muted-foreground">Niche: {item.prompt}</p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {item.type === 'video_idea' && item.result?.title && (
                        <div className="bg-muted/50 rounded-md p-3">
                          <p className="text-sm font-medium mb-1">{item.result.title}</p>
                          {item.result.description && (
                            <p className="text-xs text-muted-foreground line-clamp-3 mb-2">
                              {item.result.description}
                            </p>
                          )}
                          <div className="flex gap-2 flex-wrap">
                            {item.result.category && (
                              <Badge variant="outline" className="text-xs">
                                {item.result.category}
                              </Badge>
                            )}
                            {item.result.mood && (
                              <Badge variant="outline" className="text-xs">
                                {item.result.mood}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {item.type === 'thumbnail' && item.result?.thumbnailUrl && (
                        <div className="bg-muted/50 rounded-md p-3">
                          <img 
                            src={item.result.thumbnailUrl} 
                            alt="Thumbnail" 
                            className="w-full max-w-md rounded-md"
                          />
                        </div>
                      )}

                      {item.type === 'audio' && item.result?.audioUrl && (
                        <div className="bg-muted/50 rounded-md p-3">
                          <audio controls className="w-full" src={item.result.audioUrl}>
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this generation from your project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
