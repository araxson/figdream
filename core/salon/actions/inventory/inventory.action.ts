'use server'

import { revalidatePath } from 'next/cache'
import {
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  updateCategory,
  deleteCategory,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  createStockLocation,
  updateStockLocation,
  deleteStockLocation,
  adjustStock,
  transferStock,
  createPurchaseOrder,
  updatePurchaseOrder,
  updatePurchaseOrderStatus,
  receivePurchaseOrderItem,
  deletePurchaseOrder,
  resolveStockAlert,
  createStockAlert
} from '../dal'
import type {
  ProductFormData,
  CategoryFormData,
  SupplierFormData,
  StockLocationFormData,
  StockAdjustmentFormData,
  StockTransferData,
  PurchaseOrderFormData
} from '../types'

// ============= PRODUCT ACTIONS =============

export async function createProductAction(salonId: string, data: ProductFormData) {
  try {
    const product = await createProduct(salonId, data)
    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard/inventory/products')
    return { success: true, data: product }
  } catch (error) {
    console.error('Error creating product:', error)
    return { success: false, error: 'Failed to create product' }
  }
}

export async function updateProductAction(id: string, data: Partial<ProductFormData>) {
  try {
    const product = await updateProduct(id, data)
    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard/inventory/products')
    revalidatePath(`/dashboard/inventory/products/${id}`)
    return { success: true, data: product }
  } catch (error) {
    console.error('Error updating product:', error)
    return { success: false, error: 'Failed to update product' }
  }
}

export async function deleteProductAction(id: string) {
  try {
    await deleteProduct(id)
    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard/inventory/products')
    return { success: true }
  } catch (error) {
    console.error('Error deleting product:', error)
    return { success: false, error: 'Failed to delete product' }
  }
}

// ============= CATEGORY ACTIONS =============

export async function createCategoryAction(salonId: string, data: CategoryFormData) {
  try {
    const category = await createCategory(salonId, data)
    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard/inventory/categories')
    return { success: true, data: category }
  } catch (error) {
    console.error('Error creating category:', error)
    return { success: false, error: 'Failed to create category' }
  }
}

export async function updateCategoryAction(id: string, data: Partial<CategoryFormData>) {
  try {
    const category = await updateCategory(id, data)
    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard/inventory/categories')
    return { success: true, data: category }
  } catch (error) {
    console.error('Error updating category:', error)
    return { success: false, error: 'Failed to update category' }
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    await deleteCategory(id)
    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard/inventory/categories')
    return { success: true }
  } catch (error) {
    console.error('Error deleting category:', error)
    return { success: false, error: 'Failed to delete category' }
  }
}

// ============= SUPPLIER ACTIONS =============

export async function createSupplierAction(salonId: string, data: SupplierFormData) {
  try {
    const supplier = await createSupplier(salonId, data)
    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard/inventory/suppliers')
    return { success: true, data: supplier }
  } catch (error) {
    console.error('Error creating supplier:', error)
    return { success: false, error: 'Failed to create supplier' }
  }
}

export async function updateSupplierAction(id: string, data: Partial<SupplierFormData>) {
  try {
    const supplier = await updateSupplier(id, data)
    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard/inventory/suppliers')
    return { success: true, data: supplier }
  } catch (error) {
    console.error('Error updating supplier:', error)
    return { success: false, error: 'Failed to update supplier' }
  }
}

export async function deleteSupplierAction(id: string) {
  try {
    await deleteSupplier(id)
    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard/inventory/suppliers')
    return { success: true }
  } catch (error) {
    console.error('Error deleting supplier:', error)
    return { success: false, error: 'Failed to delete supplier' }
  }
}

// ============= STOCK LOCATION ACTIONS =============

export async function createStockLocationAction(salonId: string, data: StockLocationFormData) {
  try {
    const location = await createStockLocation(salonId, data)
    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard/inventory/locations')
    return { success: true, data: location }
  } catch (error) {
    console.error('Error creating stock location:', error)
    return { success: false, error: 'Failed to create stock location' }
  }
}

export async function updateStockLocationAction(id: string, data: Partial<StockLocationFormData>) {
  try {
    const location = await updateStockLocation(id, data)
    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard/inventory/locations')
    return { success: true, data: location }
  } catch (error) {
    console.error('Error updating stock location:', error)
    return { success: false, error: 'Failed to update stock location' }
  }
}

export async function deleteStockLocationAction(id: string) {
  try {
    await deleteStockLocation(id)
    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard/inventory/locations')
    return { success: true }
  } catch (error) {
    console.error('Error deleting stock location:', error)
    return { success: false, error: 'Failed to delete stock location' }
  }
}

