import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBillings,
  getBillingById,
  getInvoicesByBilling,
  getPaymentMethods,
  getDefaultPaymentMethod,
  getBillingStats,
  getUnpaidInvoices,
  getRevenueByDateRange,
} from "../dal/billing-queries";
import {
  createBilling,
  updateBilling,
  deleteBilling,
  processPayment,
  refundPayment,
  createInvoice,
  addPaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod,
  retryFailedPayment,
} from "../dal/billing-mutations";
import type {
  BillingFilters,
  BillingInsert,
  BillingUpdate,
  PaymentMethod,
} from "../dal/billing-types";

export function useBillings(filters: BillingFilters = {}) {
  return useQuery({
    queryKey: ["billing", filters],
    queryFn: () => getBillings(filters),
  });
}

export function useBilling(id: string) {
  return useQuery({
    queryKey: ["billing", id],
    queryFn: () => getBillingById(id),
    enabled: !!id,
  });
}

export function useInvoices(billingId: string) {
  return useQuery({
    queryKey: ["invoices", billingId],
    queryFn: () => getInvoicesByBilling(billingId),
    enabled: !!billingId,
  });
}

export function usePaymentMethods(customerId: string) {
  return useQuery({
    queryKey: ["payment-methods", customerId],
    queryFn: () => getPaymentMethods(customerId),
    enabled: !!customerId,
  });
}

export function useDefaultPaymentMethod(customerId: string) {
  return useQuery({
    queryKey: ["default-payment-method", customerId],
    queryFn: () => getDefaultPaymentMethod(customerId),
    enabled: !!customerId,
  });
}

export function useBillingStats(salonId: string) {
  return useQuery({
    queryKey: ["billing-stats", salonId],
    queryFn: () => getBillingStats(salonId),
    enabled: !!salonId,
  });
}

export function useUnpaidInvoices(customerId: string) {
  return useQuery({
    queryKey: ["unpaid-invoices", customerId],
    queryFn: () => getUnpaidInvoices(customerId),
    enabled: !!customerId,
  });
}

export function useRevenueData(
  salonId: string,
  startDate: string,
  endDate: string,
) {
  return useQuery({
    queryKey: ["revenue", salonId, startDate, endDate],
    queryFn: () => getRevenueByDateRange(salonId, startDate, endDate),
    enabled: !!salonId && !!startDate && !!endDate,
  });
}

export function useCreateBilling() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BillingInsert) => createBilling(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing"] });
    },
  });
}

export function useUpdateBilling() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BillingUpdate }) =>
      updateBilling(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing"] });
    },
  });
}

export function useDeleteBilling() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBilling(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing"] });
    },
  });
}

export function useProcessPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      billingId,
      paymentMethodId,
    }: {
      billingId: string;
      paymentMethodId: string;
    }) => processPayment(billingId, paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing"] });
    },
  });
}

export function useRefundPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      billingId,
      amount,
    }: {
      billingId: string;
      amount?: number;
    }) => refundPayment(billingId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing"] });
    },
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (billingId: string) => createInvoice(billingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useAddPaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      data,
    }: {
      customerId: string;
      data: Partial<PaymentMethod>;
    }) => addPaymentMethod(customerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    },
  });
}

export function useRemovePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentMethodId: string) =>
      removePaymentMethod(paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    },
  });
}

export function useSetDefaultPaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      paymentMethodId,
    }: {
      customerId: string;
      paymentMethodId: string;
    }) => setDefaultPaymentMethod(customerId, paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
      queryClient.invalidateQueries({ queryKey: ["default-payment-method"] });
    },
  });
}

export function useRetryPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (billingId: string) => retryFailedPayment(billingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing"] });
    },
  });
}
