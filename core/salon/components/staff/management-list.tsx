'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Grid, List, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/core/shared/ui/components/empty-state';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { StaffFiltersComponent } from '../dashboard/staff-filters';
import { StaffTableView } from '../dashboard/staff-table-view';
import { StaffGridView } from '../dashboard/staff-grid-view';
import { StaffBulkActions } from '../dashboard/staff-bulk-actions';
import { StaffPagination } from '../dashboard/staff-pagination';
import type { StaffProfileWithDetails, StaffFilters, EmploymentType, StaffStatus } from '../types';

interface StaffManagementListProps {
  staff: StaffProfileWithDetails[];
  isLoading?: boolean;
  error?: Error | null;
  onCreateStaff?: () => void;
  onEditStaff?: (staff: StaffProfileWithDetails) => void;
  onDeleteStaff?: (id: string) => void;
  onViewStaff?: (staff: StaffProfileWithDetails) => void;
  onBulkAction?: (action: string, staffIds: string[]) => void;
  onExport?: (format: 'csv' | 'pdf') => void;
  onImport?: (file: File) => void;
}

export function StaffManagementList({
  staff,
  isLoading = false,
  error = null,
  onCreateStaff,
  onEditStaff,
  onDeleteStaff,
  onViewStaff,
  onBulkAction,
  onExport,
  onImport
}: StaffManagementListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [filters, setFilters] = useState<StaffFilters>({});
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleFilterChange = (key: keyof StaffFilters, value: any) => {
    setFilters({ ...filters, [key]: value });
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleResetFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const handleSelectStaff = (staffId: string, checked: boolean) => {
    setSelectedStaff(prev =>
      checked ? [...prev, staffId] : prev.filter(id => id !== staffId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedStaff(checked ? filteredStaff.map(s => s.id) : []);
  };

  const handleBulkAction = (action: string) => {
    if (action === 'clear_selection') {
      setSelectedStaff([]);
      return;
    }

    if (onBulkAction && selectedStaff.length > 0) {
      onBulkAction(action, selectedStaff);
      setSelectedStaff([]);
    }
  };

  const handleDeleteClick = (staffId: string) => {
    setStaffToDelete(staffId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (staffToDelete && onDeleteStaff) {
      onDeleteStaff(staffToDelete);
      setDeleteDialogOpen(false);
      setStaffToDelete(null);
    }
  };

  // Filter logic
  const filteredStaff = staff.filter(s => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesName = s.user?.full_name?.toLowerCase().includes(searchLower);
      const matchesTitle = s.title?.toLowerCase().includes(searchLower);
      const matchesEmail = s.user?.email?.toLowerCase().includes(searchLower);
      if (!matchesName && !matchesTitle && !matchesEmail) return false;
    }

    if (filters.status && filters.status.length > 0 && !filters.status.includes(s.status as StaffStatus)) {
      return false;
    }

    if (filters.employment_type && filters.employment_type.length > 0 && !filters.employment_type.includes(s.employment_type as EmploymentType)) {
      return false;
    }

    if (filters.is_bookable !== undefined && s.is_bookable !== filters.is_bookable) {
      return false;
    }

    if (filters.is_featured !== undefined && s.is_featured !== filters.is_featured) {
      return false;
    }

    if (filters.min_rating && (s.rating_average || 0) < filters.min_rating) {
      return false;
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStaff = filteredStaff.slice(startIndex, startIndex + itemsPerPage);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-10 w-24" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading staff</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Staff Management</CardTitle>
              <CardDescription>
                Manage your salon staff members, schedules, and performance.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <StaffFiltersComponent
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            onCreateStaff={onCreateStaff}
            onExport={onExport}
            onImport={onImport}
          />

          <StaffBulkActions
            selectedCount={selectedStaff.length}
            onBulkAction={handleBulkAction}
          />

          {filteredStaff.length === 0 ? (
            <EmptyState
              title="No staff members found"
              description="Try adjusting your filters or add a new staff member."
              action={
                onCreateStaff ? (
                  <Button onClick={onCreateStaff}>Add Staff Member</Button>
                ) : undefined
              }
            />
          ) : (
            <>
              {viewMode === 'table' ? (
                <StaffTableView
                  staff={paginatedStaff}
                  selectedStaff={selectedStaff}
                  onSelectStaff={handleSelectStaff}
                  onSelectAll={handleSelectAll}
                  onEditStaff={onEditStaff}
                  onDeleteStaff={onDeleteStaff}
                  onViewStaff={onViewStaff}
                  onDeleteClick={handleDeleteClick}
                />
              ) : (
                <StaffGridView
                  staff={paginatedStaff}
                  selectedStaff={selectedStaff}
                  onSelectStaff={handleSelectStaff}
                  onEditStaff={onEditStaff}
                  onDeleteStaff={onDeleteStaff}
                  onViewStaff={onViewStaff}
                />
              )}

              <StaffPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Staff Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this staff member? This action cannot be undone.
              The staff member will be deactivated and their profile will be archived.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}