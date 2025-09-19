import { useQuery } from "@tanstack/react-query";
import { getProfile, getStaffProfile } from "../dal/profiles-queries";

export function useProfile(userId: string) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => getProfile(userId),
    enabled: !!userId,
  });
}

export function useStaffProfile(staffId: string) {
  return useQuery({
    queryKey: ["staff-profile", staffId],
    queryFn: () => getStaffProfile(staffId),
    enabled: !!staffId,
  });
}
