import { useQuery } from "@tanstack/react-query";
import { getScheduless, getSchedulesById } from "../dal/schedules-queries";
import type { SchedulesFilter } from "../dal/schedules-types";

export function useSchedulesList(filter: SchedulesFilter = {}) {
  return useQuery({
    queryKey: ["schedules", filter],
    queryFn: () => getScheduless(filter),
  });
}

export function useSchedule(id: string) {
  return useQuery({
    queryKey: ["schedules", id],
    queryFn: () => getSchedulesById(id),
    enabled: !!id,
  });
}
