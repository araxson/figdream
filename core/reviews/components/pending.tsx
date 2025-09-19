"use client";

import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface PendingReviewsProps {
  count?: number;
  onViewAll?: () => void;
}

export function PendingReviews({ count = 0, onViewAll }: PendingReviewsProps) {
  if (count === 0) return null;

  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Pending Reviews</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>
          You have {count} review{count !== 1 ? "s" : ""} awaiting response
        </span>
        <Button size="sm" variant="outline" onClick={onViewAll}>
          View All
        </Button>
      </AlertDescription>
    </Alert>
  );
}
