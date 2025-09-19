/**
 * Loyalty Empty State Component
 * Shown when no loyalty program exists
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Plus } from "lucide-react";
import { CreateProgramDialog } from "./create-program-dialog";

interface LoyaltyEmptyStateProps {
  salonId: string;
}

export function LoyaltyEmptyState({ salonId }: LoyaltyEmptyStateProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <>
      <Card className="p-12">
        <CardContent className="flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="mb-2">No Loyalty Program Yet</CardTitle>
          <CardDescription className="mb-6 max-w-sm">
            Create a loyalty program to reward your customers and increase retention
          </CardDescription>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Loyalty Program
          </Button>
        </CardContent>
      </Card>

      <CreateProgramDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        salonId={salonId}
      />
    </>
  );
}