"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Ban,
  CheckCircle,
  XCircle,
  Mail,
  Shield,
  AlertCircle,
  Calendar,
  Clock,
} from "lucide-react";
import type { PlatformUser, AdminFilters } from "../types";

interface UserManagementProps {
  initialUsers: PlatformUser[];
  initialTotalCount: number;
  initialTotalPages: number;
}

export function UserManagement({
  initialUsers,
  initialTotalCount,
  initialTotalPages,
}: UserManagementProps) {
  const [users, setUsers] = useState<PlatformUser[]>(initialUsers);
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
    sort_by: "created_at",
    sort_order: "desc",
  });

  // Action states
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'ban' | 'activate' | 'deactivate';
    user: PlatformUser;
  } | null>(null);

  const fetchUsers = async (newFilters: AdminFilters) => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();

      if (newFilters.search) searchParams.set('search', newFilters.search);
      if (newFilters.status) searchParams.set('status', newFilters.status);
      if (newFilters.sort_by) searchParams.set('sort_by', newFilters.sort_by);
      if (newFilters.sort_order) searchParams.set('sort_order', newFilters.sort_order);
      if (newFilters.page) searchParams.set('page', newFilters.page.toString());
      if (newFilters.limit) searchParams.set('limit', newFilters.limit.toString());

      const response = await fetch(`/api/admin/users?${searchParams.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
      setTotalCount(data.totalCount);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (search: string) => {
    const newFilters = { ...filters, search, page: 1 };
    setFilters(newFilters);
    fetchUsers(newFilters);
  };

  const handleFilterChange = (key: keyof AdminFilters, value: string) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    fetchUsers(newFilters);
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    fetchUsers(newFilters);
  };

  const handleUserAction = async (action: 'ban' | 'activate' | 'deactivate', userId: string, reason?: string) => {
    setActionLoading(userId);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: action, reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      // Refresh the users list
      await fetchUsers(filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user status');
    } finally {
      setActionLoading(null);
      setConfirmAction(null);
    }
  };

  const getStatusBadge = (user: PlatformUser) => {
    switch (user.status) {
      case 'active':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case 'banned':
        return (
          <Badge variant="destructive">
            <Ban className="w-3 h-3 mr-1" />
            Banned
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant="secondary">
            <XCircle className="w-3 h-3 mr-1" />
            Inactive
          </Badge>
        );
      case 'pending_verification':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">Unknown</Badge>
        );
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage platform users and their access permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            <Users className="w-4 h-4 mr-1" />
            {totalCount} total users
          </Badge>
        </div>
      </div>

      {/* Filters */}
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
                  placeholder="Search by email or name..."
                  value={filters.search || ""}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filters.status || ""} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending_verification">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.sort_by || "created_at"} onValueChange={(value) => handleFilterChange('sort_by', value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Created Date</SelectItem>
                <SelectItem value="last_sign_in_at">Last Sign In</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Users</CardTitle>
          <CardDescription>
            {totalCount} users found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Sign In</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No users found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.profile?.avatar_url || undefined} />
                            <AvatarFallback>
                              {getInitials(user.profile?.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {user.profile?.full_name || 'Unnamed User'}
                              {user.is_super_admin && (
                                <Shield className="inline ml-2 h-4 w-4 text-amber-500" />
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user)}
                      </TableCell>
                      <TableCell>
                        {user.roles.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.roles.slice(0, 2).map((role) => (
                              <Badge key={role.id} variant="outline" className="text-xs">
                                {role.role}
                              </Badge>
                            ))}
                            {user.roles.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{user.roles.length - 2}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No roles</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(user.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {formatDate(user.last_sign_in_at)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              disabled={actionLoading === user.id}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {user.status === 'banned' ? (
                              <DropdownMenuItem
                                onClick={() => setConfirmAction({ type: 'activate', user })}
                                className="text-green-600"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Activate User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => setConfirmAction({ type: 'ban', user })}
                                className="text-red-600"
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                Ban User
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => window.open(`mailto:${user.email}`, '_blank')}
                            >
                              <Mail className="mr-2 h-4 w-4" />
                              Send Email
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
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
                {Math.min((filters.page || 1) * (filters.limit || 25), totalCount)} of {totalCount} users
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

      {/* Confirmation Dialog */}
      {confirmAction && (
        <AlertDialog open={true} onOpenChange={() => setConfirmAction(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmAction.type === 'ban' ? 'Ban User' : 'Activate User'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmAction.type === 'ban'
                  ? `Are you sure you want to ban ${confirmAction.user.email}? This will prevent them from accessing the platform.`
                  : `Are you sure you want to activate ${confirmAction.user.email}? This will restore their access to the platform.`
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleUserAction(confirmAction.type, confirmAction.user.id)}
                className={confirmAction.type === 'ban' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                {confirmAction.type === 'ban' ? 'Ban User' : 'Activate User'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}