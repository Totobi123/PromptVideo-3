import { MediaRecommendations } from '../MediaRecommendations';

export default function MediaRecommendationsExample() {
  const mockMedia = [
    {
      type: 'image' as const,
      startTime: '00:00',
      endTime: '00:15',
      description: 'Colorful tropical fish swimming in coral reef',
    },
    {
      type: 'video' as const,
      startTime: '00:15',
      endTime: '00:45',
      description: 'School of fish swimming together in ocean',
    },
    {
      type: 'image' as const,
      startTime: '00:45',
      endTime: '01:15',
      description: 'Deep sea anglerfish in dark waters',
    },
  ];
  
  return (
    <div className="p-6 bg-background">
      <MediaRecommendations items={mockMedia} />
    </div>
  );
}
