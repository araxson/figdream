"use client";

import { useState, useEffect } from "react";
import {
  getInventoryItems,
  getInventoryStats,
  getLowStockItems,
} from "../dal/inventory-queries";
import {
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  adjustStock,
} from "../dal/inventory-mutations";
import type {
  InventoryItemWithRelations,
  InventoryFilters,
  InventoryStats,
  InventoryItemInsert,
  InventoryItemUpdate,
  StockAdjustment,
} from "../dal/inventory-types";

export function useInventory(initialFilters: InventoryFilters = {}) {
  const [items, setItems] = useState<InventoryItemWithRelations[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [lowStockItems, setLowStockItems] = useState<
    InventoryItemWithRelations[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState(initialFilters);

  // Fetch inventory items
  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const response = await getInventoryItems(filters);
      setItems(response.items);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch inventory stats
  const fetchStats = async () => {
    try {
      const statsData = await getInventoryStats(filters.salon_id);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to fetch inventory stats:", err);
    }
  };

  // Fetch low stock items
  const fetchLowStock = async () => {
    try {
      const lowStock = await getLowStockItems(filters.salon_id);
      setLowStockItems(lowStock);
    } catch (err) {
      console.error("Failed to fetch low stock items:", err);
    }
  };

  // Create new item
  const createItem = async (item: InventoryItemInsert) => {
    try {
      setIsLoading(true);
      await createInventoryItem(item);
      await fetchItems();
      await fetchStats();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update item
  const updateItem = async (item: InventoryItemUpdate) => {
    try {
      setIsLoading(true);
      await updateInventoryItem(item);
      await fetchItems();
      await fetchStats();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete item
  const deleteItem = async (itemId: string) => {
    try {
      setIsLoading(true);
      await deleteInventoryItem(itemId);
      await fetchItems();
      await fetchStats();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Adjust stock
  const adjustItemStock = async (adjustment: StockAdjustment) => {
    try {
      setIsLoading(true);
      await adjustStock(adjustment);
      await fetchItems();
      await fetchStats();
      await fetchLowStock();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update filters
  const updateFilters = (newFilters: InventoryFilters) => {
    setFilters(newFilters);
  };

  // Initial fetch
  useEffect(() => {
    fetchItems();
    fetchStats();
    fetchLowStock();
  }, [filters]);

  return {
    items,
    stats,
    lowStockItems,
    isLoading,
    error,
    filters,
    createItem,
    updateItem,
    deleteItem,
    adjustItemStock,
    updateFilters,
    refetch: fetchItems,
  };
}
