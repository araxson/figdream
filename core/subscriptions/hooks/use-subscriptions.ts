import { useQuery } from "@tanstack/react-query";
import {
  getSubscriptionss,
  getSubscriptionsById,
} from "../dal/subscriptions-queries";
import type { SubscriptionsFilter } from "../dal/subscriptions-types";

export function useSubscriptionsList(filter: SubscriptionsFilter = {}) {
  return useQuery({
    queryKey: ["subscriptions", filter],
    queryFn: () => getSubscriptionss(filter),
  });
}

export function useSubscription(id: string) {
  return useQuery({
    queryKey: ["subscriptions", id],
    queryFn: () => getSubscriptionsById(id),
    enabled: !!id,
  });
}
