"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal, Mail, Phone, AlertTriangle, Users, Plus } from "lucide-react";
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
import type { CustomerProfileWithRelations } from "../dal/customers-types";
import { EmptyState } from "@/core/shared/ui/components/empty-state";
import { LoadingPatterns, useKeyboardShortcuts, useOptimisticUpdate } from "@/core/shared/ui/components/production-polish";
import { toast } from "sonner";

interface CustomersListProps {
  customers: CustomerProfileWithRelations[];
  role: "admin" | "owner" | "manager" | "staff";
  loading?: boolean;
  onUpdateCustomer?: (customerId: string, update: any) => Promise<void>;
}

export function CustomersList({ customers, role, loading = false, onUpdateCustomer }: CustomersListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  // Optimistic updates for customer actions
  const { data: optimisticCustomers, updateOptimistic } = useOptimisticUpdate(
    customers,
    (current, update) => {
      if (update.type === 'vip') {
        return current.map(c =>
          c.id === update.customerId
            ? { ...c, is_premium: true }
            : c
        );
      }
      return current;
    }
  );

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'a',
      ctrl: true,
      handler: () => toggleAll()
    },
    {
      key: 'n',
      ctrl: true,
      handler: () => window.location.href = '/dashboard/customers/new'
    }
  ]);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    setSelectedIds((prev) =>
      prev.length === optimisticCustomers.length
        ? []
        : optimisticCustomers.map((c) => c.id).filter((id): id is string => id !== null),
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

  // Handle VIP promotion
  const handleAddToVIP = async (customerId: string) => {
    await updateOptimistic(
      { type: 'vip', customerId },
      async () => {
        if (onUpdateCustomer) {
          await onUpdateCustomer(customerId, { is_premium: true });
        }
        toast.success('Customer added to VIP successfully');
      }
    );
  };

  // Handle customer actions with feedback
  const handleAction = (action: string, customerId: string) => {
    startTransition(() => {
      switch (action) {
        case 'view':
          window.location.href = `/dashboard/customers/${customerId}`;
          break;
        case 'message':
          toast.info('Opening message composer...');
          break;
        case 'history':
          window.location.href = `/dashboard/customers/${customerId}/history`;
          break;
        default:
          break;
      }
    });
  };

  // Show loading state
  if (loading) {
    return <LoadingPatterns.Table rows={5} columns={6} />;
  }

  // Show empty state
  if (optimisticCustomers.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No customers yet"
        description="Start building your customer base by adding your first customer."
        action={{
          label: "Add Customer",
          onClick: () => {
            window.location.href = "/dashboard/customers/new";
          },
        }}
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={selectedIds.length === optimisticCustomers.length}
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
          {optimisticCustomers.map((customer) => {
            const segment = getCustomerSegment(customer);
            if (!customer.id) return null;
            return (
              <TableRow
                key={customer.id}
                className={customer.is_premium ? "bg-amber-50/30 dark:bg-amber-900/10" : ""}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(customer.id!)}
                    onCheckedChange={() => toggleSelection(customer.id!)}
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
                        {customer.email}
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
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleAction('view', customer.id!)}
                        disabled={isPending}
                      >
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleAction('history', customer.id!)}
                        disabled={isPending}
                      >
                        View History
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleAction('message', customer.id!)}
                        disabled={isPending}
                      >
                        Send Message
                      </DropdownMenuItem>
                      {(role === "admin" || role === "owner") && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleAddToVIP(customer.id!)}
                            disabled={customer.is_premium || isPending}
                          >
                            {customer.is_premium ? 'Already VIP' : 'Add to VIP'}
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled={isPending}>
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
  );
}
