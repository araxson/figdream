// Inventory DAL types - aligned with database schema

// Product related types
export interface Product {
  id: string
  salon_id: string
  category_id: string | null
  supplier_id: string | null
  sku: string
  barcode: string | null
  name: string
  description: string | null
  brand: string | null
  unit_of_measure: string
  cost_price: number | null
  retail_price: number | null
  min_stock_level: number
  max_stock_level: number | null
  reorder_point: number
  reorder_quantity: number
  image_url: string | null
  is_active: boolean
  is_trackable: boolean
  is_retail: boolean
  is_professional: boolean
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  // From view
  category_name?: string | null
  supplier_name?: string | null
  total_stock?: number
  available_stock?: number
}

export interface ProductCategory {
  id: string
  salon_id: string
  name: string
  description: string | null
  parent_id: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Supplier {
  id: string
  salon_id: string
  name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  website: string | null
  payment_terms: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface StockLocation {
  id: string
  salon_id: string
  location_id: string | null
  name: string
  description: string | null
  is_default: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface StockLevel {
  id: string
  product_id: string
  location_id: string
  quantity: number
  reserved_quantity: number
  available_quantity: number
  last_counted_at: string | null
  created_at: string
  updated_at: string
  // From view
  product_name?: string
  product_sku?: string
  min_stock_level?: number
  reorder_point?: number
  location_name?: string
  stock_status?: StockStatus
}

export interface PurchaseOrder {
  id: string
  salon_id: string
  supplier_id: string
  order_number: string
  status: PurchaseOrderStatus
  order_date: string
  expected_delivery_date: string | null
  received_date: string | null
  subtotal: number
  tax_amount: number
  shipping_cost: number
  total_amount: number
  notes: string | null
  created_by: string | null
  received_by: string | null
  created_at: string
  updated_at: string
  // From view
  supplier_name?: string
  supplier_email?: string | null
  supplier_phone?: string | null
  item_count?: number
  total_items?: number
  received_items?: number
}

export interface StockMovement {
  id: string
  product_id: string
  location_id: string
  movement_type: StockMovementType
  quantity: number
  reference_type: string | null
  reference_id: string | null
  from_location_id: string | null
  to_location_id: string | null
  cost_price: number | null
  notes: string | null
  performed_by: string | null
  created_at: string
}

export interface StockAlert {
  id: string
  product_id: string
  location_id: string | null
  alert_type: AlertType
  alert_level: AlertLevel
  current_quantity: number | null
  threshold_quantity: number | null
  message: string | null
  is_resolved: boolean
  resolved_at: string | null
  resolved_by: string | null
  created_at: string
}

export interface PurchaseOrderItem {
  id: string
  purchase_order_id: string
  product_id: string
  quantity_ordered: number
  quantity_received: number
  unit_price: number
  total_price: number
  created_at: string
  updated_at: string
}

// Enums and constants
export type StockMovementType =
  | 'purchase'
  | 'sale'
  | 'adjustment'
  | 'transfer'
  | 'usage'
  | 'return'
  | 'damage'
  | 'loss'

export type PurchaseOrderStatus =
  | 'draft'
  | 'sent'
  | 'partial'
  | 'received'
  | 'cancelled'

export type StockStatus =
  | 'in_stock'
  | 'low_stock'
  | 'out_of_stock'

export type AlertType =
  | 'low_stock'
  | 'out_of_stock'
  | 'overstock'
  | 'expiring'

export type AlertLevel =
  | 'info'
  | 'warning'
  | 'critical'

// Form Data Types (for mutations)
export interface ProductFormData {
  category_id?: string | null
  supplier_id?: string | null
  sku: string
  barcode?: string | null
  name: string
  description?: string | null
  brand?: string | null
  unit_of_measure: string
  cost_price?: number | null
  retail_price?: number | null
  min_stock_level: number
  max_stock_level?: number | null
  reorder_point: number
  reorder_quantity: number
  image_url?: string | null
  is_active?: boolean
  is_trackable?: boolean
  is_retail?: boolean
  is_professional?: boolean
  metadata?: Record<string, any>
}

export interface CategoryFormData {
  name: string
  description?: string | null
  parent_id?: string | null
  display_order?: number
  is_active?: boolean
}

export interface SupplierFormData {
  name: string
  contact_name?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  website?: string | null
  payment_terms?: string | null
  notes?: string | null
  is_active?: boolean
}

export interface StockLocationFormData {
  location_id?: string | null
  name: string
  description?: string | null
  is_default?: boolean
  is_active?: boolean
}

export interface StockAdjustmentFormData {
  product_id: string
  location_id: string
  movement_type: StockMovementType
  quantity: number
  notes?: string
  cost_price?: number | null
}

export interface StockTransferData {
  product_id: string
  from_location_id: string
  to_location_id: string
  quantity: number
  notes?: string
}

export interface PurchaseOrderFormData {
  supplier_id: string
  order_number: string
  order_date: string
  expected_delivery_date?: string | null
  notes?: string | null
  items: PurchaseOrderItemFormData[]
}

export interface PurchaseOrderItemFormData {
  product_id: string
  quantity_ordered: number
  unit_price: number
}

// Filter Types (for queries)
export interface ProductFilters {
  salonId?: string
  categoryId?: string | null
  supplierId?: string | null
  isActive?: boolean
  isTrackable?: boolean
  isRetail?: boolean
  isProfessional?: boolean
  searchTerm?: string
}

export interface PurchaseOrderFilters {
  salonId?: string
  supplierId?: string
  status?: PurchaseOrderStatus | PurchaseOrderStatus[]
  dateFrom?: string
  dateTo?: string
  searchTerm?: string
}

export interface StockAlertFilters {
  salonId?: string
  productId?: string
  locationId?: string | null
  alertType?: AlertType | AlertType[]
  alertLevel?: AlertLevel | AlertLevel[]
  isResolved?: boolean
}