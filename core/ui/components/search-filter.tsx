"use client";

import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// Search bar component
interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className,
}: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="pl-8"
      />
    </div>
  );
}

// Filter select component
interface FilterSelectProps {
  label: string;
  value?: string;
  options: { label: string; value: string }[];
  onChange?: (value: string) => void;
  placeholder?: string;
}

export function FilterSelect({
  label,
  value,
  options,
  onChange,
  placeholder = "Select...",
}: FilterSelectProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Advanced filter popover
interface FilterOption {
  id: string;
  label: string;
  type: "select" | "date" | "range";
  options?: { label: string; value: string }[];
}

interface AdvancedFiltersProps {
  filters: FilterOption[];
  activeFilters?: Record<string, any>;
  onFiltersChange?: (filters: Record<string, any>) => void;
}

export function AdvancedFilters({
  filters,
  activeFilters = {},
  onFiltersChange,
}: AdvancedFiltersProps) {
  const handleFilterChange = (filterId: string, value: unknown) => {
    const newFilters = { ...activeFilters };
    if (value === null || value === "") {
      delete newFilters[filterId];
    } else {
      newFilters[filterId] = value;
    }
    onFiltersChange?.(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange?.({});
  };

  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filters</h4>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-auto p-0 text-xs"
              >
                Clear all
              </Button>
            )}
          </div>
          <Separator />
          <div className="space-y-4">
            {filters.map((filter) => (
              <div key={filter.id}>
                {filter.type === "select" && filter.options && (
                  <FilterSelect
                    label={filter.label}
                    value={activeFilters[filter.id]}
                    options={filter.options}
                    onChange={(value) => handleFilterChange(filter.id, value)}
                    placeholder={`Select ${filter.label.toLowerCase()}`}
                  />
                )}
              </div>
            ))}
          </div>
          {activeFilterCount > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Active filters
                </Label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(activeFilters).map(([key, value]) => {
                    const filter = filters.find((f) => f.id === key);
                    const option = filter?.options?.find(
                      (o) => o.value === value,
                    );
                    return (
                      <Badge key={key} variant="secondary" className="gap-1">
                        {filter?.label}: {option?.label || value}
                        <button
                          onClick={() => handleFilterChange(key, null)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Filter bar component combining search and filters
interface FilterBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterOption[];
  activeFilters?: Record<string, any>;
  onFiltersChange?: (filters: Record<string, any>) => void;
  showSearch?: boolean;
  showFilters?: boolean;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters = [],
  activeFilters,
  onFiltersChange,
  showSearch = true,
  showFilters = true,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {showSearch && (
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          className="max-w-xs"
        />
      )}
      {showFilters && filters.length > 0 && (
        <AdvancedFilters
          filters={filters}
          activeFilters={activeFilters}
          onFiltersChange={onFiltersChange}
        />
      )}
    </div>
  );
}
