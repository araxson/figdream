import { createClient } from "@/lib/supabase/server";
import type {
  InventoryItemInsert,
  InventoryItemUpdate,
  StockAdjustment,
  InventoryItem,
  InventoryTransaction,
} from "./inventory-types";

/**
 * Create new inventory item
 */
export async function createInventoryItem(
  item: InventoryItemInsert,
): Promise<InventoryItem> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement when database table is available
  // For now, return mock data
  return {
    ...item,
    id: crypto.randomUUID(),
    is_active: item.is_active ?? true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Update inventory item
 */
export async function updateInventoryItem(
  item: InventoryItemUpdate,
): Promise<InventoryItem> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement when database table is available
  return {
    ...item,
    product_name: item.product_name || "Unknown",
    quantity_in_stock: item.quantity_in_stock || 0,
    is_active: item.is_active ?? true,
    salon_id: item.salon_id || "",
    updated_at: new Date().toISOString(),
  } as InventoryItem;
}

/**
 * Delete inventory item
 */
export async function deleteInventoryItem(itemId: string): Promise<void> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement when database table is available
}

/**
 * Adjust stock levels
 */
export async function adjustStock(
  adjustment: StockAdjustment,
): Promise<InventoryItem> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement when database table is available
  // This should:
  // 1. Update the inventory item quantity
  // 2. Create a transaction record
  // 3. Return the updated item

  return {
    id: adjustment.inventory_item_id,
    salon_id: "",
    product_name: "Mock Product",
    quantity_in_stock: adjustment.quantity,
    is_active: true,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Record inventory transaction
 */
export async function recordTransaction(
  transaction: Omit<InventoryTransaction, "id" | "created_at">,
): Promise<InventoryTransaction> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement when database table is available
  return {
    ...transaction,
    id: crypto.randomUUID(),
    performed_by: user.id,
    created_at: new Date().toISOString(),
  };
}

/**
 * Bulk update inventory items
 */
export async function bulkUpdateInventory(
  items: InventoryItemUpdate[],
): Promise<InventoryItem[]> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement when database table is available
  return items.map(
    (item) =>
      ({
        ...item,
        product_name: item.product_name || "Unknown",
        quantity_in_stock: item.quantity_in_stock || 0,
        is_active: item.is_active ?? true,
        salon_id: item.salon_id || "",
        updated_at: new Date().toISOString(),
      }) as InventoryItem,
  );
}

/**
 * Import inventory from CSV
 */
export async function importInventory(
  salonId: string,
  items: InventoryItemInsert[],
): Promise<{ success: number; failed: number; errors: string[] }> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement when database table is available
  return {
    success: items.length,
    failed: 0,
    errors: [],
  };
}
