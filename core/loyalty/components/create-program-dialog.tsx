/**
 * Create Program Dialog Component
 * Modal for creating a new loyalty program
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useCreateLoyaltyProgram } from "../hooks";

interface CreateProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salonId: string;
}

export function CreateProgramDialog({
  open,
  onOpenChange,
  salonId,
}: CreateProgramDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    points_per_dollar: 1,
    points_per_visit: 10,
    redemption_rate: 0.01,
  });

  const createMutation = useCreateLoyaltyProgram();

  const handleCreate = async () => {
    if (!formData.name.trim()) return;

    try {
      await createMutation.mutateAsync({
        salon_id: salonId,
        name: formData.name,
        description: formData.description || undefined,
        type: "points",
        points_per_dollar: formData.points_per_dollar,
        points_per_visit: formData.points_per_visit,
        redemption_rate: formData.redemption_rate,
        benefits: [],
        is_active: true,
      });
      onOpenChange(false);
      // Reset form
      setFormData({
        name: "",
        description: "",
        points_per_dollar: 1,
        points_per_visit: 10,
        redemption_rate: 0.01,
      });
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Loyalty Program</DialogTitle>
          <DialogDescription>
            Set up a loyalty program to reward your customers
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="program-name">Program Name</Label>
            <Input
              id="program-name"
              placeholder="e.g., VIP Rewards Program"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={createMutation.isPending}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="program-description">Description (Optional)</Label>
            <Textarea
              id="program-description"
              placeholder="Describe your loyalty program..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              disabled={createMutation.isPending}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="points-dollar">Points per Dollar</Label>
            <Input
              id="points-dollar"
              type="number"
              min="0"
              step="0.1"
              value={formData.points_per_dollar}
              onChange={(e) =>
                setFormData({ ...formData, points_per_dollar: parseFloat(e.target.value) || 0 })
              }
              disabled={createMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              How many points customers earn per dollar spent
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="points-visit">Points per Visit</Label>
            <Input
              id="points-visit"
              type="number"
              min="0"
              value={formData.points_per_visit}
              onChange={(e) =>
                setFormData({ ...formData, points_per_visit: parseInt(e.target.value) || 0 })
              }
              disabled={createMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Bonus points earned for each visit
            </p>
          </div>

          {createMutation.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {createMutation.error?.message || "Failed to create loyalty program"}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!formData.name.trim() || createMutation.isPending}
          >
            {createMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Program
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}