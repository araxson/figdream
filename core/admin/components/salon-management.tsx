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
  Building2,
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Star,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  Shield,
  AlertCircle,
  Eye,
  TrendingUp,
} from "lucide-react";
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

  const getStatusBadge = (salon: PlatformSalon) => {
    const badges = [];

    if (salon.is_active) {
      badges.push(
        <Badge key="active" variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </Badge>
      );
    } else {
      badges.push(
        <Badge key="inactive" variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          Inactive
        </Badge>
      );
    }

    if (salon.is_verified) {
      badges.push(
        <Badge key="verified" variant="default" className="bg-blue-100 text-blue-800">
          <Shield className="w-3 h-3 mr-1" />
          Verified
        </Badge>
      );
    }

    if (salon.is_featured) {
      badges.push(
        <Badge key="featured" variant="default" className="bg-yellow-100 text-yellow-800">
          <Star className="w-3 h-3 mr-1" />
          Featured
        </Badge>
      );
    }

    return <div className="flex flex-wrap gap-1">{badges}</div>;
  };

  const getSubscriptionBadge = (salon: PlatformSalon) => {
    const isExpired = salon.subscription_expires_at &&
      new Date(salon.subscription_expires_at) < new Date();

    switch (salon.subscription_tier) {
      case 'free':
        return <Badge variant="outline">Free</Badge>;
      case 'basic':
        return (
          <Badge variant={isExpired ? "destructive" : "default"} className="bg-blue-100 text-blue-800">
            Basic
          </Badge>
        );
      case 'pro':
        return (
          <Badge variant={isExpired ? "destructive" : "default"} className="bg-purple-100 text-purple-800">
            Pro
          </Badge>
        );
      case 'enterprise':
        return (
          <Badge variant={isExpired ? "destructive" : "default"} className="bg-orange-100 text-orange-800">
            Enterprise
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatAddress = (address: any) => {
    if (!address) return 'No address';
    return `${address.street || ''} ${address.city || ''}, ${address.state || ''} ${address.postal_code || ''}`.trim();
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
                  placeholder="Search by name, email, or business name..."
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
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.salon_tier || ""} onValueChange={(value) => handleFilterChange('salon_tier', value)}>
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
            <Select value={filters.sort_by || "created_at"} onValueChange={(value) => handleFilterChange('sort_by', value)}>
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
                    <TableRow key={salon.id}>
                      <TableCell>
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage src={salon.logo_url || undefined} />
                            <AvatarFallback>
                              {salon.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">{salon.name}</div>
                            <div className="text-sm text-muted-foreground truncate">
                              {salon.business_name || salon.business_type}
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {salon.email}
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {salon.phone}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {formatAddress(salon.address)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(salon)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getSubscriptionBadge(salon)}
                          {salon.subscription_expires_at && (
                            <div className="text-xs text-muted-foreground">
                              Expires: {formatDate(salon.subscription_expires_at)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3 text-green-600" />
                              {formatCurrency(salon.stats.total_revenue)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-blue-600" />
                              {salon.stats.total_bookings}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              {salon.stats.rating_average.toFixed(1)} ({salon.stats.rating_count})
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3 text-purple-600" />
                              {salon.stats.employee_count} staff
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(salon.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              disabled={actionLoading === salon.id}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => window.open(`/salon/${salon.slug}`, '_blank')}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Salon
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {salon.is_active ? (
                              <DropdownMenuItem
                                onClick={() => setConfirmAction({ type: 'deactivate', salon })}
                                className="text-red-600"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => setConfirmAction({ type: 'activate', salon })}
                                className="text-green-600"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            {!salon.is_verified && (
                              <DropdownMenuItem
                                onClick={() => setConfirmAction({ type: 'verify', salon })}
                                className="text-blue-600"
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Verify Salon
                              </DropdownMenuItem>
                            )}
                            {salon.is_featured ? (
                              <DropdownMenuItem
                                onClick={() => setConfirmAction({ type: 'unfeature', salon })}
                              >
                                <Star className="mr-2 h-4 w-4" />
                                Remove Featured
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => setConfirmAction({ type: 'feature', salon })}
                                className="text-yellow-600"
                              >
                                <Star className="mr-2 h-4 w-4" />
                                Make Featured
                              </DropdownMenuItem>
                            )}
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

      {/* Confirmation Dialog */}
      {confirmAction && (
        <AlertDialog open={true} onOpenChange={() => setConfirmAction(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmAction.type === 'activate' && 'Activate Salon'}
                {confirmAction.type === 'deactivate' && 'Deactivate Salon'}
                {confirmAction.type === 'verify' && 'Verify Salon'}
                {confirmAction.type === 'feature' && 'Feature Salon'}
                {confirmAction.type === 'unfeature' && 'Remove Featured Status'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmAction.type === 'activate' &&
                  `Are you sure you want to activate ${confirmAction.salon.name}? This will allow them to accept bookings.`}
                {confirmAction.type === 'deactivate' &&
                  `Are you sure you want to deactivate ${confirmAction.salon.name}? This will suspend their operations.`}
                {confirmAction.type === 'verify' &&
                  `Are you sure you want to verify ${confirmAction.salon.name}? This will mark them as a verified business.`}
                {confirmAction.type === 'feature' &&
                  `Are you sure you want to feature ${confirmAction.salon.name}? This will promote them on the platform.`}
                {confirmAction.type === 'unfeature' &&
                  `Are you sure you want to remove featured status from ${confirmAction.salon.name}?`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleSalonAction(confirmAction.type, confirmAction.salon.id)}
                className={confirmAction.type === 'deactivate' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                {confirmAction.type === 'activate' && 'Activate'}
                {confirmAction.type === 'deactivate' && 'Deactivate'}
                {confirmAction.type === 'verify' && 'Verify'}
                {confirmAction.type === 'feature' && 'Feature'}
                {confirmAction.type === 'unfeature' && 'Remove Featured'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}