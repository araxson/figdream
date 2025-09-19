/**
 * Loyalty Mutation Hooks
 * Optimistic updates and cache management for write operations
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createProgram,
  updateProgram,
  deleteProgram,
  enrollCustomerInProgram,
  updateCustomerLoyaltyAction,
  addLoyaltyTransactionAction,
  awardPointsForAppointmentAction,
  redeemLoyaltyPoints,
  adjustPointsAction
} from "../actions";
import type {
  LoyaltyProgram,
  CustomerLoyalty,
  LoyaltyTransaction,
  LoyaltyProgramInsert,
  LoyaltyProgramUpdate,
  CustomerLoyaltyInsert,
  CustomerLoyaltyUpdate,
  LoyaltyTransactionInsert
} from "../dal";

/**
 * Hook to create a loyalty program
 */
export function useCreateLoyaltyProgram() {
  const queryClient = useQueryClient();

  return useMutation<LoyaltyProgram, Error, LoyaltyProgramInsert>({
    mutationFn: async (data) => {
      const response = await createProgram(data);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to create loyalty program");
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["loyalty-program", data.salon_id]
      });
      queryClient.invalidateQueries({
        queryKey: ["loyalty-dashboard", data.salon_id]
      });
      toast.success("Loyalty program created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create loyalty program");
    }
  });
}

/**
 * Hook to update a loyalty program
 */
export function useUpdateLoyaltyProgram() {
  const queryClient = useQueryClient();

  return useMutation<
    LoyaltyProgram,
    Error,
    { id: string; data: LoyaltyProgramUpdate }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await updateProgram(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to update loyalty program");
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["loyalty-program", data.salon_id]
      });
      queryClient.invalidateQueries({
        queryKey: ["loyalty-dashboard", data.salon_id]
      });
      toast.success("Loyalty program updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update loyalty program");
    }
  });
}

/**
 * Hook to delete a loyalty program
 */
export function useDeleteLoyaltyProgram() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; salonId: string }>({
    mutationFn: async ({ id }) => {
      const response = await deleteProgram(id);
      if (!response.success) {
        throw new Error(response.error || "Failed to delete loyalty program");
      }
    },
    onSuccess: (_, { salonId }) => {
      queryClient.invalidateQueries({
        queryKey: ["loyalty-program", salonId]
      });
      queryClient.invalidateQueries({
        queryKey: ["loyalty-dashboard", salonId]
      });
      toast.success("Loyalty program deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete loyalty program");
    }
  });
}

/**
 * Hook to enroll a customer in a loyalty program
 */
export function useEnrollCustomer() {
  const queryClient = useQueryClient();

  return useMutation<CustomerLoyalty, Error, CustomerLoyaltyInsert>({
    mutationFn: async (data) => {
      const response = await enrollCustomerInProgram(data);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to enroll customer");
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["customer-loyalty", data.customer_id, data.program_id]
      });
      queryClient.invalidateQueries({
        queryKey: ["program-members", data.program_id]
      });
      toast.success("Customer enrolled successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to enroll customer");
    }
  });
}

/**
 * Hook to update customer loyalty details
 */
export function useUpdateCustomerLoyalty() {
  const queryClient = useQueryClient();

  return useMutation<
    CustomerLoyalty,
    Error,
    { id: string; data: CustomerLoyaltyUpdate }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await updateCustomerLoyaltyAction(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to update customer loyalty");
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["customer-loyalty", data.customer_id, data.program_id]
      });
      queryClient.invalidateQueries({
        queryKey: ["program-members", data.program_id]
      });
      toast.success("Customer loyalty updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update customer loyalty");
    }
  });
}

/**
 * Hook to add a loyalty transaction
 */
export function useAddLoyaltyTransaction() {
  const queryClient = useQueryClient();

  return useMutation<LoyaltyTransaction, Error, LoyaltyTransactionInsert>({
    mutationFn: async (data) => {
      const response = await addLoyaltyTransactionAction(data);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to add transaction");
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["customer-transactions", data.customer_loyalty_id]
      });
      queryClient.invalidateQueries({
        queryKey: ["customer-loyalty"]
      });
      queryClient.invalidateQueries({
        queryKey: ["loyalty-dashboard"]
      });

      const message = data.transaction_type === "earned"
        ? `+${data.points_amount} points earned`
        : data.transaction_type === "redeemed"
        ? `${data.points_amount} points redeemed`
        : "Transaction completed";

      toast.success(message);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to process transaction");
    }
  });
}

/**
 * Hook to award points for an appointment
 */
export function useAwardPointsForAppointment() {
  const queryClient = useQueryClient();

  return useMutation<
    LoyaltyTransaction | null,
    Error,
    {
      appointmentId: string;
      customerId: string;
      salonId: string;
      amount: number;
    }
  >({
    mutationFn: async ({ appointmentId, customerId, salonId, amount }) => {
      const response = await awardPointsForAppointmentAction(appointmentId, customerId, salonId, amount);
      if (!response.success) {
        throw new Error(response.error || "Failed to award points");
      }
      return response.data || null;
    },
    onSuccess: (data, variables) => {
      if (data) {
        queryClient.invalidateQueries({
          queryKey: ["customer-transactions", data.customer_loyalty_id]
        });
        queryClient.invalidateQueries({
          queryKey: ["customer-loyalty", variables.customerId]
        });
        toast.success(`Points awarded: +${data.points_amount}`);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to award points");
    }
  });
}

/**
 * Hook to redeem loyalty points
 */
export function useRedeemPoints() {
  const queryClient = useQueryClient();

  return useMutation<
    LoyaltyTransaction,
    Error,
    {
      customerLoyaltyId: string;
      points: number;
      description: string;
      referenceId?: string;
      referenceType?: string;
    }
  >({
    mutationFn: async ({ customerLoyaltyId, points, description, referenceId, referenceType }) => {
      const response = await redeemLoyaltyPoints({
        customer_loyalty_id: customerLoyaltyId,
        points,
        description,
        reward_id: referenceId,
        appointment_id: referenceType === 'appointment' ? referenceId : undefined
      });
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to redeem points");
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["customer-transactions", data.customer_loyalty_id]
      });
      queryClient.invalidateQueries({
        queryKey: ["customer-loyalty"]
      });
      queryClient.invalidateQueries({
        queryKey: ["loyalty-dashboard"]
      });
      toast.success(`${data.points_amount} points redeemed successfully`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to redeem points");
    }
  });
}

/**
 * Hook to adjust points manually
 */
export function useAdjustPoints() {
  const queryClient = useQueryClient();

  return useMutation<
    LoyaltyTransaction,
    Error,
    {
      customerLoyaltyId: string;
      points: number;
      description: string;
    }
  >({
    mutationFn: async ({ customerLoyaltyId, points, description }) => {
      const response = await adjustPointsAction(customerLoyaltyId, points, description);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to adjust points");
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["customer-transactions", data.customer_loyalty_id]
      });
      queryClient.invalidateQueries({
        queryKey: ["customer-loyalty"]
      });
      queryClient.invalidateQueries({
        queryKey: ["loyalty-dashboard"]
      });

      const message = data.points_amount > 0
        ? `+${data.points_amount} points added`
        : `${Math.abs(data.points_amount)} points removed`;

      toast.success(message);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to adjust points");
    }
  });
}