import { Suspense } from 'react'
import { InventoryDashboard, InventoryLoading } from './index'
import {
  getProducts,
  getPurchaseOrders,
  getStockAlerts,
  getSuppliers,
  getCategories,
  getInventoryMetrics
} from '../dal'
import { createClient } from '@/lib/supabase/server'

async function InventoryPageContent() {
  const supabase = await createClient()

  // Get user's salon ID
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Get user's salon from user_roles
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('salon_id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (!userRole?.salon_id) {
    throw new Error('No salon found for user')
  }

  const salonId = userRole.salon_id

  // Fetch all inventory data in parallel
  const [
    products,
    purchaseOrders,
    stockAlerts,
    suppliers,
    categories,
    metrics
  ] = await Promise.all([
    getProducts({ isActive: true }),
    getPurchaseOrders(),
    getStockAlerts({ isResolved: false }),
    getSuppliers(salonId),
    getCategories(salonId),
    getInventoryMetrics(salonId)
  ])

  return (
    <InventoryDashboard
      products={products}
      purchaseOrders={purchaseOrders}
      stockAlerts={stockAlerts}
      suppliers={suppliers}
      categories={categories}
      metrics={metrics}
      salonId={salonId}
    />
  )
}

export function InventoryPageServer() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-muted-foreground">
          Manage your salon&apos;s products, supplies, and stock levels
        </p>
      </div>

      <Suspense fallback={<InventoryLoading />}>
        <InventoryPageContent />
      </Suspense>
    </div>
  )
}