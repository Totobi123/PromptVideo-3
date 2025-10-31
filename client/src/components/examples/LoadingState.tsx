import { LoadingState } from '../LoadingState';

export default function LoadingStateExample() {
  return (
    <div className="p-6 bg-background">
      <LoadingState message="Generating your video script..." progress={65} />
    </div>
  );
}
