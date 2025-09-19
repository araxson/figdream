import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import {
  getStaffMembers,
  getStaffMemberById,
  getStaffMemberByUserId,
  getStaffSchedules,
  getTimeOffRequests,
  getStaffBlockedTimes,
  getAvailableStaffForService,
  getStaffPerformance,
  getFeaturedStaff,
} from "../dal/staff-queries";
import type { StaffFilters, TimeOffFilters } from "../dal/staff-types";

export function useStaffMembers(filters: StaffFilters = {}) {
  return useQuery({
    queryKey: ["staff", "members", filters],
    queryFn: () => getStaffMembers(filters),
  });
}

export function useSuspenseStaffMembers(filters: StaffFilters = {}) {
  return useSuspenseQuery({
    queryKey: ["staff", "members", filters],
    queryFn: () => getStaffMembers(filters),
  });
}

export function useStaffMember(id: string) {
  return useQuery({
    queryKey: ["staff", "member", id],
    queryFn: () => getStaffMemberById(id),
    enabled: !!id,
  });
}

export function useStaffMemberByUserId(userId: string) {
  return useQuery({
    queryKey: ["staff", "member", "user", userId],
    queryFn: () => getStaffMemberByUserId(userId),
    enabled: !!userId,
  });
}

export function useStaffSchedules(staffId: string) {
  return useQuery({
    queryKey: ["staff", "schedules", staffId],
    queryFn: () => getStaffSchedules(staffId),
    enabled: !!staffId,
  });
}

export function useTimeOffRequests(filters: TimeOffFilters = {}) {
  return useQuery({
    queryKey: ["staff", "time-off", filters],
    queryFn: () => getTimeOffRequests(filters),
  });
}

export function useStaffBlockedTimes(
  staffId: string,
  startDate?: string,
  endDate?: string,
) {
  return useQuery({
    queryKey: ["staff", "blocked-times", staffId, startDate, endDate],
    queryFn: () => getStaffBlockedTimes(staffId, startDate, endDate),
    enabled: !!staffId,
  });
}

export function useAvailableStaff(
  serviceId: string,
  date: string,
  time = "09:00",
) {
  return useQuery({
    queryKey: ["staff", "available", serviceId, date, time],
    queryFn: () => getAvailableStaffForService(serviceId, date, time),
    enabled: !!serviceId && !!date,
  });
}

export function useStaffPerformance(
  staffId: string,
  startDate?: string,
  endDate?: string,
) {
  return useQuery({
    queryKey: ["staff", "performance", staffId, startDate, endDate],
    queryFn: () => getStaffPerformance(staffId, startDate, endDate),
    enabled: !!staffId,
  });
}

export function useFeaturedStaff(salonId: string) {
  return useQuery({
    queryKey: ["staff", "featured", salonId],
    queryFn: () => getFeaturedStaff(salonId),
    enabled: !!salonId,
  });
}
