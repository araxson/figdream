import type { ProfileWithRelations } from "../../dal/users-types";

export const getStatusColor = (user: ProfileWithRelations) => {
  if (user.deleted_at) return "destructive";
  if (!user.is_active) return "secondary";
  if (!user.is_verified) return "outline";
  return "default";
};

export const getStatusLabel = (user: ProfileWithRelations) => {
  if (user.deleted_at) return "Suspended";
  if (user.is_active) return "Active";
  return "Inactive";
};

export const getUserInitials = (user: ProfileWithRelations) => {
  const firstInitial = user.first_name?.[0] || "";
  const lastInitial = user.last_name?.[0] || "";
  return `${firstInitial}${lastInitial}`.toUpperCase();
};

export const formatDate = (date: string | null | undefined) => {
  if (!date) return "Never";
  return new Date(date).toLocaleDateString();
};

export const formatDateTime = (date: string | null | undefined) => {
  if (!date) return "Never";
  return new Date(date).toLocaleString();
};

export const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) return "$0.00";
  return `$${amount.toFixed(2)}`;
};