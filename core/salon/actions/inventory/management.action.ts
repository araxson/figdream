"use server";

import { revalidatePath } from "next/cache";
import {
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  adjustStock,
  recordTransaction,
  bulkUpdateInventory,
} from "../dal/inventory-mutations";
import type {
  InventoryItemInsert,
  InventoryItemUpdate,
  InventoryTransaction,
  StockAdjustment,
} from "../dal/inventory-types";

export async function createInventoryItemAction(data: InventoryItemInsert) {
  try {
    const item = await createInventoryItem(data);
    revalidatePath("/dashboard/inventory");
    revalidatePath("/admin/inventory");
    return { success: true, data: item };
  } catch (error) {
    console.error("Failed to create inventory item:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create inventory item",
    };
  }
}

export async function updateInventoryItemAction(data: InventoryItemUpdate) {
  try {
    const item = await updateInventoryItem(data);
    revalidatePath("/dashboard/inventory");
    revalidatePath("/admin/inventory");
    revalidatePath(`/inventory/${data.id}`);
    return { success: true, data: item };
  } catch (error) {
    console.error("Failed to update inventory item:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update inventory item",
    };
  }
}

export async function deleteInventoryItemAction(id: string) {
  try {
    await deleteInventoryItem(id);
    revalidatePath("/dashboard/inventory");
    revalidatePath("/admin/inventory");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete inventory item:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete inventory item",
    };
  }
}

export async function adjustInventoryStockAction(data: StockAdjustment) {
  try {
    const result = await adjustStock(data);
    revalidatePath("/dashboard/inventory");
    revalidatePath("/admin/inventory");
    revalidatePath(`/inventory/${data.inventory_item_id}`);
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to adjust inventory stock:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to adjust stock",
    };
  }
}

export async function recordInventoryTransactionAction(
  data: Omit<InventoryTransaction, "id" | "created_at">,
) {
  try {
    const transaction = await recordTransaction(data);
    revalidatePath("/dashboard/inventory");
    revalidatePath("/admin/inventory");
    revalidatePath(`/inventory/${data.inventory_item_id}/transactions`);
    return { success: true, data: transaction };
  } catch (error) {
    console.error("Failed to record inventory transaction:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to record transaction",
    };
  }
}

export async function bulkUpdateInventoryAction(
  updates: InventoryItemUpdate[],
) {
  try {
    const results = await bulkUpdateInventory(updates);
    revalidatePath("/dashboard/inventory");
    revalidatePath("/admin/inventory");
    return { success: true, data: results };
  } catch (error) {
    console.error("Failed to bulk update inventory:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to bulk update inventory",
    };
  }
}
