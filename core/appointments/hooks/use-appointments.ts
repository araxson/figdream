import { useQuery } from "@tanstack/react-query";
import {
  getAppointments,
  getAppointmentById,
  getAppointmentsByDate,
  getCustomerUpcomingAppointments,
  getStaffDayAppointments,
  checkAvailability,
} from "../dal/appointments-queries";
import type { AppointmentFilters } from "../dal/appointments-types";

/**
 * Hook to fetch appointments with filters
 */
export function useAppointments(filters: AppointmentFilters = {}) {
  return useQuery({
    queryKey: ["appointments", filters],
    queryFn: () => getAppointments(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch a single appointment
 */
export function useAppointment(id: string) {
  return useQuery({
    queryKey: ["appointments", id],
    queryFn: () => getAppointmentById(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch appointments by date
 */
export function useAppointmentsByDate(date: string, salonId?: string) {
  return useQuery({
    queryKey: ["appointments", "date", date, salonId],
    queryFn: () => getAppointmentsByDate(date, salonId),
    enabled: !!date,
  });
}

/**
 * Hook to fetch customer's upcoming appointments
 */
export function useCustomerAppointments(customerId: string) {
  return useQuery({
    queryKey: ["appointments", "customer", customerId],
    queryFn: () => getCustomerUpcomingAppointments(customerId),
    enabled: !!customerId,
  });
}

/**
 * Hook to fetch staff appointments for a specific day
 */
export function useStaffDayAppointments(staffId: string, date: string) {
  return useQuery({
    queryKey: ["appointments", "staff", staffId, date],
    queryFn: () => getStaffDayAppointments(staffId, date),
    enabled: !!staffId && !!date,
  });
}

/**
 * Hook to check appointment availability
 */
export function useCheckAvailability(
  salonId: string,
  staffId: string,
  startTime: string,
  endTime: string,
) {
  return useQuery({
    queryKey: [
      "appointments",
      "availability",
      salonId,
      staffId,
      startTime,
      endTime,
    ],
    queryFn: () => checkAvailability(staffId, startTime, endTime),
    enabled: !!salonId && !!staffId && !!startTime && !!endTime,
  });
}
