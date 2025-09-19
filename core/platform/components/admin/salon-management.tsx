"use client";

import { useState } from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, AlertCircle } from "lucide-react";
import { SalonFilters } from './salon-filters';
import { SalonTableRow } from './salon-table-row';
import { SalonConfirmDialog } from './salon-confirm-dialog';
import type { PlatformSalon, AdminFilters } from "../types";

interface SalonManagementProps {
  initialSalons: PlatformSalon[];
  initialTotalCount: number;
  initialTotalPages: number;
}

export function SalonManagement({
  initialSalons,
  initialTotalCount,
  initialTotalPages,
}: SalonManagementProps) {
  const [salons, setSalons] = useState<PlatformSalon[]>(initialSalons);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState<AdminFilters>({
    page: 1,
    limit: 25,
    search: "",
    status: "",
    salon_tier: "",
    sort_by: "created_at",
    sort_order: "desc",
  });

  // Action states
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'activate' | 'deactivate' | 'verify' | 'feature' | 'unfeature';
    salon: PlatformSalon;
  } | null>(null);

  const fetchSalons = async (newFilters: AdminFilters) => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();

      if (newFilters.search) searchParams.set('search', newFilters.search);
      if (newFilters.status) searchParams.set('status', newFilters.status);
      if (newFilters.salon_tier) searchParams.set('salon_tier', newFilters.salon_tier);
      if (newFilters.sort_by) searchParams.set('sort_by', newFilters.sort_by);
      if (newFilters.sort_order) searchParams.set('sort_order', newFilters.sort_order);
      if (newFilters.page) searchParams.set('page', newFilters.page.toString());
      if (newFilters.limit) searchParams.set('limit', newFilters.limit.toString());

      const response = await fetch(`/api/admin/salons?${searchParams.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch salons');
      }

      const data = await response.json();
      setSalons(data.salons);
      setTotalCount(data.totalCount);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch salons');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (search: string) => {
    const newFilters = { ...filters, search, page: 1 };
    setFilters(newFilters);
    fetchSalons(newFilters);
  };

  const handleFilterChange = (key: keyof AdminFilters, value: string) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    fetchSalons(newFilters);
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    fetchSalons(newFilters);
  };

  const handleSalonAction = async (
    action: 'activate' | 'deactivate' | 'verify' | 'feature' | 'unfeature',
    salonId: string,
    reason?: string
  ) => {
    setActionLoading(salonId);
    setError(null);

    try {
      const updates: any = {};

      switch (action) {
        case 'activate':
          updates.is_active = true;
          break;
        case 'deactivate':
          updates.is_active = false;
          break;
        case 'verify':
          updates.is_verified = true;
          break;
        case 'feature':
          updates.is_featured = true;
          break;
        case 'unfeature':
          updates.is_featured = false;
          break;
      }

      const response = await fetch(`/api/admin/salons/${salonId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates, reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to update salon status');
      }

      // Refresh the salons list
      await fetchSalons(filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update salon status');
    } finally {
      setActionLoading(null);
      setConfirmAction(null);
    }
  };

  const handleSetConfirmAction = (type: 'activate' | 'deactivate' | 'verify' | 'feature' | 'unfeature', salon: PlatformSalon) => {
    setConfirmAction({ type, salon });
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Salon Management</h1>
          <p className="text-muted-foreground">
            Oversee salon operations and manage platform salons
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            <Building2 className="w-4 h-4 mr-1" />
            {totalCount} total salons
          </Badge>
        </div>
      </div>

      <SalonFilters
        filters={filters}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />

      {/* Salons Table */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Salons</CardTitle>
          <CardDescription>
            {totalCount} salons found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Salon</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Building2 className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No salons found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  salons.map((salon) => (
                    <SalonTableRow
                      key={salon.id}
                      salon={salon}
                      isActionLoading={actionLoading === salon.id}
                      onAction={handleSetConfirmAction}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {((filters.page || 1) - 1) * (filters.limit || 25) + 1} to{" "}
                {Math.min((filters.page || 1) * (filters.limit || 25), totalCount)} of {totalCount} salons
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange((filters.page || 1) - 1)}
                  disabled={filters.page === 1 || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange((filters.page || 1) + 1)}
                  disabled={filters.page === totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <SalonConfirmDialog
        confirmAction={confirmAction}
        onConfirm={handleSalonAction}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}