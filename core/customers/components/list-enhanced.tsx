"use client";

import { useState, useEffect } from "react";
import {
  MoreHorizontal,
  Mail,
  Phone,
  AlertTriangle,
  Search,
  Filter,
  Download,
  UserPlus,
  RefreshCw,
  Package,
  Loader2
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import type { CustomerProfileWithRelations } from "../dal/customers-types";

// Import reusable state components
import {
  EmptyState,
  LoadingState,
  ErrorState
} from "@/core/ui/components/empty-state";

interface CustomersListEnhancedProps {
  customers: CustomerProfileWithRelations[];
  role: "admin" | "owner" | "manager" | "staff";
  loading?: boolean;
  error?: Error | null;
  onRefresh?: () => void;
  onSearch?: (query: string) => void;
  onFilter?: (filters: any) => void;
  onExport?: () => void;
  onCreateCustomer?: () => void;
}

// Loading skeleton for table rows
function CustomerTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Skeleton className="h-4 w-4" />
            </TableHead>
            <TableHead><Skeleton className="h-4 w-20" /></TableHead>
            <TableHead><Skeleton className="h-4 w-16" /></TableHead>
            <TableHead><Skeleton className="h-4 w-16" /></TableHead>
            <TableHead><Skeleton className="h-4 w-16" /></TableHead>
            <TableHead><Skeleton className="h-4 w-24" /></TableHead>
            <TableHead className="text-right"><Skeleton className="h-4 w-16" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-4 w-4" />
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Skeleton className="h-3 w-36" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-16 rounded-full" />
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-2 w-20" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-8 w-8" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function CustomersListEnhanced({
  customers,
  role,
  loading = false,
  error = null,
  onRefresh,
  onSearch,
  onFilter,
  onExport,
  onCreateCustomer
}: CustomersListEnhancedProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      customer.display_name?.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.phone?.includes(query)
    );
  });

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    setSelectedIds((prev) =>
      prev.length === filteredCustomers.length
        ? []
        : filteredCustomers.map((c) => c.id).filter((id): id is string => id !== null),
    );
  };

  const getCustomerSegment = (customer: CustomerProfileWithRelations) => {
    const visitCount = customer.visit_count || 0;
    const lastVisit = customer.last_visit
      ? new Date(customer.last_visit)
      : null;
    const daysSinceLastVisit = lastVisit
      ? Math.floor((Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    if (customer.is_premium)
      return { label: "VIP", variant: "default" as const };
    if (visitCount === 0)
      return { label: "New", variant: "secondary" as const };
    if (daysSinceLastVisit && daysSinceLastVisit > 90)
      return { label: "At Risk", variant: "destructive" as const };
    if (visitCount > 10) return { label: "Loyal", variant: "default" as const };
    return { label: "Active", variant: "outline" as const };
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh?.();
      toast.success("Customer list refreshed");
    } catch (error) {
      toast.error("Failed to refresh");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAction = async (action: string, customerId: string, customerName: string) => {
    setActionLoading(customerId);
    try {
      // Simulate action
      await new Promise(resolve => setTimeout(resolve, 1000));

      switch(action) {
        case 'view':
          toast.info(`Viewing ${customerName}'s profile`);
          break;
        case 'message':
          toast.info(`Opening message composer for ${customerName}`);
          break;
        case 'vip':
          toast.success(`${customerName} added to VIP list`);
          break;
        case 'note':
          toast.info(`Adding note for ${customerName}`);
          break;
        default:
          toast.info(`Action: ${action}`);
      }
    } catch (error) {
      toast.error(`Failed to perform action`);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle loading state
  if (loading && !customers.length) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Customers</CardTitle>
              <CardDescription>Managing your customer relationships</CardDescription>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CustomerTableSkeleton />
        </CardContent>
      </Card>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
          <CardDescription>Managing your customer relationships</CardDescription>
        </CardHeader>
        <CardContent>
          <ErrorState
            title="Failed to load customers"
            description={error.message || "An error occurred while loading customer data"}
            action={{
              label: "Try Again",
              onClick: handleRefresh
            }}
          />
        </CardContent>
      </Card>
    );
  }

  // Handle empty state
  if (!loading && !error && customers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
          <CardDescription>Managing your customer relationships</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Package}
            title="No customers yet"
            description="Start building your customer base by adding your first customer"
            action={{
              label: "Add Customer",
              onClick: onCreateCustomer || (() => toast.info("Add customer clicked"))
            }}
            secondaryAction={{
              label: "Import Customers",
              onClick: () => toast.info("Import feature coming soon")
            }}
          />
        </CardContent>
      </Card>
    );
  }

  // Handle no results after search/filter
  if (!loading && filteredCustomers.length === 0 && customers.length > 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Customers</CardTitle>
              <CardDescription>
                {customers.length} total customers
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button onClick={onCreateCustomer}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            {onExport && (
              <Button variant="outline" size="icon" onClick={onExport}>
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Search}
            title="No results found"
            description={`No customers match "${searchQuery}". Try adjusting your search.`}
            variant="minimal"
            action={{
              label: "Clear Search",
              onClick: () => setSearchQuery(""),
              variant: "outline"
            }}
          />
        </CardContent>
      </Card>
    );
  }

  // Main table view with data
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Customers</CardTitle>
            <CardDescription>
              {selectedIds.length > 0
                ? `${selectedIds.length} customer${selectedIds.length > 1 ? 's' : ''} selected`
                : `${filteredCustomers.length} customer${filteredCustomers.length !== 1 ? 's' : ''}`
              }
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Button onClick={onCreateCustomer}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          {onExport && (
            <Button variant="outline" size="icon" onClick={onExport}>
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Bulk actions */}
        {selectedIds.length > 0 && (
          <Alert className="mt-4">
            <AlertDescription className="flex items-center justify-between">
              <span>{selectedIds.length} customers selected</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  Send Message
                </Button>
                <Button size="sm" variant="outline">
                  Add Tag
                </Button>
                <Button size="sm" variant="outline" className="text-destructive">
                  Delete
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedIds.length === filteredCustomers.length && filteredCustomers.length > 0}
                    onCheckedChange={toggleAll}
                    aria-label="Select all customers"
                  />
                </TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Segment</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Lifetime Value</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => {
                const segment = getCustomerSegment(customer);
                if (!customer.id) return null;
                const isLoading = actionLoading === customer.id;

                return (
                  <TableRow key={customer.id} className={isLoading ? "opacity-50" : ""}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(customer.id!)}
                        onCheckedChange={() => toggleSelection(customer.id!)}
                        disabled={isLoading}
                        aria-label={`Select ${customer.display_name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={customer.avatar_url || ""} />
                          <AvatarFallback>
                            {customer.display_name?.slice(0, 2).toUpperCase() ||
                              "CU"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{customer.display_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Customer since{" "}
                            {customer.created_at
                              ? new Date(customer.created_at).toLocaleDateString()
                              : "Unknown"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {customer.email && (
                          <div className="flex items-center text-sm">
                            <Mail className="mr-1 h-3 w-3" />
                            <span className="truncate max-w-[200px]">{customer.email}</span>
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="mr-1 h-3 w-3" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={segment.variant}>
                        {segment.label === "At Risk" && (
                          <AlertTriangle className="mr-1 h-3 w-3" />
                        )}
                        {segment.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm">
                          {customer.visit_count || 0} visits
                        </p>
                        {customer.last_visit && (
                          <p className="text-xs text-muted-foreground">
                            Last:{" "}
                            {new Date(customer.last_visit).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">
                        ${(customer.total_spent || 0).toLocaleString()}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleAction('view', customer.id!, customer.display_name!)}
                          >
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleAction('history', customer.id!, customer.display_name!)}
                          >
                            View History
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleAction('message', customer.id!, customer.display_name!)}
                          >
                            Send Message
                          </DropdownMenuItem>
                          {(role === "admin" || role === "owner") && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleAction('vip', customer.id!, customer.display_name!)}
                              >
                                Add to VIP
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleAction('note', customer.id!, customer.display_name!)}
                              >
                                Add Note
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}