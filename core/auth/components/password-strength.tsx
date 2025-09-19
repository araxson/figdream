"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Check, X } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
  showRequirements?: boolean;
}

interface Requirement {
  regex: RegExp;
  text: string;
}

export function PasswordStrength({
  password,
  showRequirements = true,
}: PasswordStrengthProps) {
  const [strength, setStrength] = useState(0);
  const [requirements, setRequirements] = useState<Record<string, boolean>>({});

  const requirementsList: Record<string, Requirement> = {
    length: { regex: /.{8,}/, text: "At least 8 characters" },
    uppercase: { regex: /[A-Z]/, text: "One uppercase letter" },
    lowercase: { regex: /[a-z]/, text: "One lowercase letter" },
    number: { regex: /[0-9]/, text: "One number" },
    special: { regex: /[^A-Za-z0-9]/, text: "One special character" },
  };

  useEffect(() => {
    const newRequirements: Record<string, boolean> = {};
    let score = 0;

    Object.entries(requirementsList).forEach(([key, requirement]) => {
      const isValid = requirement.regex.test(password);
      newRequirements[key] = isValid;
      if (isValid) score += 20;
    });

    setRequirements(newRequirements);
    setStrength(score);
  }, [password]);

  const getStrengthLabel = () => {
    if (strength === 0) return "";
    if (strength <= 20) return "Very Weak";
    if (strength <= 40) return "Weak";
    if (strength <= 60) return "Fair";
    if (strength <= 80) return "Good";
    return "Strong";
  };

  if (!password) return null;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Password strength</span>
          <span
            className={`font-medium ${
              strength > 60 ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {getStrengthLabel()}
          </span>
        </div>
        <Progress value={strength} className="h-2" />
      </div>

      {showRequirements && (
        <div className="space-y-1">
          {Object.entries(requirementsList).map(([key, requirement]) => (
            <div key={key} className="flex items-center gap-2 text-xs">
              {requirements[key] ? (
                <Check className="h-3 w-3 text-primary" />
              ) : (
                <X className="h-3 w-3 text-muted-foreground" />
              )}
              <span
                className={
                  requirements[key] ? "text-primary" : "text-muted-foreground"
                }
              >
                {requirement.text}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
