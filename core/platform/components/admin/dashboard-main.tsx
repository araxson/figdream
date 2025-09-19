"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

import { UsersDashboardStats } from "./users-dashboard-stats";
import { UsersDashboardFilters } from "./users-dashboard-filters";
import { UsersDashboardTable } from "./users-dashboard-table";
import { UsersDashboardBulkActions } from "./users-dashboard-bulk-actions";

import { useUsersData } from "../hooks/use-users-data";
import { getUsersAction, exportUsersAction, bulkUserOperationAction } from "../actions";
import type { ProfileWithRelations, UserFilters, BulkUserOperation } from "../types";

interface UsersDashboardMainProps {
  initialUsers: ProfileWithRelations[];
  initialStats: any;
}

export function UsersDashboardMain({ initialUsers, initialStats }: UsersDashboardMainProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  // State
  const [users, setUsers] = useState<ProfileWithRelations[]>(initialUsers);
  const [stats, setStats] = useState(initialStats);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filters, setFilters] = useState<UserFilters>({});
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>("");

  // Custom hook for data operations
  const { fetchUsers, fetchStats } = useUsersData(setUsers, setStats, filters);

  // Filter change handler
  const handleFilterChange = useCallback((newFilters: Partial<UserFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    startTransition(() => {
      fetchUsers();
    });
  }, [fetchUsers]);

  // User action handler
  const handleUserAction = async (userId: string, action: string) => {
    setIsLoading(true);
    try {
      // Implementation for individual user actions
      await new Promise(resolve => setTimeout(resolve, 1000)); // Placeholder
      toast.success(`User ${action} completed`);
      fetchUsers();
      fetchStats();
    } catch (_error) {
      toast.error(`Failed to ${action} user`);
    } finally {
      setIsLoading(false);
    }
  };

  // Bulk operation handler
  const handleBulkOperation = async () => {
    if (!bulkAction || selectedUsers.length === 0) return;

    setIsLoading(true);
    setShowBulkDialog(false);

    try {
      const operation: BulkUserOperation = {
        action: bulkAction as any,
        user_ids: selectedUsers,
        params: {
          notify_users: true
        }
      };

      const result = await bulkUserOperationAction(operation);

      toast.success(
        `Bulk operation completed: ${result.results.length} successful, ${result.errors.length} failed`
      );

      setSelectedUsers([]);
      fetchUsers();
      fetchStats();
    } catch (_error) {
      toast.error("Bulk operation failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Export users
  const handleExport = async () => {
    try {
      const result = await exportUsersAction(filters);

      // Create download link
      const blob = new Blob([result.data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename;
      link.click();

      toast.success("Users exported successfully");
    } catch (_error) {
      toast.error("Failed to export users");
    }
  };

  // Bulk action trigger
  const triggerBulkAction = (action: string) => {
    if (selectedUsers.length === 0) {
      toast.error("Please select users first");
      return;
    }
    setBulkAction(action);
    setShowBulkDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <UsersDashboardStats stats={stats} />

      {/* Main Content Card */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage platform users, roles, and permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <UsersDashboardFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onExport={handleExport}
            isLoading={isPending || isLoading}
          />

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <UsersDashboardBulkActions
              selectedCount={selectedUsers.length}
              onBulkAction={triggerBulkAction}
              isLoading={isLoading}
            />
          )}

          {/* Users Table */}
          <UsersDashboardTable
            users={users}
            selectedUsers={selectedUsers}
            onSelectionChange={setSelectedUsers}
            onUserAction={handleUserAction}
            isLoading={isPending || isLoading}
          />
        </CardContent>
      </Card>

      {/* Bulk Operation Confirmation Dialog */}
      <AlertDialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Operation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {bulkAction?.replace("_", " ")} {selectedUsers.length} selected users?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkOperation}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}