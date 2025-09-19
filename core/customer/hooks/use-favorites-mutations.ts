import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createFavorite,
  updateFavorite,
  deleteFavorite,
  toggleFavorite,
} from "../dal/favorites-mutations";
import type { FavoriteInsert, FavoriteUpdate } from "../dal/favorites-types";

export function useCreateFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FavoriteInsert) => createFavorite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast.success("Added to favorites");
    },
    onError: (error) => {
      toast.error("Failed to add to favorites");
      console.error("Create favorite error:", error);
    },
  });
}

export function useUpdateFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FavoriteUpdate }) =>
      updateFavorite(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast.success("Favorite updated");
    },
    onError: (error) => {
      toast.error("Failed to update favorite");
      console.error("Update favorite error:", error);
    },
  });
}

export function useDeleteFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast.success("Removed from favorites");
    },
    onError: (error) => {
      toast.error("Failed to remove from favorites");
      console.error("Delete favorite error:", error);
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleFavorite,
    onSuccess: ({ added }) => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast.success(added ? "Added to favorites" : "Removed from favorites");
    },
    onError: (error) => {
      toast.error("Failed to update favorites");
      console.error("Toggle favorite error:", error);
    },
  });
}
