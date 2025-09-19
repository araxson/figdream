'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, ShoppingCart, AlertTriangle, TrendingUp } from 'lucide-react'
import { ProductList } from './products/product-list'
// TODO: Implement these components
// import { StockAlerts } from './stock/stock-alerts'
// import { PurchaseOrderList } from './purchase-orders/purchase-order-list'
// import { InventoryMetrics } from './analytics/inventory-metrics'
// import { SupplierList } from './suppliers/supplier-list'
// import { CategoryList } from './categories/category-list'

// Placeholder components until implementation
const StockAlerts = ({ alerts, salonId, compact }: any) => (
  <div className="text-muted-foreground">Stock alerts will be displayed here</div>
)
const PurchaseOrderList = ({ orders, salonId, compact }: any) => (
  <div className="text-muted-foreground">Purchase orders will be displayed here</div>
)
const InventoryMetrics = ({ metrics }: any) => (
  <div className="text-muted-foreground">Inventory metrics will be displayed here</div>
)
const SupplierList = ({ suppliers, salonId }: any) => (
  <div className="text-muted-foreground">Suppliers will be displayed here</div>
)
const CategoryList = ({ categories, salonId }: any) => (
  <div className="text-muted-foreground">Categories will be displayed here</div>
)
import type { Product, PurchaseOrder, StockAlert, Supplier, ProductCategory } from '../types'

interface InventoryDashboardProps {
  products: Product[]
  purchaseOrders: PurchaseOrder[]
  stockAlerts: StockAlert[]
  suppliers: Supplier[]
  categories: ProductCategory[]
  metrics: {
    total_products: number
    total_value: number
    low_stock_items: number
    out_of_stock_items: number
    pending_orders: number
    received_orders: number
    total_suppliers: number
    total_categories: number
  }
  salonId: string
}

export function InventoryDashboard({
  products,
  purchaseOrders,
  stockAlerts,
  suppliers,
  categories,
  metrics,
  salonId
}: InventoryDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="space-y-6">
      {/* Header Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_products}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.total_categories} categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics.total_value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Current stock value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.low_stock_items}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.out_of_stock_items} out of stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pending_orders}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.received_orders} received this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="stock">Stock Alerts</TabsTrigger>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <InventoryMetrics metrics={metrics} />

          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Stock Alerts</CardTitle>
                <CardDescription>
                  Items requiring immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StockAlerts
                  alerts={stockAlerts.slice(0, 5)}
                  salonId={salonId}
                  compact
                />
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Purchase Orders</CardTitle>
                <CardDescription>
                  Latest orders and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PurchaseOrderList
                  orders={purchaseOrders.slice(0, 5)}
                  salonId={salonId}
                  compact
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <ProductList
            products={products}
            categories={categories}
            suppliers={suppliers}
            salonId={salonId}
          />
        </TabsContent>

        <TabsContent value="stock" className="space-y-4">
          <StockAlerts
            alerts={stockAlerts}
            salonId={salonId}
            compact={false}
          />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <PurchaseOrderList
            orders={purchaseOrders}
            salonId={salonId}
            compact={false}
          />
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <SupplierList
            suppliers={suppliers}
            salonId={salonId}
          />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <CategoryList
            categories={categories}
            salonId={salonId}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}