import { ExportButtons } from '../ExportButtons';

export default function ExportButtonsExample() {
  const handleExport = (type: string) => {
    console.log(`Exporting ${type}...`);
  };
  
  return (
    <div className="p-6 bg-background">
      <ExportButtons
        onExportScript={() => handleExport('script')}
        onExportAudio={() => handleExport('audio')}
        onExportMedia={() => handleExport('media')}
      />
    </div>
  );
}
