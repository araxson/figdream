"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AuditEventFilters } from "../dal/audit-types";
import {
  AuditEventCategories,
  AuditEventTypes,
  AuditActions,
} from "../dal/audit-types";

interface AuditFiltersProps {
  filters: AuditEventFilters;
  onFiltersChange: (filters: AuditEventFilters) => void;
  onReset?: () => void;
}

export function AuditFilters({
  filters,
  onFiltersChange,
  onReset,
}: AuditFiltersProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(
    filters.startDate ? new Date(filters.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    filters.endDate ? new Date(filters.endDate) : undefined
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: keyof AuditEventFilters, value: any) => {
    const newFilters = { ...filters };
    if (value === "" || value === undefined) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    onFiltersChange(newFilters);
  };

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    handleFilterChange("startDate", date?.toISOString());
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    handleFilterChange("endDate", date?.toISOString());
  };

  const handleReset = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setShowAdvanced(false);
    if (onReset) {
      onReset();
    } else {
      onFiltersChange({});
    }
  };

  const activeFiltersCount = Object.keys(filters).filter(
    (key) => filters[key as keyof AuditEventFilters] !== undefined
  ).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Filter audit events to find what you're looking for
            </CardDescription>
          </div>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">
              {activeFiltersCount} active filter{activeFiltersCount !== 1 && "s"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search events..."
              value={filters.searchTerm || ""}
              onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={filters.eventCategory || ""}
              onValueChange={(value) => handleFilterChange("eventCategory", value)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                {Object.entries(AuditEventCategories).map(([key, value]) => (
                  <SelectItem key={key} value={value}>
                    {key.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="startDate"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={handleStartDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="endDate"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={handleEndDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="advanced"
            checked={showAdvanced}
            onCheckedChange={setShowAdvanced}
          />
          <Label htmlFor="advanced" className="cursor-pointer">
            Show advanced filters
          </Label>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="eventType">Event Type</Label>
              <Select
                value={filters.eventType || ""}
                onValueChange={(value) => handleFilterChange("eventType", value)}
              >
                <SelectTrigger id="eventType">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  {Object.entries(AuditEventTypes).map(([key, value]) => (
                    <SelectItem key={key} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="action">Action</Label>
              <Select
                value={filters.action || ""}
                onValueChange={(value) => handleFilterChange("action", value)}
              >
                <SelectTrigger id="action">
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All actions</SelectItem>
                  {Object.entries(AuditActions).map(([key, value]) => (
                    <SelectItem key={key} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select
                value={filters.severity || ""}
                onValueChange={(value) => handleFilterChange("severity", value)}
              >
                <SelectTrigger id="severity">
                  <SelectValue placeholder="All severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All severities</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="success">Status</Label>
              <Select
                value={
                  filters.success === undefined
                    ? ""
                    : filters.success
                    ? "success"
                    : "failure"
                }
                onValueChange={(value) => {
                  if (value === "") {
                    handleFilterChange("success", undefined);
                  } else {
                    handleFilterChange("success", value === "success");
                  }
                }}
              >
                <SelectTrigger id="success">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failure">Failure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                placeholder="Enter user ID..."
                value={filters.userId || ""}
                onChange={(e) => handleFilterChange("userId", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resourceType">Resource Type</Label>
              <Input
                id="resourceType"
                placeholder="e.g., appointment, user..."
                value={filters.resourceType || ""}
                onChange={(e) => handleFilterChange("resourceType", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resourceId">Resource ID</Label>
              <Input
                id="resourceId"
                placeholder="Enter resource ID..."
                value={filters.resourceId || ""}
                onChange={(e) => handleFilterChange("resourceId", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salonId">Salon ID</Label>
              <Input
                id="salonId"
                placeholder="Enter salon ID..."
                value={filters.salonId || ""}
                onChange={(e) => handleFilterChange("salonId", e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={activeFiltersCount === 0}
          >
            <X className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
          <Button>
            <Filter className="mr-2 h-4 w-4" />
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}