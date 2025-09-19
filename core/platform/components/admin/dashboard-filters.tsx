"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Download } from "lucide-react";

import type { UserFilters } from "../types";

interface UsersDashboardFiltersProps {
  filters: UserFilters;
  onFilterChange: (filters: Partial<UserFilters>) => void;
  onExport: () => void;
  isLoading: boolean;
}

export function UsersDashboardFilters({
  filters,
  onFilterChange,
  onExport,
  isLoading
}: UsersDashboardFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search users..."
          value={filters.search || ""}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="pl-10"
        />
      </div>

      {/* Role Filter */}
      <Select
        value={filters.role || "all"}
        onValueChange={(value) => onFilterChange({ role: value === "all" ? undefined : value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="super_admin">Super Admin</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="owner">Owner</SelectItem>
          <SelectItem value="manager">Manager</SelectItem>
          <SelectItem value="staff">Staff</SelectItem>
          <SelectItem value="customer">Customer</SelectItem>
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select
        value={filters.status || "all"}
        onValueChange={(value) => onFilterChange({ status: value === "all" ? undefined : value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="suspended">Suspended</SelectItem>
          <SelectItem value="unverified">Unverified</SelectItem>
        </SelectContent>
      </Select>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onExport}
          disabled={isLoading}
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
}