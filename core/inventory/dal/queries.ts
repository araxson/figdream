import { createClient } from '@/lib/supabase/server'
import type {
  Product,
  ProductCategory,
  Supplier,
  StockLocation,
  StockLevel,
  PurchaseOrder,
  StockMovement,
  StockAlert,
  PurchaseOrderItem,
  ProductFilters,
  PurchaseOrderFilters,
  StockAlertFilters
} from './types'

// ============= PRODUCTS =============

export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  let query = supabase
    .from('inventory_products_view')
    .select('*')
    .order('name')

  if (filters) {
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,barcode.ilike.%${filters.search}%`)
    }
    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id)
    }
    if (filters.supplier_id) {
      query = query.eq('supplier_id', filters.supplier_id)
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }
    if (filters.is_retail !== undefined) {
      query = query.eq('is_retail', filters.is_retail)
    }
    if (filters.is_professional !== undefined) {
      query = query.eq('is_professional', filters.is_professional)
    }
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('inventory_products_view')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function getProductBySku(salonId: string, sku: string): Promise<Product | null> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('inventory_products_view')
    .select('*')
    .eq('salon_id', salonId)
    .eq('sku', sku)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

// ============= CATEGORIES =============

export async function getCategories(salonId: string): Promise<ProductCategory[]> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('product_categories')
    .select('*')
    .eq('salon_id', salonId)
    .order('display_order')

  if (error) throw error
  return data || []
}

export async function getCategoryById(id: string): Promise<ProductCategory | null> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('product_categories')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

// ============= SUPPLIERS =============

export async function getSuppliers(salonId: string): Promise<Supplier[]> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('salon_id', salonId)
    .order('name')

  if (error) throw error
  return data || []
}

export async function getSupplierById(id: string): Promise<Supplier | null> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

// ============= STOCK LOCATIONS =============

export async function getStockLocations(salonId: string): Promise<StockLocation[]> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('stock_locations')
    .select('*')
    .eq('salon_id', salonId)
    .order('name')

  if (error) throw error
  return data || []
}

export async function getDefaultStockLocation(salonId: string): Promise<StockLocation | null> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('stock_locations')
    .select('*')
    .eq('salon_id', salonId)
    .eq('is_default', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

// ============= STOCK LEVELS =============

export async function getStockLevels(productId?: string, locationId?: string): Promise<StockLevel[]> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  let query = supabase
    .from('inventory_stock_view')
    .select('*')
    .order('product_name')

  if (productId) {
    query = query.eq('product_id', productId)
  }
  if (locationId) {
    query = query.eq('location_id', locationId)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function getStockLevelById(productId: string, locationId: string): Promise<StockLevel | null> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('inventory_stock_view')
    .select('*')
    .eq('product_id', productId)
    .eq('location_id', locationId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function getLowStockProducts(salonId: string): Promise<Product[]> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('inventory_products_view')
    .select('*')
    .eq('salon_id', salonId)
    .or('available_stock.lte.min_stock_level,available_stock.lte.reorder_point')
    .order('available_stock')

  if (error) throw error
  return data || []
}

// ============= PURCHASE ORDERS =============

export async function getPurchaseOrders(filters?: PurchaseOrderFilters): Promise<PurchaseOrder[]> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  let query = supabase
    .from('inventory_purchase_orders_view')
    .select('*')
    .order('order_date', { ascending: false })

  if (filters) {
    if (filters.search) {
      query = query.or(`order_number.ilike.%${filters.search}%,supplier_name.ilike.%${filters.search}%`)
    }
    if (filters.supplier_id) {
      query = query.eq('supplier_id', filters.supplier_id)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.from_date) {
      query = query.gte('order_date', filters.from_date)
    }
    if (filters.to_date) {
      query = query.lte('order_date', filters.to_date)
    }
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function getPurchaseOrderById(id: string): Promise<PurchaseOrder | null> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('inventory_purchase_orders_view')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function getPurchaseOrderItems(orderId: string): Promise<PurchaseOrderItem[]> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('purchase_order_items')
    .select('*')
    .eq('purchase_order_id', orderId)
    .order('created_at')

  if (error) throw error
  return data || []
}

// ============= STOCK MOVEMENTS =============

export async function getStockMovements(
  productId?: string,
  locationId?: string,
  limit = 50
): Promise<StockMovement[]> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  let query = supabase
    .from('stock_movements')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (productId) {
    query = query.eq('product_id', productId)
  }
  if (locationId) {
    query = query.eq('location_id', locationId)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

// ============= STOCK ALERTS =============

export async function getStockAlerts(filters?: StockAlertFilters): Promise<StockAlert[]> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  let query = supabase
    .from('stock_alerts')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters) {
    if (filters.product_id) {
      query = query.eq('product_id', filters.product_id)
    }
    if (filters.location_id) {
      query = query.eq('location_id', filters.location_id)
    }
    if (filters.alert_type) {
      query = query.eq('alert_type', filters.alert_type)
    }
    if (filters.alert_level) {
      query = query.eq('alert_level', filters.alert_level)
    }
    if (filters.is_resolved !== undefined) {
      query = query.eq('is_resolved', filters.is_resolved)
    }
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function getActiveAlerts(salonId: string): Promise<StockAlert[]> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  // Get products for this salon first
  const { data: products } = await supabase
    .from('products')
    .select('id')
    .eq('salon_id', salonId)

  if (!products || products.length === 0) return []

  const productIds = products.map(p => p.id)

  const { data, error } = await supabase
    .from('stock_alerts')
    .select('*')
    .in('product_id', productIds)
    .eq('is_resolved', false)
    .order('alert_level', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// ============= ANALYTICS =============

export async function getInventoryMetrics(salonId: string) {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  // Get product metrics
  const { data: products } = await supabase
    .from('inventory_products_view')
    .select('id, cost_price, retail_price, total_stock, available_stock')
    .eq('salon_id', salonId)
    .eq('is_active', true)

  // Get category count
  const { count: categoryCount } = await supabase
    .from('product_categories')
    .select('*', { count: 'exact', head: true })
    .eq('salon_id', salonId)

  // Get supplier count
  const { count: supplierCount } = await supabase
    .from('suppliers')
    .select('*', { count: 'exact', head: true })
    .eq('salon_id', salonId)
    .eq('is_active', true)

  // Get purchase order metrics
  const { data: orders } = await supabase
    .from('purchase_orders')
    .select('status')
    .eq('salon_id', salonId)

  // Calculate metrics
  const metrics = {
    total_products: products?.length || 0,
    total_value: products?.reduce((sum, p) => {
      const value = (p.cost_price || 0) * (p.total_stock || 0)
      return sum + value
    }, 0) || 0,
    low_stock_items: products?.filter(p =>
      p.available_stock <= p.min_stock_level
    ).length || 0,
    out_of_stock_items: products?.filter(p =>
      p.available_stock <= 0
    ).length || 0,
    pending_orders: orders?.filter(o =>
      ['draft', 'sent', 'partial'].includes(o.status)
    ).length || 0,
    received_orders: orders?.filter(o =>
      o.status === 'received'
    ).length || 0,
    total_suppliers: supplierCount || 0,
    total_categories: categoryCount || 0
  }

  return metrics
}