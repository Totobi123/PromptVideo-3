import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface Step {
  id: string;
  label: string;
}

interface ProgressStepsProps {
  currentStep: number;
  steps: Step[];
}

export function ProgressSteps({ currentStep, steps }: ProgressStepsProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-2 flex-1">
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                    isCompleted
                      ? "bg-primary text-primary-foreground"
                      : isCurrent
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : "bg-muted text-muted-foreground border-2 border-border"
                  }`}
                  data-testid={`step-${step.id}`}
                  initial={false}
                  animate={{
                    opacity: isCurrent ? [1, 0.8, 1] : 1,
                  }}
                  transition={{
                    duration: 0.6,
                    ease: "easeInOut",
                  }}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Check className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    stepNumber
                  )}
                </motion.div>
                <span
                  className={`text-xs font-medium text-center ${
                    isCurrent ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <motion.div
                  className={`h-0.5 flex-1 mx-2 mt-[-28px]`}
                  initial={false}
                  animate={{
                    backgroundColor: stepNumber < currentStep ? "hsl(var(--primary))" : "hsl(var(--border))",
                    opacity: stepNumber < currentStep ? 1 : 0.5,
                  }}
                  transition={{
                    duration: 0.4,
                    ease: "easeInOut",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
