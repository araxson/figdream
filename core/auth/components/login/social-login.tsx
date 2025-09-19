"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Chrome, Facebook, Github } from "lucide-react";

interface SocialLoginProps {
  onGoogleLogin?: () => void;
  onFacebookLogin?: () => void;
  onGithubLogin?: () => void;
  loading?: boolean;
}

export function SocialLogin({
  onGoogleLogin,
  onFacebookLogin,
  onGithubLogin,
  loading = false,
}: SocialLoginProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid gap-2">
        {onGoogleLogin && (
          <Button
            variant="outline"
            onClick={onGoogleLogin}
            disabled={loading}
            className="w-full"
          >
            <Chrome className="mr-2 h-4 w-4" />
            Google
          </Button>
        )}

        {onFacebookLogin && (
          <Button
            variant="outline"
            onClick={onFacebookLogin}
            disabled={loading}
            className="w-full"
          >
            <Facebook className="mr-2 h-4 w-4" />
            Facebook
          </Button>
        )}

        {onGithubLogin && (
          <Button
            variant="outline"
            onClick={onGithubLogin}
            disabled={loading}
            className="w-full"
          >
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </Button>
        )}
      </div>
    </div>
  );
}
