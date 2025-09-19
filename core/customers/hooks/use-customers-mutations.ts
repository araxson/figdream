import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  updateCustomerProfile,
  upsertCustomerPreferences,
  addCustomerFavorite,
  removeCustomerFavorite,
  toggleFavorite,
  addCustomerNote,
  updateCustomerNote,
  deleteCustomerNote,
  addLoyaltyPoints,
  redeemLoyaltyPoints,
  markCustomerAsVIP,
  removeVIPStatus,
} from "../dal/customers-mutations";
import type {
  CustomerProfileUpdate,
  CustomerPreferenceInsert,
  CustomerFavoriteInsert,
  CustomerNoteInsert,
  CustomerNoteUpdate,
  FavoriteType,
} from "../dal/customers-types";

export function useUpdateCustomerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CustomerProfileUpdate }) =>
      updateCustomerProfile(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer", variables.id] });
      toast.success("Customer profile updated");
    },
    onError: (error) => {
      toast.error("Failed to update customer profile");
      console.error(error);
    },
  });
}

export function useUpsertCustomerPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      preferences,
    }: {
      customerId: string;
      preferences: Omit<CustomerPreferenceInsert, "customer_id">;
    }) => upsertCustomerPreferences(customerId, preferences),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customer-preferences"] });
      queryClient.invalidateQueries({
        queryKey: ["customer", variables.customerId],
      });
      toast.success("Preferences updated");
    },
    onError: (error) => {
      toast.error("Failed to update preferences");
      console.error(error);
    },
  });
}

export function useAddCustomerFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CustomerFavoriteInsert) => addCustomerFavorite(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customer-favorites"] });
      queryClient.invalidateQueries({
        queryKey: ["customer", variables.customer_id],
      });
      toast.success("Added to favorites");
    },
    onError: (error) => {
      toast.error("Failed to add favorite");
      console.error(error);
    },
  });
}

export function useRemoveCustomerFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      type,
      targetId,
    }: {
      customerId: string;
      type: FavoriteType;
      targetId: string;
    }) => toggleFavorite(customerId, targetId, type),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customer-favorites"] });
      queryClient.invalidateQueries({
        queryKey: ["customer", variables.customerId],
      });
      toast.success("Removed from favorites");
    },
    onError: (error) => {
      toast.error("Failed to remove favorite");
      console.error(error);
    },
  });
}

export function useAddCustomerNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CustomerNoteInsert) => addCustomerNote(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["customer", variables.customer_id, "notes"],
      });
      toast.success("Note added");
    },
    onError: (error) => {
      toast.error("Failed to add note");
      console.error(error);
    },
  });
}

export function useUpdateCustomerNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CustomerNoteUpdate }) =>
      updateCustomerNote(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer"] });
      toast.success("Note updated");
    },
    onError: (error) => {
      toast.error("Failed to update note");
      console.error(error);
    },
  });
}

export function useDeleteCustomerNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCustomerNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer"] });
      toast.success("Note deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete note");
      console.error(error);
    },
  });
}

export function useAddLoyaltyPoints() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      points,
      description,
      referenceId,
    }: {
      customerId: string;
      points: number;
      description: string;
      referenceId?: string;
    }) => addLoyaltyPoints(customerId, points, description, referenceId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["customer", variables.customerId, "loyalty"],
      });
      queryClient.invalidateQueries({
        queryKey: ["customer", variables.customerId, "loyalty-transactions"],
      });
      toast.success("Loyalty points added");
    },
    onError: (error) => {
      toast.error("Failed to add loyalty points");
      console.error(error);
    },
  });
}

export function useRedeemLoyaltyPoints() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      points,
      description,
      referenceId,
    }: {
      customerId: string;
      points: number;
      description: string;
      referenceId?: string;
    }) => redeemLoyaltyPoints(customerId, points, description, referenceId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["customer", variables.customerId, "loyalty"],
      });
      queryClient.invalidateQueries({
        queryKey: ["customer", variables.customerId, "loyalty-transactions"],
      });
      toast.success("Loyalty points redeemed");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to redeem loyalty points",
      );
      console.error(error);
    },
  });
}

export function useToggleVIPStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      isVIP,
    }: {
      customerId: string;
      isVIP: boolean;
    }) => (isVIP ? removeVIPStatus(customerId) : markCustomerAsVIP(customerId)),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({
        queryKey: ["customer", variables.customerId],
      });
      toast.success(variables.isVIP ? "VIP status removed" : "Marked as VIP");
    },
    onError: (error) => {
      toast.error("Failed to update VIP status");
      console.error(error);
    },
  });
}
