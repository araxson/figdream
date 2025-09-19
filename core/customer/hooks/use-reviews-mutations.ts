import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createReview,
  updateReview,
  updateReviewStatus,
  addReviewResponse,
  updateReviewResponse,
  removeReviewResponse,
  toggleReviewFeatured,
  toggleReviewVerified,
  upsertReviewVote,
  removeReviewVote,
  flagReview,
  deleteReview,
} from "../dal/reviews-mutations";
import type {
  ReviewInsert,
  ReviewUpdate,
  ReviewVoteInsert,
  ReviewResponse,
  ReviewStatus,
} from "../dal/reviews-types";

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReviewInsert) => createReview(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({
        queryKey: ["review", "appointment", variables.appointment_id],
      });
      toast.success("Review submitted successfully");
    },
    onError: (error) => {
      toast.error("Failed to submit review");
      console.error(error);
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReviewUpdate }) =>
      updateReview(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["review", variables.id] });
      toast.success("Review updated");
    },
    onError: (error) => {
      toast.error("Failed to update review");
      console.error(error);
    },
  });
}

export function useUpdateReviewStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReviewStatus }) =>
      updateReviewStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["review", variables.id] });
      const message =
        variables.status === ("published" as ReviewStatus)
          ? "Review published"
          : variables.status === ("rejected" as ReviewStatus)
            ? "Review rejected"
            : "Review status updated";
      toast.success(message);
    },
    onError: (error) => {
      toast.error("Failed to update review status");
      console.error(error);
    },
  });
}

export function useAddReviewResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, response }: { id: string; response: string }) =>
      addReviewResponse(id, response, undefined),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["review", variables.id] });
      toast.success("Response added");
    },
    onError: (error) => {
      toast.error("Failed to add response");
      console.error(error);
    },
  });
}

export function useUpdateReviewResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, response }: { id: string; response: string }) =>
      updateReviewResponse(id, response),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["review", variables.id] });
      toast.success("Response updated");
    },
    onError: (error) => {
      toast.error("Failed to update response");
      console.error(error);
    },
  });
}

export function useRemoveReviewResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeReviewResponse(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["review", id] });
      toast.success("Response removed");
    },
    onError: (error) => {
      toast.error("Failed to remove response");
      console.error(error);
    },
  });
}

export function useToggleReviewFeatured() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => toggleReviewFeatured(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["review", id] });
      toast.success("Featured status updated");
    },
    onError: (error) => {
      toast.error("Failed to update featured status");
      console.error(error);
    },
  });
}

export function useToggleReviewVerified() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => toggleReviewVerified(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["review", id] });
      toast.success("Verification status updated");
    },
    onError: (error) => {
      toast.error("Failed to update verification status");
      console.error(error);
    },
  });
}

export function useReviewVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vote: ReviewVoteInsert) => upsertReviewVote(vote),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({
        queryKey: ["review", variables.review_id],
      });
      queryClient.invalidateQueries({ queryKey: ["review-votes"] });
    },
    onError: (error) => {
      toast.error("Failed to submit vote");
      console.error(error);
    },
  });
}

export function useRemoveReviewVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, userId }: { reviewId: string; userId: string }) =>
      removeReviewVote(reviewId, userId),
    onSuccess: (_, { reviewId }) => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["review", reviewId] });
      queryClient.invalidateQueries({ queryKey: ["review-votes"] });
    },
    onError: (error) => {
      toast.error("Failed to remove vote");
      console.error(error);
    },
  });
}

export function useFlagReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      flagReview(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["review", variables.id] });
      toast.success("Review flagged for moderation");
    },
    onError: (error) => {
      toast.error("Failed to flag review");
      console.error(error);
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteReview(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["review", id] });
      toast.success("Review deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete review");
      console.error(error);
    },
  });
}
