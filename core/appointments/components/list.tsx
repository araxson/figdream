"use client";

import { useState, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import type { AppointmentWithRelations, AppointmentStatus } from "@/core/appointments/types";
import { LoadingPatterns, EmptyState, useOptimisticUpdate, useKeyboardShortcuts } from "@/core/ui/components/production-polish";
import { toast } from "sonner";

interface AppointmentsListProps {
  appointments: AppointmentWithRelations[];
  onActionComplete?: () => void;
  loading?: boolean;
}

export function AppointmentsList({
  appointments,
  onActionComplete,
  loading = false,
}: AppointmentsListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Optimistic updates for appointment status changes
  const { data: optimisticAppointments, updateOptimistic } = useOptimisticUpdate(
    appointments,
    (current, update) => {
      return current.map(apt =>
        apt.id === update.appointmentId
          ? { ...apt, status: update.status }
          : apt
      );
    }
  );

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'n',
      ctrl: true,
      handler: () => {
        window.location.href = '/dashboard/appointments/new';
        toast.info('Creating new appointment...');
      }
    },
    {
      key: 'r',
      ctrl: true,
      handler: () => {
        onActionComplete?.();
        toast.info('Refreshing appointments...');
      }
    }
  ]);

  const getStatusBadge = (status: AppointmentStatus) => {
    const statusConfig: Record<
      AppointmentStatus,
      {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
      }
    > = {
      pending: { label: "Pending", variant: "secondary" },
      confirmed: { label: "Confirmed", variant: "default" },
      completed: { label: "Completed", variant: "default" },
      cancelled: { label: "Cancelled", variant: "destructive" },
      no_show: { label: "No Show", variant: "destructive" },
      rescheduled: { label: "Rescheduled", variant: "secondary" },
    };

    const config = statusConfig[status] || {
      label: status,
      variant: "secondary" as const,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleAction = async (action: string, appointmentId: string, newStatus?: AppointmentStatus) => {
    // Optimistic update if changing status
    if (newStatus) {
      await updateOptimistic(
        { appointmentId, status: newStatus },
        async () => {
          const response = await fetch(
            `/api/appointments/${appointmentId}/${action}`,
            {
              method: "POST",
            },
          );

          if (response.ok) {
            toast.success(getSuccessMessage(action));
            onActionComplete?.();
          } else {
            throw new Error('Failed to update appointment');
          }
        }
      );
    } else {
      // Non-status actions
      startTransition(async () => {
        setLoadingId(appointmentId);
        try {
          const response = await fetch(
            `/api/appointments/${appointmentId}/${action}`,
            {
              method: "POST",
            },
          );

          if (response.ok) {
            toast.success(getSuccessMessage(action));
            onActionComplete?.();
          }
        } catch (error) {
          toast.error(`Failed to ${action} appointment`);
        } finally {
          setLoadingId(null);
        }
      });
    }
  };

  const getSuccessMessage = (action: string) => {
    const messages: Record<string, string> = {
      confirm: 'Appointment confirmed successfully',
      complete: 'Appointment marked as completed',
      cancel: 'Appointment cancelled',
      reschedule: 'Appointment rescheduled',
      'mark-no-show': 'Marked as no-show',
    };
    return messages[action] || `Appointment ${action} successful`;
  };

  // Show loading state
  if (loading) {
    return <LoadingPatterns.Table rows={8} columns={7} />;
  }

  // Show empty state
  if (optimisticAppointments.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="No appointments scheduled"
        description="Your appointment calendar is clear. Start booking to see appointments here."
        action={{
          label: "Create Appointment",
          onClick: () => {
            window.location.href = "/dashboard/appointments/new";
          },
        }}
      />
    );
  }

  return (
    <div className="w-full">
      {isPending && (
        <div className="mb-2">
          <Badge variant="secondary" className="animate-pulse">
            <AlertCircle className="h-3 w-3 mr-1" />
            Updating appointments...
          </Badge>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date & Time</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Staff</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {optimisticAppointments.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell>
                <div>
                  <div className="font-medium">
                    {appointment.start_time
                      ? format(new Date(appointment.start_time), "MMM dd, yyyy")
                      : "No date"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {appointment.start_time
                      ? format(new Date(appointment.start_time), "h:mm a")
                      : ""}{" "}
                    -
                    {appointment.end_time
                      ? format(new Date(appointment.end_time), "h:mm a")
                      : ""}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">
                    {appointment.customer?.display_name || "Guest"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {appointment.customer?.email}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {appointment.services
                    ?.map((s) => s.service_name)
                    .join(", ") || "No services"}
                </div>
              </TableCell>
              <TableCell>
                {appointment.staff?.display_name || "Unassigned"}
              </TableCell>
              <TableCell>
                {getStatusBadge(appointment.status as AppointmentStatus)}
              </TableCell>
              <TableCell>${appointment.total_amount || 0}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={loadingId === appointment.id || isPending}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {appointment.status === "pending" && (
                      <DropdownMenuItem
                        onClick={() =>
                          appointment.id &&
                          handleAction("confirm", appointment.id, "confirmed")
                        }
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Confirm Appointment
                      </DropdownMenuItem>
                    )}
                    {appointment.status === "confirmed" && (
                      <DropdownMenuItem
                        onClick={() =>
                          appointment.id &&
                          handleAction("check-in", appointment.id, "confirmed")
                        }
                      >
                        <UserCheck className="mr-2 h-4 w-4" />
                        Check In Customer
                      </DropdownMenuItem>
                    )}
                    {appointment.status &&
                      ["checked_in", "in_progress", "confirmed"].includes(
                        appointment.status,
                      ) && (
                        <DropdownMenuItem
                          onClick={() =>
                            appointment.id &&
                            handleAction("complete", appointment.id, "completed")
                          }
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark as Complete
                        </DropdownMenuItem>
                      )}
                    <DropdownMenuSeparator />
                    {appointment.status &&
                      !["completed", "cancelled", "no_show"].includes(
                        appointment.status,
                      ) && (
                        <>
                          <DropdownMenuItem
                            onClick={() =>
                              appointment.id &&
                              handleAction("reschedule", appointment.id, "rescheduled")
                            }
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            Reschedule
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              appointment.id &&
                              handleAction("mark-no-show", appointment.id, "no_show")
                            }
                          >
                            <AlertCircle className="mr-2 h-4 w-4" />
                            Mark No-Show
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              appointment.id &&
                              handleAction("cancel", appointment.id, "cancelled")
                            }
                            className="text-destructive"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel Appointment
                          </DropdownMenuItem>
                        </>
                      )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
