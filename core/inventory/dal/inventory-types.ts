import { Database } from "@/types/database.types";

// Database types
export interface InventoryItem {
  id: string;
  salon_id: string;
  product_name: string;
  sku?: string;
  barcode?: string;
  category?: string;
  brand?: string;
  description?: string;
  quantity_in_stock: number;
  minimum_stock_level?: number;
  maximum_stock_level?: number;
  reorder_point?: number;
  unit_of_measure?: string;
  cost_per_unit?: number;
  sale_price?: number;
  supplier_id?: string;
  supplier_name?: string;
  location?: string;
  expiry_date?: string;
  is_active: boolean;
  last_restocked_at?: string;
  last_sold_at?: string;
  created_at?: string;
  updated_at?: string;
}

// Extended types with relations
export interface InventoryItemWithRelations extends InventoryItem {
  salon?: Database["public"]["Tables"]["salons"]["Row"];
  supplier?: {
    id: string;
    name: string;
    contact?: string;
  };
  transactions?: InventoryTransaction[];
}

export interface InventoryTransaction {
  id: string;
  inventory_item_id: string;
  transaction_type: "purchase" | "sale" | "adjustment" | "return" | "damage";
  quantity: number;
  unit_cost?: number;
  total_cost?: number;
  transaction_date: string;
  reference_number?: string;
  notes?: string;
  performed_by?: string;
  created_at?: string;
}

// Filter types
export interface InventoryFilters {
  salon_id?: string;
  category?: string;
  brand?: string;
  supplier_id?: string;
  is_active?: boolean;
  low_stock?: boolean;
  search?: string;
}

// Response types
export interface InventoryListResponse {
  items: InventoryItemWithRelations[];
  total: number;
  page: number;
  limit: number;
}

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  expiringItems: number;
  categories: Array<{
    category: string;
    count: number;
    value: number;
  }>;
}

// Input types
export interface InventoryItemInsert {
  salon_id: string;
  product_name: string;
  sku?: string;
  barcode?: string;
  category?: string;
  brand?: string;
  description?: string;
  quantity_in_stock: number;
  minimum_stock_level?: number;
  maximum_stock_level?: number;
  reorder_point?: number;
  unit_of_measure?: string;
  cost_per_unit?: number;
  sale_price?: number;
  supplier_id?: string;
  supplier_name?: string;
  location?: string;
  expiry_date?: string;
  is_active?: boolean;
}

export interface InventoryItemUpdate extends Partial<InventoryItemInsert> {
  id: string;
}

export interface StockAdjustment {
  inventory_item_id: string;
  adjustment_type: "add" | "remove" | "set";
  quantity: number;
  reason?: string;
  notes?: string;
}
