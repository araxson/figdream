"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { AuditLogFilters } from "../types";

interface AuditLogsFiltersProps {
  filters: AuditLogFilters;
  onFiltersChange: (filters: AuditLogFilters) => void;
  onReset?: () => void;
}

export function AuditLogsFilters({
  filters,
  onFiltersChange,
}: AuditLogsFiltersProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Label>Event Type</Label>
            <Select
              value={filters.eventType || "all"}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  eventType: value === "all" ? undefined : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="auth">Authentication</SelectItem>
                <SelectItem value="data">Data Changes</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Label>Date Range</Label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={filters.startDate || ""}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    startDate: e.target.value || undefined,
                  })
                }
              />
              <Input
                type="date"
                value={filters.endDate || ""}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    endDate: e.target.value || undefined,
                  })
                }
              />
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() =>
              onFiltersChange({ salonId: filters.salonId, limit: 100 })
            }
          >
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