// ============= STOCK ADJUSTMENT ACTIONS =============

export async function adjustStockAction(data: StockAdjustmentFormData) {
  try {
    await adjustStock(data)
    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard/inventory/stock')
    revalidatePath(`/dashboard/inventory/products/${data.product_id}`)
    return { success: true }
  } catch (error) {
    console.error('Error adjusting stock:', error)
    return { success: false, error: 'Failed to adjust stock' }
  }
}

export async function transferStockAction(data: StockTransferData) {
  try {
    await transferStock(data)
    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard/inventory/stock')
    revalidatePath(`/dashboard/inventory/products/${data.product_id}`)
    return { success: true }
  } catch (error) {
    console.error('Error transferring stock:', error)
    return { success: false, error: 'Failed to transfer stock' }
  }
}

// ============= PURCHASE ORDER ACTIONS =============

export async function createPurchaseOrderAction(salonId: string, data: PurchaseOrderFormData) {
  try {
    const order = await createPurchaseOrder(salonId, data)
    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard/inventory/orders')
    return { success: true, data: order }
  } catch (error) {
    console.error('Error creating purchase order:', error)
    return { success: false, error: 'Failed to create purchase order' }
  }
}

export async function updatePurchaseOrderAction(id: string, data: Partial<PurchaseOrderFormData>) {
  try {
    const order = await updatePurchaseOrder(id, data)
    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard/inventory/orders')
    revalidatePath(`/dashboard/inventory/orders/${id}`)
    return { success: true, data: order }
  } catch (error) {
    console.error('Error updating purchase order:', error)
    return { success: false, error: 'Failed to update purchase order' }
  }
}

export async function updatePurchaseOrderStatusAction(id: string, status: string) {
  try {
    const order = await updatePurchaseOrderStatus(id, status)
    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard/inventory/orders')
    revalidatePath(`/dashboard/inventory/orders/${id}`)
    return { success: true, data: order }
  } catch (error) {
    console.error('Error updating purchase order status:', error)
    return { success: false, error: 'Failed to update purchase order status' }
  }
}

export async function receivePurchaseOrderItemAction(
  itemId: string,
  quantityReceived: number,
  locationId: string
) {
  try {
    await receivePurchaseOrderItem(itemId, quantityReceived, locationId)
    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard/inventory/orders')
    revalidatePath('/dashboard/inventory/stock')
    return { success: true }
  } catch (error) {
    console.error('Error receiving purchase order item:', error)
    return { success: false, error: 'Failed to receive purchase order item' }
  }
}

export async function deletePurchaseOrderAction(id: string) {
  try {
    await deletePurchaseOrder(id)
    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard/inventory/orders')
    return { success: true }
  } catch (error) {
    console.error('Error deleting purchase order:', error)
    return { success: false, error: 'Failed to delete purchase order' }
  }
}

// ============= STOCK ALERT ACTIONS =============

export async function resolveStockAlertAction(alertId: string) {
  try {
    await resolveStockAlert(alertId)
    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard/inventory/alerts')
    return { success: true }
  } catch (error) {
    console.error('Error resolving stock alert:', error)
    return { success: false, error: 'Failed to resolve stock alert' }
  }
}

export async function createStockAlertAction(
  productId: string,
  locationId: string | null,
  alertType: string,
  alertLevel: string,
  currentQuantity: number,
  thresholdQuantity: number,
  message: string
) {
  try {
    await createStockAlert(
      productId,
      locationId,
      alertType,
      alertLevel,
      currentQuantity,
      thresholdQuantity,
      message
    )
    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard/inventory/alerts')
    return { success: true }
  } catch (error) {
    console.error('Error creating stock alert:', error)
    return { success: false, error: 'Failed to create stock alert' }
  }
}

// ============= BULK ACTIONS =============

export async function bulkUpdateProductStatusAction(productIds: string[], isActive: boolean) {
  try {
    const updates = await Promise.all(
      productIds.map(id => updateProduct(id, { is_active: isActive }))
    )
    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard/inventory/products')
    return { success: true, data: updates }
  } catch (error) {
    console.error('Error bulk updating product status:', error)
    return { success: false, error: 'Failed to update product status' }
  }
}

export async function bulkDeleteProductsAction(productIds: string[]) {
  try {
    await Promise.all(productIds.map(id => deleteProduct(id)))
    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard/inventory/products')
    return { success: true }
  } catch (error) {
    console.error('Error bulk deleting products:', error)
    return { success: false, error: 'Failed to delete products' }
  }
}