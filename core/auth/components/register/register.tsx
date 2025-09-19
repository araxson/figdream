"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  CheckCircle2,
  Check,
  X,
} from "lucide-react";

// Password strength calculator
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

export function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
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

  async function handleSubmit(formData: FormData) {
    setError("");
    setIsSuccess(false);

    // Client-side validation
    if (!acceptTerms) {
      setError("You must accept the terms and conditions to continue.");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    formData.append("acceptTerms", acceptTerms.toString());

    startTransition(async () => {
      const result = await register(formData);

      if (result.success) {
        setIsSuccess(true);
        toast.success("Registration successful!", {
          description: "Please check your email to verify your account.",
          icon: <CheckCircle2 className="h-4 w-4" />,
        });

        // Redirect after showing success
        setTimeout(() => {
          router.push(result.redirectUrl || "/verify-email");
        }, 2000);
      } else {
        setError(result.error || "Registration failed. Please try again.");
        toast.error("Registration failed", {
          description: result.error,
        });
      }
    });
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Create an account
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter your details to get started with your account
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
                Registration successful! Check your email to verify your account.
              </AlertDescription>
            </Alert>
          )}

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="John"
                  className="pl-9"
                  required
                  disabled={isPending || isSuccess}
                  autoComplete="given-name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Doe"
                  className="pl-9"
                  required
                  disabled={isPending || isSuccess}
                  autoComplete="family-name"
                />
              </div>
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                className="pl-9"
                required
                disabled={isPending || isSuccess}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Phone Field (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                className="pl-9"
                disabled={isPending || isSuccess}
                autoComplete="tel"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
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
            <Label htmlFor="confirmPassword">Confirm password</Label>
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

          {/* Terms and Conditions */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="acceptTerms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
              disabled={isPending || isSuccess}
              className="mt-0.5"
            />
            <Label
              htmlFor="acceptTerms"
              className="text-sm font-normal cursor-pointer leading-relaxed"
            >
              I agree to the{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </Label>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isPending || isSuccess || !acceptTerms}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Account created!
              </>
            ) : (
              <>
                Create account
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          {/* Divider */}
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or sign up with
              </span>
            </div>
          </div>

          {/* Social Sign Up Buttons */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending || isSuccess}
              onClick={() => toast.info("Google sign up coming soon!")}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending || isSuccess}
              onClick={() => toast.info("Apple sign up coming soon!")}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                  fill="currentColor"
                />
              </svg>
              Apple
            </Button>
          </div>

          {/* Sign In Link */}
          <div className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}