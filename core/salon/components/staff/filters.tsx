"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Search, X } from "lucide-react";
import { StaffFiltersProps } from "../types";
import { Constants } from "@/types/database.types";

const staffStatuses = Constants.public.Enums.staff_status;

export function StaffFilters({ filters, onFiltersChange }: StaffFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (key: string, value: unknown) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleClearFilters = () => {
    setLocalFilters({});
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(localFilters).length > 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Name, title, employee ID..."
              value={localFilters.search || ""}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={(localFilters.status as string) || ""}
            onValueChange={(value) =>
              handleFilterChange("status", value || undefined)
            }
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              {staffStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() +
                    status.slice(1).replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filter */}
        <div className="space-y-2">
          <Label htmlFor="active">Active Only</Label>
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="active"
              checked={localFilters.is_active === true}
              onCheckedChange={(checked) =>
                handleFilterChange("is_active", checked ? true : undefined)
              }
            />
            <Label
              htmlFor="active"
              className="text-sm font-normal cursor-pointer"
            >
              Show only active staff
            </Label>
          </div>
        </div>

        {/* Accepting Bookings Filter */}
        <div className="space-y-2">
          <Label htmlFor="bookings">Accepting Bookings</Label>
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="bookings"
              checked={localFilters.can_accept_bookings === true}
              onCheckedChange={(checked) =>
                handleFilterChange(
                  "can_accept_bookings",
                  checked ? true : undefined,
                )
              }
            />
            <Label
              htmlFor="bookings"
              className="text-sm font-normal cursor-pointer"
            >
              Can accept bookings
            </Label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2">
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={handleClearFilters}>
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}
        <Button size="sm" onClick={handleApplyFilters}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
