"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Receipt, RefreshCw, XCircle } from "lucide-react";
import { useBillings } from "../hooks/use-billing";
import type { BillingFilters } from "../dal/billing-types";

interface BillingListProps {
  filters?: BillingFilters;
}

export function BillingList({ filters = {} }: BillingListProps) {
  const { data: billings = [], isLoading } = useBillings(filters);

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      pending: "secondary",
      processing: "secondary",
      completed: "default",
      failed: "destructive",
      refunded: "outline",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const formatCurrency = (amount: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Loading billing records...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (billings.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No billing records found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing History</CardTitle>
        <CardDescription>Manage payments and invoices</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {billings.map((billing) => (
              <TableRow key={billing.id}>
                <TableCell>
                  {billing.created_at ? new Date(billing.created_at).toLocaleDateString() : "N/A"}
                </TableCell>
                <TableCell>{billing.description || "Payment"}</TableCell>
                <TableCell>
                  {formatCurrency(billing.amount, billing.currency || "USD")}
                </TableCell>
                <TableCell>{getStatusBadge(billing.status)}</TableCell>
                <TableCell>{billing.payment_method_id || "N/A"}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Receipt className="mr-2 h-4 w-4" />
                        View Invoice
                      </DropdownMenuItem>
                      {billing.status === "failed" && (
                        <DropdownMenuItem>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Retry Payment
                        </DropdownMenuItem>
                      )}
                      {billing.status === "completed" && (
                        <DropdownMenuItem>
                          <XCircle className="mr-2 h-4 w-4" />
                          Request Refund
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
