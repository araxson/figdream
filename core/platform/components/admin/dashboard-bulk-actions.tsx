"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Ban, CheckCircle, Trash2 } from "lucide-react";

interface UsersDashboardBulkActionsProps {
  selectedCount: number;
  onBulkAction: (action: string) => void;
  isLoading: boolean;
}

export function UsersDashboardBulkActions({
  selectedCount,
  onBulkAction,
  isLoading
}: UsersDashboardBulkActionsProps) {
  return (
    <Card className="bg-muted/50">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {selectedCount} user(s) selected
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onBulkAction("activate")}
              disabled={isLoading}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Activate
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onBulkAction("deactivate")}
              disabled={isLoading}
            >
              <Ban className="h-4 w-4 mr-2" />
              Deactivate
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onBulkAction("reset_password")}
              disabled={isLoading}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Reset Passwords
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onBulkAction("suspend")}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Suspend
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}