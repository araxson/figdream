"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { forgotPassword } from "../actions";
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
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Mail,
  Send,
} from "lucide-react";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState("");

  async function handleSubmit(formData: FormData) {
    setError("");
    setIsSuccess(false);

    startTransition(async () => {
      const result = await forgotPassword(formData);

      if (result.success) {
        setIsSuccess(true);
        toast.success("Reset link sent!", {
          description: "Please check your email for the password reset link.",
          icon: <CheckCircle2 className="h-4 w-4" />,
        });

        // Clear form after success
        setEmail("");
      } else {
        setError(result.error || "Unable to send reset email. Please try again.");
        toast.error("Request failed", {
          description: result.error,
        });
      }
    });
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Reset your password
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password
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
                If an account exists with this email, you will receive a password reset link shortly.
                Please check your inbox and spam folder.
              </AlertDescription>
            </Alert>
          )}

          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
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
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              We'll send a password reset link to this email address if an account exists.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isPending || isSuccess || !email}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending reset link...
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Reset link sent!
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send reset link
              </>
            )}
          </Button>

          {/* Back to Login Link */}
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => router.push("/login")}
            disabled={isPending}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Button>

          {/* Additional Help Text */}
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Didn't receive the email? Check your spam folder or{" "}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => {
                  setError("");
                  setIsSuccess(false);
                }}
                disabled={isPending}
              >
                try again
              </button>
            </p>
            <p className="text-xs text-muted-foreground">
              Need help?{" "}
              <Link href="/contact" className="text-primary hover:underline">
                Contact support
              </Link>
            </p>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}