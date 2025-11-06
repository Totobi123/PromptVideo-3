import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CheckCircle2 } from "lucide-react";

interface OnboardingSurveyProps {
  open: boolean;
  onComplete: (data: OnboardingData) => void;
}

export interface OnboardingData {
  useCase: string;
  userType: string;
  companyName?: string;
  companySize?: string;
}

const USE_CASES = [
  "Social Media Content Creation",
  "Blogging",
  "Video Promotion",
  "Education",
  "Entertainment",
  "Marketing",
  "Personal Projects",
  "Other"
];

const USER_TYPES = [
  "Student",
  "Teacher",
  "Company",
  "Freelancer",
  "Content Creator",
  "Marketer",
  "Other"
];

const COMPANY_SIZES = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "500+ employees"
];

export function OnboardingSurvey({ open, onComplete }: OnboardingSurveyProps) {
  const [step, setStep] = useState(1);
  const [selectedUseCase, setSelectedUseCase] = useState("");
  const [selectedUserType, setSelectedUserType] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companySize, setCompanySize] = useState("");

  const handleFinish = () => {
    const data: OnboardingData = {
      useCase: selectedUseCase,
      userType: selectedUserType,
    };

    if (selectedUserType === "Company") {
      data.companyName = companyName;
      data.companySize = companySize;
    }

    onComplete(data);
  };

  const handleNext = () => {
    if (step === 1 && selectedUseCase) {
      setStep(2);
    } else if (step === 2 && selectedUserType) {
      if (selectedUserType === "Company") {
        setStep(3);
      } else {
        handleFinish();
      }
    }
  };

  const isStepValid = () => {
    if (step === 1) return selectedUseCase !== "";
    if (step === 2) return selectedUserType !== "";
    if (step === 3) return companyName !== "" && companySize !== "";
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-onboarding">
        <DialogHeader>
          <DialogTitle data-testid="text-onboarding-title">Welcome! Let's get to know you</DialogTitle>
          <DialogDescription data-testid="text-onboarding-description">
            Tell us a bit about yourself to personalize your experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {step === 1 && (
            <div className="space-y-4">
              <Label className="text-base font-medium" data-testid="label-use-case">
                What do you want to use this for?
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {USE_CASES.map((useCase) => (
                  <Button
                    key={useCase}
                    variant={selectedUseCase === useCase ? "default" : "outline"}
                    className="justify-start h-auto py-3 px-4"
                    onClick={() => setSelectedUseCase(useCase)}
                    data-testid={`button-use-case-${useCase.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div className="flex items-center gap-2 w-full">
                      {selectedUseCase === useCase && (
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                      )}
                      <span className="text-sm text-left flex-1">{useCase}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Label className="text-base font-medium" data-testid="label-user-type">
                Who are you?
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {USER_TYPES.map((userType) => (
                  <Button
                    key={userType}
                    variant={selectedUserType === userType ? "default" : "outline"}
                    className="justify-start h-auto py-3 px-4"
                    onClick={() => setSelectedUserType(userType)}
                    data-testid={`button-user-type-${userType.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div className="flex items-center gap-2 w-full">
                      {selectedUserType === userType && (
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                      )}
                      <span className="text-sm text-left flex-1">{userType}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Label className="text-base font-medium" data-testid="label-company-info">
                Tell us about your company
              </Label>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="companyName" className="text-sm">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter your company name"
                    className="mt-1"
                    data-testid="input-company-name"
                  />
                </div>
                <div>
                  <Label htmlFor="companySize" className="text-sm">Company Size</Label>
                  <div className="grid grid-cols-1 gap-2 mt-1">
                    {COMPANY_SIZES.map((size) => (
                      <Button
                        key={size}
                        variant={companySize === size ? "default" : "outline"}
                        className="justify-start h-auto py-2 px-3"
                        onClick={() => setCompanySize(size)}
                        data-testid={`button-company-size-${size.replace(/\s+/g, '-').replace(/\+/g, 'plus')}`}
                      >
                        <div className="flex items-center gap-2 w-full">
                          {companySize === size && (
                            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                          )}
                          <span className="text-sm text-left flex-1">{size}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex gap-1">
            {[1, 2, selectedUserType === "Company" ? 3 : 2].map((s, idx) => (
              <div
                key={idx}
                className={`h-2 w-8 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
                data-testid={`progress-step-${idx + 1}`}
              />
            ))}
          </div>
          <Button
            onClick={step === 3 || (step === 2 && selectedUserType !== "Company") ? handleFinish : handleNext}
            disabled={!isStepValid()}
            data-testid="button-next-finish"
          >
            {step === 3 || (step === 2 && selectedUserType !== "Company") ? "Finish" : "Next"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
