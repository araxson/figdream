'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import type { AdminFilters } from '../types';

interface SalonFiltersProps {
  filters: AdminFilters;
  onSearch: (search: string) => void;
  onFilterChange: (key: keyof AdminFilters, value: string) => void;
}

export function SalonFilters({ filters, onSearch, onFilterChange }: SalonFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or business name..."
                value={filters.search || ""}
                onChange={(e) => onSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filters.status || ""} onValueChange={(value) => onFilterChange('status', value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.salon_tier || ""} onValueChange={(value) => onFilterChange('salon_tier', value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Tiers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Tiers</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.sort_by || "created_at"} onValueChange={(value) => onFilterChange('sort_by', value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Created Date</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="total_revenue">Revenue</SelectItem>
              <SelectItem value="total_bookings">Bookings</SelectItem>
              <SelectItem value="rating_average">Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}