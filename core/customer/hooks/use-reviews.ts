import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import {
  getReviews,
  getReviewById,
  getReviewByAppointmentId,
  getReviewVotes,
  getReviewMetrics,
  getReviewInsights,
  getFeaturedReviews,
  getPendingReviews,
} from "../dal/reviews-queries";
import type { ReviewFilters, ReviewVoteFilters } from "../dal/reviews-types";

export function useReviews(filters: ReviewFilters = {}) {
  return useQuery({
    queryKey: ["reviews", filters],
    queryFn: () => getReviews(filters),
  });
}

export function useSuspenseReviews(filters: ReviewFilters = {}) {
  return useSuspenseQuery({
    queryKey: ["reviews", filters],
    queryFn: () => getReviews(filters),
  });
}

export function useReview(id: string) {
  return useQuery({
    queryKey: ["review", id],
    queryFn: () => getReviewById(id),
    enabled: !!id,
  });
}

export function useReviewByAppointment(appointmentId: string) {
  return useQuery({
    queryKey: ["review", "appointment", appointmentId],
    queryFn: () => getReviewByAppointmentId(appointmentId),
    enabled: !!appointmentId,
  });
}

export function useReviewVotes(filters: ReviewVoteFilters = {}) {
  return useQuery({
    queryKey: ["review-votes", filters],
    queryFn: () => getReviewVotes(filters),
  });
}

export function useReviewMetrics(salonId?: string) {
  return useQuery({
    queryKey: ["review-metrics", salonId],
    queryFn: () => getReviewMetrics(salonId || ""),
    enabled: !!salonId,
  });
}

export function useReviewInsights(salonId?: string) {
  return useQuery({
    queryKey: ["review-insights", salonId],
    queryFn: () => getReviewInsights(salonId || ""),
    enabled: !!salonId,
    staleTime: 1000 * 60 * 15, // Cache for 15 minutes
  });
}

export function useFeaturedReviews(salonId?: string, limit = 10) {
  return useQuery({
    queryKey: ["reviews", "featured", salonId, limit],
    queryFn: () => getFeaturedReviews(salonId, limit),
  });
}

export function usePendingReviews(salonId?: string) {
  return useQuery({
    queryKey: ["reviews", "pending", salonId],
    queryFn: () => getPendingReviews(salonId),
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
  });
}
