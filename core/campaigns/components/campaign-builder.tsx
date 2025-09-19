"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Mail,
  MessageSquare,
  Users,
  Clock,
  Settings,
  Send,
  Save,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import type { CampaignData, CampaignType } from "../dal/campaigns-types";

// Import step components
import { CampaignBasicInfo } from "./steps/basic-info";
import { CampaignContent } from "./steps/campaign-content";
import { AudienceSelector } from "./steps/audience-selector";
import { ScheduleSettings } from "./steps/schedule-settings";
import { CampaignSettings } from "./steps/campaign-settings";
import { ReviewAndSend } from "./steps/review-send";

interface CampaignBuilderProps {
  initialData?: Partial<CampaignData>;
  onSave?: (data: CampaignData) => Promise<void>;
  onSend?: (data: CampaignData) => Promise<void>;
  onCancel?: () => void;
}

const CAMPAIGN_STEPS = [
  { id: "basic", label: "Basic Info", icon: Mail },
  { id: "content", label: "Content", icon: MessageSquare },
  { id: "audience", label: "Audience", icon: Users },
  { id: "schedule", label: "Schedule", icon: Clock },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "review", label: "Review & Send", icon: Send },
];

export function CampaignBuilder({
  initialData,
  onSave,
  onSend,
  onCancel,
}: CampaignBuilderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [campaignData, setCampaignData] = useState<Partial<CampaignData>>({
    type: "email",
    audience: { type: "all" },
    schedule: { type: "immediate" },
    settings: {
      track_opens: true,
      track_clicks: true,
      unsubscribe_link: true,
    },
    ...initialData,
  });
  const [isValidating, setIsValidating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const progress = ((currentStep + 1) / CAMPAIGN_STEPS.length) * 100;

  const handleNext = async () => {
    // Validate current step
    setIsValidating(true);
    const isValid = await validateStep(currentStep);
    setIsValidating(false);

    if (isValid && currentStep < CAMPAIGN_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (index: number) => {
    // Allow navigation to completed steps
    if (index <= currentStep) {
      setCurrentStep(index);
    }
  };

  const validateStep = async (step: number): Promise<boolean> => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Basic Info
        if (!campaignData.name) {
          newErrors.name = "Campaign name is required";
        }
        if (!campaignData.type) {
          newErrors.type = "Campaign type is required";
        }
        break;
      case 1: // Content
        if (!campaignData.content) {
          newErrors.content = "Campaign content is required";
        }
        if (campaignData.type === "email" && !campaignData.subject) {
          newErrors.subject = "Email subject is required";
        }
        break;
      case 2: // Audience
        if (!campaignData.audience) {
          newErrors.audience = "Audience selection is required";
        }
        break;
      case 3: // Schedule
        if (!campaignData.schedule) {
          newErrors.schedule = "Schedule configuration is required";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = async () => {
    if (onSave) {
      await onSave(campaignData as CampaignData);
    }
  };

  const handleSendCampaign = async () => {
    // Validate all steps
    for (let i = 0; i < CAMPAIGN_STEPS.length - 1; i++) {
      const isValid = await validateStep(i);
      if (!isValid) {
        setCurrentStep(i);
        return;
      }
    }

    if (onSend) {
      await onSend(campaignData as CampaignData);
    }
  };

  const updateCampaignData = (updates: Partial<CampaignData>) => {
    setCampaignData({ ...campaignData, ...updates });
  };

  const currentStepData = CAMPAIGN_STEPS[currentStep];

  return (
    <div className="container max-w-7xl mx-auto py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Campaign Builder</h1>
            <p className="text-muted-foreground mt-1">
              Create and send targeted marketing campaigns
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between">
            {CAMPAIGN_STEPS.map((step, index) => (
              <button
                key={step.id}
                onClick={() => handleStepClick(index)}
                disabled={index > currentStep}
                className={`flex flex-col items-center gap-1 px-2 py-1 rounded transition-colors ${
                  index === currentStep
                    ? "text-primary"
                    : index < currentStep
                    ? "text-foreground cursor-pointer hover:text-primary"
                    : "text-muted-foreground cursor-not-allowed"
                }`}
              >
                <step.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{step.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{currentStepData.label}</CardTitle>
              <CardDescription>
                Step {currentStep + 1} of {CAMPAIGN_STEPS.length}
              </CardDescription>
            </div>
            {campaignData.type && (
              <Badge variant="outline" className="text-base">
                {campaignData.type === "email" ? "Email Campaign" : "SMS Campaign"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Step Content */}
          <div className="min-h-[400px]">
            {currentStep === 0 && (
              <CampaignBasicInfo
                data={campaignData}
                errors={errors}
                onChange={updateCampaignData}
              />
            )}
            {currentStep === 1 && (
              <CampaignContent
                data={campaignData}
                errors={errors}
                onChange={updateCampaignData}
              />
            )}
            {currentStep === 2 && (
              <AudienceSelector
                data={campaignData}
                errors={errors}
                onChange={updateCampaignData}
              />
            )}
            {currentStep === 3 && (
              <ScheduleSettings
                data={campaignData}
                errors={errors}
                onChange={updateCampaignData}
              />
            )}
            {currentStep === 4 && (
              <CampaignSettings
                data={campaignData}
                errors={errors}
                onChange={updateCampaignData}
              />
            )}
            {currentStep === 5 && (
              <ReviewAndSend
                data={campaignData}
                onSend={handleSendCampaign}
              />
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              {currentStep < CAMPAIGN_STEPS.length - 1 ? (
                <Button onClick={handleNext} disabled={isValidating}>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSendCampaign} className="min-w-[120px]">
                  <Send className="mr-2 h-4 w-4" />
                  Send Campaign
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}