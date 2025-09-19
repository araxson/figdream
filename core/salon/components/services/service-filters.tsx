"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Search, Filter, X } from "lucide-react";
import { ServiceFilters } from "../dal/services-types";

interface ServicesFiltersProps {
  initialFilters: ServiceFilters;
  salonId?: string;
  onFiltersChange?: (filters: ServiceFilters) => void;
}

export function ServicesFilters({
  initialFilters,
  salonId,
  onFiltersChange,
}: ServicesFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<ServiceFilters>(initialFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: keyof ServiceFilters, value: unknown) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      }
    });
    router.push(`?${params.toString()}`);
    onFiltersChange?.(filters);
  };

  const handleResetFilters = () => {
    const resetFilters: ServiceFilters = { salonId };
    setFilters(resetFilters);
    router.push(window.location.pathname);
    onFiltersChange?.(resetFilters);
  };

  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) =>
      key !== "salonId" &&
      value !== undefined &&
      value !== null &&
      value !== "",
  ).length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={filters.searchQuery || ""}
            onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="rounded-lg border p-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Status Filters */}
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="active" className="text-sm font-normal">
                    Active Only
                  </Label>
                  <Switch
                    id="active"
                    checked={filters.isActive === true}
                    onCheckedChange={(checked) =>
                      handleFilterChange("isActive", checked ? true : undefined)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="bookable" className="text-sm font-normal">
                    Bookable Only
                  </Label>
                  <Switch
                    id="bookable"
                    checked={filters.isBookable === true}
                    onCheckedChange={(checked) =>
                      handleFilterChange(
                        "isBookable",
                        checked ? true : undefined,
                      )
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="featured" className="text-sm font-normal">
                    Featured Only
                  </Label>
                  <Switch
                    id="featured"
                    checked={filters.isFeatured === true}
                    onCheckedChange={(checked) =>
                      handleFilterChange(
                        "isFeatured",
                        checked ? true : undefined,
                      )
                    }
                  />
                </div>
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <Label>Price Range</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "minPrice",
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "maxPrice",
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                />
              </div>
            </div>

            {/* Duration Range */}
            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minDuration || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "minDuration",
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxDuration || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "maxDuration",
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="ghost"
              onClick={handleResetFilters}
              disabled={activeFiltersCount === 0}
            >
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
            <Button onClick={handleApplyFilters}>Apply Filters</Button>
          </div>
        </div>
      )}
    </div>
  );
}
