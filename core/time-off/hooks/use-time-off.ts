import { useQuery } from "@tanstack/react-query";
import { getTimeOffs, getTimeOffById } from "../dal/time-off-queries";
import type { TimeOffFilter } from "../dal/time-off-types";

export function useTimeOffList(filter: TimeOffFilter = {}) {
  return useQuery({
    queryKey: ["time-off", filter],
    queryFn: () => getTimeOffs(filter),
  });
}

export function useTimeOff(id: string) {
  return useQuery({
    queryKey: ["time-off", id],
    queryFn: () => getTimeOffById(id),
    enabled: !!id,
  });
}
