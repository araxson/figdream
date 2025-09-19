import { createClient } from "@/lib/supabase/server";
import type {
  InventoryItem,
  InventoryItemWithRelations,
  InventoryFilters,
  InventoryListResponse,
  InventoryStats,
  InventoryTransaction,
} from "./inventory-types";

/**
 * Get inventory items with filters
 */
export async function getInventoryItems(
  filters: InventoryFilters = {},
): Promise<InventoryListResponse> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // For now, return mock data since inventory_items view doesn't exist yet
  // TODO: Implement when database view is available
  const mockItems: InventoryItemWithRelations[] = [];

  return {
    items: mockItems,
    total: 0,
    page: 1,
    limit: 20,
  };
}

/**
 * Get single inventory item by ID
 */
export async function getInventoryItem(
  itemId: string,
): Promise<InventoryItemWithRelations | null> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement when database view is available
  return null;
}

/**
 * Get inventory statistics
 */
export async function getInventoryStats(
  salonId?: string,
): Promise<InventoryStats> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement when database view is available
  return {
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    expiringItems: 0,
    categories: [],
  };
}

/**
 * Get low stock items
 */
export async function getLowStockItems(
  salonId?: string,
): Promise<InventoryItemWithRelations[]> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement when database view is available
  return [];
}

/**
 * Get expiring items
 */
export async function getExpiringItems(
  salonId?: string,
  daysAhead = 30,
): Promise<InventoryItemWithRelations[]> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement when database view is available
  return [];
}

/**
 * Get inventory transactions
 */
export async function getInventoryTransactions(
  itemId?: string,
  limit = 50,
): Promise<InventoryTransaction[]> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement when database view is available
  return [];
}

/**
 * Search inventory items
 */
export async function searchInventoryItems(
  searchTerm: string,
  salonId?: string,
): Promise<InventoryItemWithRelations[]> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement when database view is available
  return [];
}
