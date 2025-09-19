"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CheckCircle,
  Circle,
  User,
  Mail,
  Shield,
  Building,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { OnboardingStep, UserOnboardingProgress } from "../dal/users-types";

const onboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome",
    description: "Let's get started with your account setup",
    completed: false,
    required: true,
    order: 1,
    component: "WelcomeStep",
  },
  {
    id: "profile",
    title: "Personal Information",
    description: "Tell us about yourself",
    completed: false,
    required: true,
    order: 2,
    component: "ProfileStep",
  },
  {
    id: "verification",
    title: "Verify Account",
    description: "Confirm your email and phone",
    completed: false,
    required: true,
    order: 3,
    component: "VerificationStep",
  },
  {
    id: "role",
    title: "Select Role",
    description: "Choose your account type",
    completed: false,
    required: true,
    order: 4,
    component: "RoleStep",
  },
  {
    id: "salon",
    title: "Salon Association",
    description: "Connect with your salon",
    completed: false,
    required: false,
    order: 5,
    component: "SalonStep",
  },
  {
    id: "complete",
    title: "All Set!",
    description: "Your account is ready",
    completed: false,
    required: true,
    order: 6,
    component: "CompleteStep",
  },
];

interface UserOnboardingFlowProps {
  userId: string;
  initialStep?: number;
  onComplete?: () => void;
}

export function UserOnboardingFlow({
  userId,
  initialStep = 1,
  onComplete,
}: UserOnboardingFlowProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [progress, setProgress] = useState<UserOnboardingProgress>({
    user_id: userId,
    steps: onboardingSteps,
    current_step: initialStep,
    completed_steps: [],
    started_at: new Date().toISOString(),
  });

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    bio: "",
    role: "customer",
    salon_id: "",
    preferences: {
      notifications: true,
      marketing: false,
    },
  });

  const currentStepData = onboardingSteps[currentStep - 1];
  const progressPercentage = ((currentStep - 1) / (onboardingSteps.length - 1)) * 100;

  const handleNext = () => {
    if (currentStep < onboardingSteps.length) {
      // Mark current step as completed
      setProgress(prev => ({
        ...prev,
        completed_steps: [...prev.completed_steps, currentStepData.id],
      }));
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    if (!currentStepData.required) {
      handleNext();
    }
  };

  const handleComplete = async () => {
    try {
      // Save completion status
      setProgress(prev => ({
        ...prev,
        completed_at: new Date().toISOString(),
      }));

      toast.success("Onboarding completed successfully!");

      if (onComplete) {
        onComplete();
      } else {
        // Redirect based on role
        switch (formData.role) {
          case "owner":
          case "manager":
            router.push("/dashboard");
            break;
          case "staff":
            router.push("/staff");
            break;
          default:
            router.push("/customer");
        }
      }
    } catch (error) {
      toast.error("Failed to complete onboarding");
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle>Account Setup</CardTitle>
              <Badge variant="outline">
                Step {currentStep} of {onboardingSteps.length}
              </Badge>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between">
              {onboardingSteps.map((step, index) => (
                <div
                  key={step.id}
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                      progress.completed_steps.includes(step.id)
                        ? "border-primary bg-primary text-primary-foreground"
                        : index + 1 === currentStep
                        ? "border-primary text-primary"
                        : "border-muted text-muted-foreground"
                    }`}
                  >
                    {progress.completed_steps.includes(step.id) ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="text-sm">{index + 1}</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{currentStepData.title}</CardTitle>
          <CardDescription>{currentStepData.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Welcome Step */}
          {currentStep === 1 && (
            <div className="space-y-6 text-center py-8">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">Welcome to FigDream!</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  We're excited to have you on board. Let's set up your account
                  in just a few simple steps.
                </p>
              </div>
              <Alert className="max-w-md mx-auto">
                <AlertDescription>
                  This process will take approximately 3-5 minutes to complete.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Profile Step */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => updateFormData("first_name", e.target.value)}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => updateFormData("last_name", e.target.value)}
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">About You (Optional)</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => updateFormData("bio", e.target.value)}
                  placeholder="Tell us a bit about yourself..."
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Verification Step */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Email Verification</div>
                      <div className="text-sm text-muted-foreground">
                        user@example.com
                      </div>
                    </div>
                  </div>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Phone Verification</div>
                      <div className="text-sm text-muted-foreground">
                        {formData.phone || "Not provided"}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Send Code
                  </Button>
                </div>
              </div>
              <Alert>
                <AlertDescription>
                  Verification helps secure your account and enables important notifications.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Role Step */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <Label>Select Your Account Type</Label>
              <div className="grid gap-3">
                {[
                  { value: "customer", label: "Customer", description: "Book appointments and manage your profile" },
                  { value: "staff", label: "Staff Member", description: "Provide services and manage your schedule" },
                  { value: "owner", label: "Salon Owner", description: "Manage your salon and team" },
                ].map((role) => (
                  <div
                    key={role.value}
                    className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.role === role.value
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => updateFormData("role", role.value)}
                  >
                    <div className={`mt-1 h-4 w-4 rounded-full border-2 ${
                      formData.role === role.value
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    }`}>
                      {formData.role === role.value && (
                        <Check className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{role.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {role.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Salon Step */}
          {currentStep === 5 && (
            <div className="space-y-4">
              {formData.role !== "customer" ? (
                <>
                  <Label htmlFor="salon">Select or Create Salon</Label>
                  <Select
                    value={formData.salon_id}
                    onValueChange={(value) => updateFormData("salon_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a salon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Create New Salon</SelectItem>
                      <SelectItem value="salon1">Beauty Haven</SelectItem>
                      <SelectItem value="salon2">Style Studio</SelectItem>
                      <SelectItem value="salon3">Glamour Lounge</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.salon_id === "new" && (
                    <Alert>
                      <AlertDescription>
                        You'll be redirected to create your salon after completing onboarding.
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <Building className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div className="space-y-2">
                    <h3 className="font-semibold">Browse Salons</h3>
                    <p className="text-sm text-muted-foreground">
                      As a customer, you can browse and book services from any salon.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Complete Step */}
          {currentStep === 6 && (
            <div className="space-y-6 text-center py-8">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">You're All Set!</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Your account has been successfully set up. You can now start
                  using all the features available to you.
                </p>
              </div>
              <div className="flex justify-center gap-4 pt-4">
                <Button variant="outline" onClick={() => router.push("/help")}>
                  View Help Guide
                </Button>
                <Button onClick={handleComplete}>
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex gap-2">
            {!currentStepData.required && currentStep < onboardingSteps.length && (
              <Button variant="ghost" onClick={handleSkip}>
                Skip
              </Button>
            )}
            <Button onClick={handleNext}>
              {currentStep === onboardingSteps.length ? "Complete" : "Continue"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}