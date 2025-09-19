/**
 * Adjust Points Dialog Component
 * Modal for manually adjusting customer loyalty points
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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus, Minus } from "lucide-react";
import { useAdjustPoints } from "../hooks";

interface AdjustPointsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loyaltyId: string;
  customerName: string;
  currentBalance: number;
}

export function AdjustPointsDialog({
  open,
  onOpenChange,
  loyaltyId,
  customerName,
  currentBalance,
}: AdjustPointsDialogProps) {
  const [adjustmentType, setAdjustmentType] = useState<"add" | "remove">("add");
  const [points, setPoints] = useState("");
  const [description, setDescription] = useState("");
  const adjustMutation = useAdjustPoints();

  const handleAdjust = async () => {
    const pointsValue = parseInt(points);
    if (isNaN(pointsValue) || pointsValue <= 0) return;
    if (!description.trim()) return;

    const adjustedPoints = adjustmentType === "add" ? pointsValue : -pointsValue;

    try {
      await adjustMutation.mutateAsync({
        customerLoyaltyId: loyaltyId,
        points: adjustedPoints,
        description: description.trim(),
      });
      onOpenChange(false);
      setPoints("");
      setDescription("");
      setAdjustmentType("add");
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const newBalance = currentBalance +
    (adjustmentType === "add" ? parseInt(points) || 0 : -(parseInt(points) || 0));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Points</DialogTitle>
          <DialogDescription>
            Manually adjust loyalty points for {customerName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Current Balance</Label>
            <p className="text-2xl font-bold">{currentBalance.toLocaleString()} points</p>
          </div>

          <div className="grid gap-2">
            <Label>Adjustment Type</Label>
            <RadioGroup value={adjustmentType} onValueChange={(v) => setAdjustmentType(v as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="add" id="add" />
                <Label htmlFor="add" className="flex items-center cursor-pointer">
                  <Plus className="mr-1 h-4 w-4" />
                  Add Points
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="remove" id="remove" />
                <Label htmlFor="remove" className="flex items-center cursor-pointer">
                  <Minus className="mr-1 h-4 w-4" />
                  Remove Points
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="points">Points Amount</Label>
            <Input
              id="points"
              type="number"
              placeholder="Enter points amount"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              min="1"
              disabled={adjustMutation.isPending}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Reason for Adjustment</Label>
            <Textarea
              id="description"
              placeholder="e.g., Customer service compensation, Birthday bonus, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={adjustMutation.isPending}
            />
          </div>

          {points && !isNaN(parseInt(points)) && (
            <Alert>
              <AlertDescription>
                New balance will be: <strong>{newBalance.toLocaleString()} points</strong>
              </AlertDescription>
            </Alert>
          )}

          {adjustMutation.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {adjustMutation.error?.message || "Failed to adjust points"}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={adjustMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdjust}
            disabled={
              !points ||
              !description.trim() ||
              isNaN(parseInt(points)) ||
              parseInt(points) <= 0 ||
              adjustMutation.isPending
            }
          >
            {adjustMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {adjustmentType === "add" ? "Add" : "Remove"} Points
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}