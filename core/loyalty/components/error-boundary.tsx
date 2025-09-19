/**
 * Loyalty Error Boundary Component
 * Graceful error handling for loyalty program
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";

interface LoyaltyErrorBoundaryProps {
  error: Error;
  retry?: () => void;
}

export function LoyaltyErrorBoundary({ error, retry }: LoyaltyErrorBoundaryProps) {
  return (
    <Card className="p-6">
      <CardContent className="flex flex-col items-center justify-center text-center">
        <div className="rounded-full bg-destructive/10 p-4 mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <CardTitle className="mb-2">Something went wrong</CardTitle>
        <CardDescription className="mb-6 max-w-md">
          We encountered an error while loading the loyalty program. Please try again or contact support if the problem persists.
        </CardDescription>

        <Alert variant="destructive" className="mb-6 max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Details</AlertTitle>
          <AlertDescription className="mt-2 text-sm">
            {error.message || "An unexpected error occurred"}
          </AlertDescription>
        </Alert>

        {retry && (
          <Button onClick={retry} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}