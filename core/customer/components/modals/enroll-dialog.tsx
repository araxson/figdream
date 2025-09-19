/**
 * Enroll Customer Dialog Component
 * Modal for enrolling customers in loyalty program
 */

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useEnrollCustomer } from "../hooks";

interface EnrollCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programId: string;
}

export function EnrollCustomerDialog({
  open,
  onOpenChange,
  programId,
}: EnrollCustomerDialogProps) {
  const [customerId, setCustomerId] = useState("");
  const enrollMutation = useEnrollCustomer();

  const handleEnroll = async () => {
    if (!customerId.trim()) return;

    try {
      await enrollMutation.mutateAsync({
        program_id: programId,
        customer_id: customerId,
        points_balance: 0,
        lifetime_points: 0,
        visits_count: 0,
        enrolled_at: new Date().toISOString(),
        metadata: {},
      });
      onOpenChange(false);
      setCustomerId("");
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enroll Customer</DialogTitle>
          <DialogDescription>
            Add a customer to the loyalty program
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="customer-id">Customer ID or Email</Label>
            <Input
              id="customer-id"
              placeholder="Enter customer ID or email"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              disabled={enrollMutation.isPending}
            />
          </div>

          {enrollMutation.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {enrollMutation.error?.message || "Failed to enroll customer"}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={enrollMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEnroll}
            disabled={!customerId.trim() || enrollMutation.isPending}
          >
            {enrollMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Enroll Customer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}