"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Step {
  id: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  isComplete?: boolean;
  isCurrent?: boolean;
  isDisabled?: boolean;
}

interface BookingStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  orientation?: "horizontal" | "vertical";
  showStepNumbers?: boolean;
  allowStepClick?: boolean;
}

export function BookingStepper({
  steps,
  currentStep,
  onStepClick,
  orientation = "horizontal",
  showStepNumbers = true,
  allowStepClick = false,
}: BookingStepperProps) {
  const isStepClickable = (index: number) => {
    if (!allowStepClick || !onStepClick) return false;
    // Can click on completed steps or the current step
    return index < currentStep || index === currentStep;
  };

  if (orientation === "vertical") {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {steps.map((step, index) => {
              const isComplete = index < currentStep;
              const isCurrent = index === currentStep;
              const isClickable = isStepClickable(index);

              return (
                <div key={step.id}>
                  <button
                    className={`w-full text-left ${
                      isClickable
                        ? "cursor-pointer hover:bg-accent rounded-lg p-2 -m-2"
                        : ""
                    }`}
                    onClick={() => isClickable && onStepClick?.(index)}
                    disabled={!isClickable}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                          isComplete
                            ? "border-primary bg-primary text-primary-foreground"
                            : isCurrent
                              ? "border-primary text-primary"
                              : "border-muted-foreground/30 text-muted-foreground"
                        }`}
                      >
                        {isComplete ? (
                          <Check className="h-4 w-4" />
                        ) : showStepNumbers ? (
                          <span className="text-sm font-medium">
                            {index + 1}
                          </span>
                        ) : step.icon ? (
                          <step.icon className="h-4 w-4" />
                        ) : (
                          <span className="text-sm font-medium">
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p
                          className={`font-medium ${
                            isCurrent
                              ? "text-foreground"
                              : isComplete
                                ? "text-foreground"
                                : "text-muted-foreground"
                          }`}
                        >
                          {step.title}
                        </p>
                        {step.description && (
                          <p className="text-sm text-muted-foreground">
                            {step.description}
                          </p>
                        )}
                      </div>
                      {isCurrent && (
                        <Badge variant="secondary" className="ml-2">
                          Current
                        </Badge>
                      )}
                    </div>
                  </button>
                  {index < steps.length - 1 && (
                    <div className="ml-4 mt-4 mb-4 border-l-2 border-muted h-8" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Horizontal stepper
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = isStepClickable(index);

          return (
            <div key={step.id} className="flex items-center flex-1">
              <button
                className={`flex items-center gap-2 ${
                  isClickable
                    ? "cursor-pointer hover:scale-105 transition-transform"
                    : ""
                }`}
                onClick={() => isClickable && onStepClick?.(index)}
                disabled={!isClickable}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                    isComplete
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCurrent
                        ? "border-primary text-primary bg-background"
                        : "border-muted-foreground/30 text-muted-foreground bg-background"
                  }`}
                >
                  {isComplete ? (
                    <Check className="h-5 w-5" />
                  ) : showStepNumbers ? (
                    <span className="font-medium">{index + 1}</span>
                  ) : step.icon ? (
                    <step.icon className="h-5 w-5" />
                  ) : (
                    <span className="font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="hidden sm:block">
                  <p
                    className={`text-sm font-medium ${
                      isCurrent || isComplete
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
              </button>
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2">
                  <Separator
                    className={`h-0.5 ${
                      isComplete ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: Show current step title */}
      <div className="sm:hidden mt-4 text-center">
        <p className="font-medium">{steps[currentStep]?.title}</p>
        {steps[currentStep]?.description && (
          <p className="text-sm text-muted-foreground mt-1">
            {steps[currentStep].description}
          </p>
        )}
      </div>
    </div>
  );
}

// Booking progress bar component
interface BookingProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

export function BookingProgress({
  currentStep,
  totalSteps,
  stepLabels,
}: BookingProgressProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Step {currentStep + 1} of {totalSteps}
        </span>
        {stepLabels && stepLabels[currentStep] && (
          <span className="font-medium">{stepLabels[currentStep]}</span>
        )}
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full bg-primary transition-all duration-300 ease-out ${
            progress === 0
              ? "w-0"
              : progress <= 25
                ? "w-1/4"
                : progress <= 33
                  ? "w-1/3"
                  : progress <= 50
                    ? "w-1/2"
                    : progress <= 66
                      ? "w-2/3"
                      : progress <= 75
                        ? "w-3/4"
                        : progress < 100
                          ? "w-11/12"
                          : "w-full"
          }`}
        />
      </div>
    </div>
  );
}
