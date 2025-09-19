import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Package, Plus, ShoppingCart, Users, FolderOpen } from 'lucide-react'

interface InventoryEmptyProps {
  type: 'products' | 'suppliers' | 'categories' | 'orders'
  onAction?: () => void
}

export function InventoryEmpty({ type, onAction }: InventoryEmptyProps) {
  const config = {
    products: {
      icon: Package,
      title: 'No products yet',
      description: 'Start by adding your first product to manage your inventory.',
      actionLabel: 'Add Product'
    },
    suppliers: {
      icon: Users,
      title: 'No suppliers yet',
      description: 'Add suppliers to track where your products come from.',
      actionLabel: 'Add Supplier'
    },
    categories: {
      icon: FolderOpen,
      title: 'No categories yet',
      description: 'Create categories to organize your products.',
      actionLabel: 'Add Category'
    },
    orders: {
      icon: ShoppingCart,
      title: 'No purchase orders yet',
      description: 'Create purchase orders to restock your inventory.',
      actionLabel: 'Create Order'
    }
  }

  const { icon: Icon, title, description, actionLabel } = config[type]

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Icon className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-center text-sm text-muted-foreground max-w-sm">
          {description}
        </p>
        {onAction && (
          <Button onClick={onAction} className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}