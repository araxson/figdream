"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { resetPassword } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Shield,
  X,
} from "lucide-react";

// Password strength calculator (same as in register)
function calculatePasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { score: 25, label: "Weak", color: "bg-red-500" };
  if (score <= 4) return { score: 50, label: "Fair", color: "bg-yellow-500" };
  if (score <= 5) return { score: 75, label: "Good", color: "bg-blue-500" };
  return { score: 100, label: "Strong", color: "bg-green-500" };
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const passwordStrength = calculatePasswordStrength(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  // Password requirements
  const requirements = [
    { met: password.length >= 8, text: "At least 8 characters" },
    { met: /[A-Z]/.test(password), text: "One uppercase letter" },
    { met: /[a-z]/.test(password), text: "One lowercase letter" },
    { met: /[0-9]/.test(password), text: "One number" },
  ];

  const allRequirementsMet = requirements.every(req => req.met);

  async function handleSubmit(formData: FormData) {
    setError("");
    setIsSuccess(false);

    // Client-side validation
    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    if (!allRequirementsMet) {
      setError("Please meet all password requirements.");
      return;
    }

    startTransition(async () => {
      const result = await resetPassword(formData);

      if (result.success) {
        setIsSuccess(true);
        toast.success("Password reset successful!", {
          description: "Your password has been updated. Redirecting to login...",
          icon: <CheckCircle2 className="h-4 w-4" />,
        });

        // Redirect to login after success
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(result.error || "Unable to reset password. Please try again.");
        toast.error("Reset failed", {
          description: result.error,
        });
      }
    });
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-center">
          Set new password
        </CardTitle>
        <CardDescription className="text-muted-foreground text-center">
          Your new password must be different from previously used passwords
        </CardDescription>
      </CardHeader>

      <form action={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="animate-in fade-in-0 slide-in-from-top-1">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {isSuccess && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950 animate-in fade-in-0 slide-in-from-top-1">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Password reset successful! Redirecting to login...
              </AlertDescription>
            </Alert>
          )}

          {/* New Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="pl-9 pr-9"
                required
                disabled={isPending || isSuccess}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
                disabled={isPending || isSuccess}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="space-y-2 animate-in fade-in-0 slide-in-from-top-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Password strength:</span>
                  <span className={`font-medium ${
                    passwordStrength.label === "Weak" ? "text-red-500" :
                    passwordStrength.label === "Fair" ? "text-yellow-500" :
                    passwordStrength.label === "Good" ? "text-blue-500" :
                    "text-green-500"
                  }`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <Progress value={passwordStrength.score} className="h-1" />

                {/* Password Requirements */}
                <div className="grid grid-cols-2 gap-1 mt-2">
                  {requirements.map((req, index) => (
                    <div key={index} className="flex items-center space-x-1 text-xs">
                      {req.met ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <X className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span className={req.met ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                className="pl-9 pr-9"
                required
                disabled={isPending || isSuccess}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
                disabled={isPending || isSuccess}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="text-xs text-red-500 animate-in fade-in-0">
                Passwords do not match
              </p>
            )}
            {confirmPassword && passwordsMatch && (
              <p className="text-xs text-green-500 animate-in fade-in-0 flex items-center">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Passwords match
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isPending || isSuccess || !passwordsMatch || !allRequirementsMet}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting password...
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Password reset!
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Reset password
              </>
            )}
          </Button>

          {/* Additional Security Tips */}
          <div className="rounded-lg border bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground mb-2 font-medium">
              Security tips:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Use a unique password for each account</li>
              <li>• Consider using a password manager</li>
              <li>• Enable two-factor authentication when available</li>
            </ul>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}