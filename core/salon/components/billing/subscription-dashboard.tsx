"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CreditCard,
  Calendar,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause,
  Play
} from "lucide-react";

interface Subscription {
  id: string;
  salon_id: string;
  customer_id: string;
  stripe_subscription_id: string;
  plan_id: string;
  status: "active" | "cancelled" | "past_due" | "trialing" | "incomplete";
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  trial_end?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  salon?: {
    id: string;
    name: string;
    business_name: string;
  };
  customer?: {
    id: string;
    email: string;
  };
}

interface SubscriptionDashboardProps {
  subscriptions: Subscription[];
  onCancelSubscription: (subscriptionId: string, cancelAtPeriodEnd: boolean) => Promise<void>;
  onReactivateSubscription: (subscriptionId: string) => Promise<void>;
  onUpdateSubscription: (subscriptionId: string, updates: any) => Promise<void>;
  isLoading?: boolean;
}

export function SubscriptionDashboard({
  subscriptions,
  onCancelSubscription,
  onReactivateSubscription,
  onUpdateSubscription,
  isLoading = false,
}: SubscriptionDashboardProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  const filteredSubscriptions = subscriptions.filter((sub) => {
    return statusFilter === "all" || sub.status === statusFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "trialing":
        return "bg-blue-100 text-blue-800";
      case "past_due":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      case "incomplete":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "trialing":
        return <Play className="h-4 w-4 text-blue-600" />;
      case "past_due":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-gray-600" />;
      case "incomplete":
        return <Pause className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Calculate summary statistics
  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.status === "active").length,
    trialing: subscriptions.filter(s => s.status === "trialing").length,
    pastDue: subscriptions.filter(s => s.status === "past_due").length,
    cancelled: subscriptions.filter(s => s.status === "cancelled").length,
    monthlyRevenue: subscriptions
      .filter(s => s.status === "active")
      .reduce((total, sub) => {
        const monthlyAmount = sub.metadata?.monthly_amount || 0;
        return total + Number(monthlyAmount);
      }, 0),
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trial</CardTitle>
            <Play className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.trialing}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Past Due</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.pastDue}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Subscriptions</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trialing">Trial</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
              </SelectContent>
            </Select>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {statusFilter !== "all"
                ? `No ${statusFilter} subscriptions found`
                : "No subscriptions found"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Salon</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current Period</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      {subscription.customer?.email || subscription.customer_id}
                    </TableCell>
                    <TableCell>
                      {subscription.salon?.business_name || subscription.salon?.name || subscription.salon_id}
                    </TableCell>
                    <TableCell>{subscription.plan_id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(subscription.status)}
                        <Badge className={getStatusColor(subscription.status)}>
                          {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                        </Badge>
                        {subscription.cancel_at_period_end && (
                          <Badge variant="outline" className="text-orange-600 border-orange-600">
                            Cancelling
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(subscription.current_period_start)}</div>
                        <div className="text-muted-foreground">
                          to {formatDate(subscription.current_period_end)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedSubscription(subscription)}
                          >
                            Manage
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Manage Subscription</DialogTitle>
                          </DialogHeader>
                          {selectedSubscription && (
                            <SubscriptionDetails
                              subscription={selectedSubscription}
                              onCancel={onCancelSubscription}
                              onReactivate={onReactivateSubscription}
                              onUpdate={onUpdateSubscription}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Subscription Details Component
function SubscriptionDetails({
  subscription,
  onCancel,
  onReactivate,
  onUpdate,
}: {
  subscription: Subscription;
  onCancel: (id: string, cancelAtPeriodEnd: boolean) => Promise<void>;
  onReactivate: (id: string) => Promise<void>;
  onUpdate: (id: string, updates: any) => Promise<void>;
}) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCancel = async (cancelAtPeriodEnd: boolean) => {
    setIsProcessing(true);
    try {
      await onCancel(subscription.id, cancelAtPeriodEnd);
    } catch (error) {
      console.error("Error cancelling subscription:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReactivate = async () => {
    setIsProcessing(true);
    try {
      await onReactivate(subscription.id);
    } catch (error) {
      console.error("Error reactivating subscription:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Subscription Info */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Subscription Details</h3>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Plan:</span> {subscription.plan_id}</div>
            <div><span className="font-medium">Status:</span>
              <Badge className={`ml-2 ${getStatusColor(subscription.status)}`}>
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </Badge>
            </div>
            <div><span className="font-medium">Current Period:</span></div>
            <div className="ml-4">
              {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
            </div>
            {subscription.trial_end && (
              <div><span className="font-medium">Trial Ends:</span> {formatDate(subscription.trial_end)}</div>
            )}
            {subscription.metadata?.monthly_amount && (
              <div>
                <span className="font-medium">Monthly Amount:</span> {formatCurrency(subscription.metadata.monthly_amount)}
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Customer & Salon</h3>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Customer:</span> {subscription.customer?.email || subscription.customer_id}</div>
            <div><span className="font-medium">Salon:</span> {subscription.salon?.business_name || subscription.salon?.name || subscription.salon_id}</div>
            <div><span className="font-medium">Created:</span> {formatDate(subscription.created_at)}</div>
            <div><span className="font-medium">Last Updated:</span> {formatDate(subscription.updated_at)}</div>
          </div>
        </div>
      </div>

      {/* Status Alerts */}
      {subscription.cancel_at_period_end && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This subscription is set to cancel at the end of the current period ({formatDate(subscription.current_period_end)}).
          </AlertDescription>
        </Alert>
      )}

      {subscription.status === "past_due" && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This subscription is past due. The customer needs to update their payment method.
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t">
        {subscription.status === "active" && !subscription.cancel_at_period_end && (
          <>
            <Button
              variant="outline"
              onClick={() => handleCancel(true)}
              disabled={isProcessing}
            >
              Cancel at Period End
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleCancel(false)}
              disabled={isProcessing}
            >
              Cancel Immediately
            </Button>
          </>
        )}

        {subscription.cancel_at_period_end && (
          <Button
            onClick={handleReactivate}
            disabled={isProcessing}
          >
            Reactivate Subscription
          </Button>
        )}

        {subscription.status === "cancelled" && (
          <Button
            onClick={handleReactivate}
            disabled={isProcessing}
          >
            Reactivate Subscription
          </Button>
        )}
      </div>
    </div>
  );

  function getStatusColor(status: string) {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "trialing":
        return "bg-blue-100 text-blue-800";
      case "past_due":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      case "incomplete":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }
}