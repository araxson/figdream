import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createAppointment,
  updateAppointment,
  cancelAppointment,
  confirmAppointment,
  checkInAppointment,
  completeAppointment,
  noShowAppointment,
  rescheduleAppointment,
  addAppointmentServices,
  removeAppointmentService,
} from "../dal/appointments-mutations";
import type {
  AppointmentInsert,
  AppointmentUpdate,
  AppointmentServiceInsert,
} from "../dal/appointments-types";

/**
 * Hook to create a new appointment
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointment: AppointmentInsert) =>
      createAppointment(appointment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

/**
 * Hook to update an appointment
 */
export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: AppointmentUpdate;
    }) => updateAppointment(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointments", id] });
    },
  });
}

/**
 * Hook to cancel an appointment
 */
export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      cancelAppointment(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointments", id] });
    },
  });
}

/**
 * Hook to confirm an appointment
 */
export function useConfirmAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => confirmAppointment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointments", id] });
    },
  });
}

/**
 * Hook to check in an appointment
 */
export function useCheckInAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => checkInAppointment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointments", id] });
    },
  });
}

/**
 * Hook to complete an appointment
 */
export function useCompleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => completeAppointment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointments", id] });
    },
  });
}

/**
 * Hook to mark appointment as no-show
 */
export function useMarkNoShow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => noShowAppointment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointments", id] });
    },
  });
}

/**
 * Hook to reschedule an appointment
 */
export function useRescheduleAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      scheduled_at,
      duration_minutes,
      staff_id,
      reason,
    }: {
      id: string;
      scheduled_at: string;
      duration_minutes: number;
      staff_id?: string;
      reason?: string;
    }) => rescheduleAppointment(id, { scheduled_at, duration_minutes, staff_id, reason }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointments", id] });
    },
  });
}

/**
 * Hook to add services to an appointment
 */
export function useAddAppointmentServices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
      services,
    }: {
      appointmentId: string;
      services: AppointmentServiceInsert[];
    }) => addAppointmentServices(appointmentId, services),
    onSuccess: (_, { appointmentId }) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({
        queryKey: ["appointments", appointmentId],
      });
    },
  });
}

/**
 * Hook to remove a service from an appointment
 */
export function useRemoveAppointmentService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appointmentId, serviceId }: { appointmentId: string; serviceId: string }) =>
      removeAppointmentService(appointmentId, serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}
