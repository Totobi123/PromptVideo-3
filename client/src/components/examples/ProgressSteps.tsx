import { ProgressSteps } from '../ProgressSteps';

export default function ProgressStepsExample() {
  const steps = [
    { id: 'prompt', label: 'Prompt' },
    { id: 'details', label: 'Details' },
    { id: 'generate', label: 'Generate' },
    { id: 'review', label: 'Review' },
  ];
  
  return (
    <div className="p-6 bg-background">
      <ProgressSteps currentStep={2} steps={steps} />
    </div>
  );
}
