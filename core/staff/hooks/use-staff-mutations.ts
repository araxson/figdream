import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createStaffProfile,
  updateStaffProfile,
  deactivateStaffMember,
  toggleStaffFeatured,
  toggleStaffBookable,
  updateStaffSchedule,
  createTimeOffRequest,
  updateTimeOffRequest,
  approveTimeOffRequest,
  rejectTimeOffRequest,
  cancelTimeOffRequest,
  createBlockedTime,
  updateBlockedTime,
  removeBlockedTime,
  updateStaffCommission,
} from "../dal/staff-mutations";
import type {
  StaffProfileInsert,
  StaffProfileUpdate,
  StaffScheduleInsert,
  StaffScheduleUpdate,
  TimeOffRequestInsert,
  TimeOffRequestUpdate,
  BlockedTimeInsert,
  BlockedTimeUpdate,
} from "../dal/staff.types";

export function useCreateStaffProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StaffProfileInsert) => createStaffProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success("Staff member added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add staff member");
      console.error(error);
    },
  });
}

export function useUpdateStaffProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StaffProfileUpdate }) =>
      updateStaffProfile(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({
        queryKey: ["staff", "member", variables.id],
      });
      toast.success("Staff profile updated");
    },
    onError: (error) => {
      toast.error("Failed to update staff profile");
      console.error(error);
    },
  });
}

export function useDeactivateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deactivateStaffMember(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["staff", "member", id] });
      toast.success("Staff member deactivated");
    },
    onError: (error) => {
      toast.error("Failed to deactivate staff member");
      console.error(error);
    },
  });
}

export function useToggleStaffFeatured() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => toggleStaffFeatured(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["staff", "member", id] });
      toast.success("Featured status updated");
    },
    onError: (error) => {
      toast.error("Failed to update featured status");
      console.error(error);
    },
  });
}

export function useToggleStaffBookable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => toggleStaffBookable(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["staff", "member", id] });
      toast.success("Bookable status updated");
    },
    onError: (error) => {
      toast.error("Failed to update bookable status");
      console.error(error);
    },
  });
}

export function useUpdateStaffSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: StaffScheduleUpdate;
    }) => updateStaffSchedule(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["staff", "schedules"] });
      toast.success("Schedule updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update schedule");
      console.error(error);
    },
  });
}

export function useCreateTimeOffRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TimeOffRequestInsert) => createTimeOffRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", "time-off"] });
      toast.success("Time off request submitted");
    },
    onError: (error) => {
      toast.error("Failed to submit time off request");
      console.error(error);
    },
  });
}

export function useApproveTimeOff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      approveTimeOffRequest(id, notes || "system"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", "time-off"] });
      toast.success("Time off request approved");
    },
    onError: (error) => {
      toast.error("Failed to approve time off request");
      console.error(error);
    },
  });
}

export function useRejectTimeOff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, rejectedBy, notes }: { id: string; rejectedBy: string; notes?: string }) =>
      rejectTimeOffRequest(id, rejectedBy, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", "time-off"] });
      toast.success("Time off request rejected");
    },
    onError: (error) => {
      toast.error("Failed to reject time off request");
      console.error(error);
    },
  });
}

export function useCancelTimeOff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelTimeOffRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", "time-off"] });
      toast.success("Time off request cancelled");
    },
    onError: (error) => {
      toast.error("Failed to cancel time off request");
      console.error(error);
    },
  });
}

export function useCreateBlockedTime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BlockedTimeInsert) => createBlockedTime(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: ["staff", "blocked-times", data.staff_id],
      });
      toast.success("Blocked time added");
    },
    onError: (error) => {
      toast.error("Failed to add blocked time");
      console.error(error);
    },
  });
}

export function useUpdateBlockedTime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BlockedTimeUpdate }) =>
      updateBlockedTime(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", "blocked-times"] });
      toast.success("Blocked time updated");
    },
    onError: (error) => {
      toast.error("Failed to update blocked time");
      console.error(error);
    },
  });
}

export function useRemoveBlockedTime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeBlockedTime(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", "blocked-times"] });
      toast.success("Blocked time removed");
    },
    onError: (error) => {
      toast.error("Failed to remove blocked time");
      console.error(error);
    },
  });
}

export function useUpdateStaffCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, rate }: { id: string; rate: number }) =>
      updateStaffCommission(id, rate),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({
        queryKey: ["staff", "member", variables.id],
      });
      toast.success("Commission rate updated");
    },
    onError: (error) => {
      toast.error("Failed to update commission rate");
      console.error(error);
    },
  });
}
