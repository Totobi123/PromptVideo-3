import { ScriptTimeline } from '../ScriptTimeline';

export default function ScriptTimelineExample() {
  const mockSegments = [
    {
      startTime: '00:00',
      endTime: '00:15',
      text: 'Welcome to our amazing journey through the world of marine life. Today, we explore the fascinating world of fish.',
    },
    {
      startTime: '00:15',
      endTime: '00:45',
      text: 'Fish are vertebrate animals that live in water. They breathe using gills and are found in nearly all aquatic environments.',
    },
    {
      startTime: '00:45',
      endTime: '01:15',
      text: 'From colorful tropical fish to mysterious deep-sea creatures, the diversity of fish species is truly remarkable.',
    },
  ];
  
  return (
    <div className="p-6 bg-background">
      <ScriptTimeline segments={mockSegments} />
    </div>
  );
}
