"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, AlertCircle, Info, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

// Form error summary component
interface FormErrorSummaryProps {
  errors: Record<string, string | string[]>;
  title?: string;
}

export function FormErrorSummary({
  errors,
  title = "Please fix the following errors:",
}: FormErrorSummaryProps) {
  const errorList = Object.entries(errors).flatMap(([field, messages]) => {
    if (Array.isArray(messages)) {
      return messages.map((msg) => ({ field, message: msg }));
    }
    return [{ field, message: messages }];
  });

  if (errorList.length === 0) return null;

  return (
    <Alert variant="destructive">
      <XCircle className="h-4 w-4" />
      <AlertDescription>
        <p className="font-medium mb-2">{title}</p>
        <ul className="list-disc list-inside space-y-1">
          {errorList.map((error, index) => (
            <li key={index} className="text-sm">
              <span className="font-medium capitalize">
                {error.field.replace(/_/g, " ")}:
              </span>{" "}
              {error.message}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}

// Success message component
interface SuccessMessageProps {
  title?: string;
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function SuccessMessage({
  title = "Success!",
  message,
  onClose,
  autoClose = true,
  duration = 5000,
}: SuccessMessageProps) {
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  return (
    <Alert className="border-primary/20 bg-primary/5">
      <CheckCircle className="h-4 w-4 text-primary" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

// Form validation indicator
interface ValidationIndicatorProps {
  field: string;
  isValid?: boolean;
  isTouched?: boolean;
  message?: string;
}

export function ValidationIndicator({
  field,
  isValid,
  isTouched,
  message,
}: ValidationIndicatorProps) {
  if (!isTouched) return null;

  return (
    <div className="flex items-center gap-2 mt-1">
      {isValid ? (
        <>
          <CheckCircle className="h-3 w-3 text-primary" />
          <span className="text-xs text-primary">Valid</span>
        </>
      ) : (
        <>
          <XCircle className="h-3 w-3 text-destructive" />
          <span className="text-xs text-destructive">
            {message || `Invalid ${field}`}
          </span>
        </>
      )}
    </div>
  );
}

// Form progress indicator
interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

export function FormProgress({
  currentStep,
  totalSteps,
  stepLabels,
}: FormProgressProps) {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </span>
        {stepLabels && stepLabels[currentStep - 1] && (
          <span className="font-medium">{stepLabels[currentStep - 1]}</span>
        )}
      </div>
      <Progress value={progress} className="h-2" />
      {stepLabels && (
        <div className="flex justify-between">
          {stepLabels.map((label, index) => (
            <Badge
              key={index}
              variant={
                index + 1 < currentStep
                  ? "default"
                  : index + 1 === currentStep
                    ? "secondary"
                    : "outline"
              }
              className="text-xs"
            >
              {index + 1}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// Field helper text component
interface FieldHelperTextProps {
  text: string;
  type?: "info" | "warning" | "error";
}

export function FieldHelperText({ text, type = "info" }: FieldHelperTextProps) {
  const config = {
    info: { icon: Info, className: "text-muted-foreground" },
    warning: { icon: AlertCircle, className: "text-muted-foreground" },
    error: { icon: XCircle, className: "text-destructive" },
  };

  const { icon: Icon, className } = config[type];

  return (
    <div className={`flex items-center gap-1 mt-1 ${className}`}>
      <Icon className="h-3 w-3" />
      <span className="text-xs">{text}</span>
    </div>
  );
}

// Character counter for text inputs
interface CharacterCounterProps {
  current: number;
  max: number;
  showRemaining?: boolean;
}

export function CharacterCounter({
  current,
  max,
  showRemaining = true,
}: CharacterCounterProps) {
  const remaining = max - current;
  const percentage = (current / max) * 100;
  const isNearLimit = percentage > 80;
  const isOverLimit = current > max;

  return (
    <div
      className={`text-xs mt-1 ${
        isOverLimit
          ? "text-destructive"
          : isNearLimit
            ? "text-muted-foreground"
            : "text-muted-foreground"
      }`}
    >
      {showRemaining ? (
        <span>
          {remaining >= 0
            ? `${remaining} characters remaining`
            : `${Math.abs(remaining)} characters over limit`}
        </span>
      ) : (
        <span>
          {current} / {max}
        </span>
      )}
    </div>
  );
}

// Saving indicator
interface SavingIndicatorProps {
  isSaving: boolean;
  lastSaved?: Date;
}

export function SavingIndicator({ isSaving, lastSaved }: SavingIndicatorProps) {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (!isSaving && lastSaved) {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSaving, lastSaved]);

  if (isSaving) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Saving...</span>
      </div>
    );
  }

  if (showSaved && lastSaved) {
    return (
      <div className="flex items-center gap-2 text-sm text-primary">
        <CheckCircle className="h-3 w-3" />
        <span>Saved</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className="text-xs text-muted-foreground">
        Last saved:{" "}
        {new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "numeric",
        }).format(lastSaved)}
      </div>
    );
  }

  return null;
}
