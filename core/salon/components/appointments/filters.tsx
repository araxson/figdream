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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Search, X } from "lucide-react";
import { format } from "date-fns";
import type { AppointmentFiltersProps } from "../types";
import type { AppointmentFilters } from "../types";
import { Constants } from "@/types/database.types";

const appointmentStatuses = Constants.public.Enums.appointment_status;
const paymentStatuses = Constants.public.Enums.payment_status;

export function AppointmentFilters({
  filters,
  onFiltersChange,
}: AppointmentFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [_startDate, setStartDate] = useState<Date | undefined>(
    filters.start_date ? new Date(filters.start_date) : undefined,
  );
  const [_endDate, setEndDate] = useState<Date | undefined>(
    filters.end_date ? new Date(filters.end_date) : undefined,
  );

  const handleFilterChange = (
    key: keyof AppointmentFilters,
    value: string | undefined,
  ) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    const appliedFilters = {
      ...localFilters,
      start_date: _startDate?.toISOString(),
      end_date: _endDate?.toISOString(),
    };
    onFiltersChange(appliedFilters);
  };

  const handleClearFilters = () => {
    setLocalFilters({});
    setStartDate(undefined);
    setEndDate(undefined);
    onFiltersChange({});
  };

  const hasActiveFilters =
    Object.keys(localFilters).length > 0 || _startDate || _endDate;

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
              placeholder="Confirmation code, notes..."
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
              {appointmentStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() +
                    status.slice(1).replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Payment Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="payment-status">Payment Status</Label>
          <Select
            value={localFilters.payment_status || ""}
            onValueChange={(value) =>
              handleFilterChange("payment_status", value || undefined)
            }
          >
            <SelectTrigger id="payment-status">
              <SelectValue placeholder="All payment statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All payment statuses</SelectItem>
              {paymentStatuses.map((status: string) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() +
                    status.slice(1).replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <Label>Date Range</Label>
          <div className="flex space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {_startDate ? format(_startDate, "PP") : "Start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={_startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {_endDate ? format(_endDate, "PP") : "End date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={_endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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
