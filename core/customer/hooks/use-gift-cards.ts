import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getGiftCards,
  getGiftCardById,
  getGiftCardByCode,
  validateGiftCard,
  getGiftCardTransactions,
  getGiftCardsByPurchaser,
  getGiftCardsByRecipient,
  getGiftCardStats,
  getExpiringGiftCards,
  searchGiftCards,
} from "../dal/gift-cards-queries";
import {
  createGiftCard,
  updateGiftCard,
  redeemGiftCard,
  refundToGiftCard,
  adjustGiftCardBalance,
  deactivateGiftCard,
  reactivateGiftCard,
  extendGiftCardValidity,
  sendGiftCardNotification,
} from "../dal/gift-cards-mutations";
import type {
  GiftCardFilters,
  GiftCardTransactionFilters,
  GiftCardInsert,
  GiftCardUpdate,
  GiftCardRedemptionRequest,
} from "../dal/gift-cards-types";

// Query hooks
export function useGiftCards(filters: GiftCardFilters = {}) {
  return useQuery({
    queryKey: ["gift-cards", filters],
    queryFn: () => getGiftCards(filters),
  });
}

export function useGiftCard(id: string) {
  return useQuery({
    queryKey: ["gift-card", id],
    queryFn: () => getGiftCardById(id),
    enabled: !!id,
  });
}

export function useGiftCardByCode(code: string) {
  return useQuery({
    queryKey: ["gift-card-code", code],
    queryFn: () => getGiftCardByCode(code),
    enabled: !!code && code.length > 0,
  });
}

export function useValidateGiftCard(code: string, amount?: number) {
  return useQuery({
    queryKey: ["validate-gift-card", code, amount],
    queryFn: () => validateGiftCard(code, amount),
    enabled: !!code && code.length > 0,
  });
}

export function useGiftCardTransactions(
  filters: GiftCardTransactionFilters = {},
) {
  return useQuery({
    queryKey: ["gift-card-transactions", filters],
    queryFn: () => getGiftCardTransactions(filters),
  });
}

export function useGiftCardsByPurchaser(purchaserId: string,
  limit = 20) {
  return useQuery({
    queryKey: ["gift-cards-purchaser", purchaserId, limit],
    queryFn: () => getGiftCardsByPurchaser(purchaserId, limit),
    enabled: !!purchaserId,
  });
}

export function useGiftCardsByRecipient(recipientEmail: string,
  limit = 20) {
  return useQuery({
    queryKey: ["gift-cards-recipient", recipientEmail, limit],
    queryFn: () => getGiftCardsByRecipient(recipientEmail, limit),
    enabled: !!recipientEmail,
  });
}

export function useGiftCardStats(salonId?: string) {
  return useQuery({
    queryKey: ["gift-card-stats", salonId],
    queryFn: () => getGiftCardStats(salonId),
  });
}

export function useExpiringGiftCards(daysUntilExpiry = 30, salonId?: string) {
  return useQuery({
    queryKey: ["expiring-gift-cards", daysUntilExpiry, salonId],
    queryFn: () => getExpiringGiftCards(daysUntilExpiry, salonId),
  });
}

export function useSearchGiftCards(
  query: string,
  salonId?: string,
  limit = 10,
) {
  return useQuery({
    queryKey: ["search-gift-cards", query, salonId, limit],
    queryFn: () => searchGiftCards(query, salonId, limit),
    enabled: !!query && query.length > 2,
  });
}

// Mutation hooks
export function useCreateGiftCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GiftCardInsert) => createGiftCard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gift-cards"] });
      queryClient.invalidateQueries({ queryKey: ["gift-card-stats"] });
      toast.success("Gift card created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create gift card");
      console.error(error);
    },
  });
}

export function useUpdateGiftCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: GiftCardUpdate }) =>
      updateGiftCard(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["gift-cards"] });
      queryClient.invalidateQueries({ queryKey: ["gift-card", variables.id] });
      toast.success("Gift card updated");
    },
    onError: (error) => {
      toast.error("Failed to update gift card");
      console.error(error);
    },
  });
}

export function useRedeemGiftCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (redemption: GiftCardRedemptionRequest) =>
      redeemGiftCard(redemption),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gift-cards"] });
      queryClient.invalidateQueries({ queryKey: ["gift-card-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["gift-card-stats"] });
      toast.success("Gift card redeemed successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to redeem gift card",
      );
      console.error(error);
    },
  });
}

export function useRefundToGiftCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      giftCardId,
      amount,
      appointmentId,
      notes,
    }: {
      giftCardId: string;
      amount: number;
      appointmentId?: string;
      notes?: string;
    }) => refundToGiftCard(giftCardId, amount, appointmentId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gift-cards"] });
      queryClient.invalidateQueries({ queryKey: ["gift-card-transactions"] });
      toast.success("Refund processed successfully");
    },
    onError: (error) => {
      toast.error("Failed to process refund");
      console.error(error);
    },
  });
}

export function useAdjustGiftCardBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      giftCardId,
      amount,
      reason,
    }: {
      giftCardId: string;
      amount: number;
      reason: string;
    }) => adjustGiftCardBalance(giftCardId, amount, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gift-cards"] });
      queryClient.invalidateQueries({ queryKey: ["gift-card-transactions"] });
      toast.success("Balance adjusted successfully");
    },
    onError: (error) => {
      toast.error("Failed to adjust balance");
      console.error(error);
    },
  });
}

export function useDeactivateGiftCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      deactivateGiftCard(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gift-cards"] });
      queryClient.invalidateQueries({ queryKey: ["gift-card-stats"] });
      toast.success("Gift card deactivated");
    },
    onError: (error) => {
      toast.error("Failed to deactivate gift card");
      console.error(error);
    },
  });
}

export function useReactivateGiftCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reactivateGiftCard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gift-cards"] });
      queryClient.invalidateQueries({ queryKey: ["gift-card-stats"] });
      toast.success("Gift card reactivated");
    },
    onError: (error) => {
      toast.error("Failed to reactivate gift card");
      console.error(error);
    },
  });
}

export function useExtendGiftCardValidity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      newValidUntil,
    }: {
      id: string;
      newValidUntil: string;
    }) => extendGiftCardValidity(id, newValidUntil),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gift-cards"] });
      queryClient.invalidateQueries({ queryKey: ["expiring-gift-cards"] });
      toast.success("Validity extended successfully");
    },
    onError: (error) => {
      toast.error("Failed to extend validity");
      console.error(error);
    },
  });
}

export function useSendGiftCardNotification() {
  return useMutation({
    mutationFn: ({
      giftCardId,
      type,
    }: {
      giftCardId: string;
      type: "purchase" | "reminder" | "expiry";
    }) => sendGiftCardNotification(giftCardId, type),
    onSuccess: () => {
      toast.success("Notification sent successfully");
    },
    onError: (error) => {
      toast.error("Failed to send notification");
      console.error(error);
    },
  });
}
