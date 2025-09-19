import { createClient } from '@/lib/supabase/server'
import type {
  PurchaseOrder,
  PurchaseOrderFormData
} from './types'
import { adjustStock } from './stock-mutations'

// ============= PURCHASE ORDERS =============

export async function createPurchaseOrder(salonId: string, data: PurchaseOrderFormData): Promise<PurchaseOrder> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  // Calculate totals
  const subtotal = data.items.reduce((sum, item) =>
    sum + (item.quantity_ordered * item.unit_price), 0
  )

  // Create purchase order
  const { data: order, error: orderError } = await supabase
    .from('purchase_orders')
    .insert({
      salon_id: salonId,
      supplier_id: data.supplier_id,
      order_number: data.order_number,
      order_date: data.order_date,
      expected_delivery_date: data.expected_delivery_date,
      notes: data.notes,
      subtotal: subtotal,
      total_amount: subtotal,
      created_by: user.id
    })
    .select()
    .single()

  if (orderError) throw orderError

  // Create purchase order items
  if (data.items.length > 0) {
    const { error: itemsError } = await supabase
      .from('purchase_order_items')
      .insert(
        data.items.map(item => ({
          purchase_order_id: order.id,
          product_id: item.product_id,
          quantity_ordered: item.quantity_ordered,
          unit_price: item.unit_price
        }))
      )

    if (itemsError) throw itemsError
  }

  return order
}

export async function updatePurchaseOrder(
  id: string,
  data: Partial<PurchaseOrderFormData>
): Promise<PurchaseOrder> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const updateData: any = {
    updated_at: new Date().toISOString()
  }

  if (data.supplier_id) updateData.supplier_id = data.supplier_id
  if (data.order_number) updateData.order_number = data.order_number
  if (data.order_date) updateData.order_date = data.order_date
  if (data.expected_delivery_date !== undefined) {
    updateData.expected_delivery_date = data.expected_delivery_date
  }
  if (data.notes !== undefined) updateData.notes = data.notes

  const { data: order, error } = await supabase
    .from('purchase_orders')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return order
}

export async function updatePurchaseOrderStatus(
  id: string,
  status: string
): Promise<PurchaseOrder> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const updateData: any = {
    status,
    updated_at: new Date().toISOString()
  }

  if (status === 'received') {
    updateData.received_date = new Date().toISOString()
    updateData.received_by = user.id
  }

  const { data: order, error } = await supabase
    .from('purchase_orders')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return order
}

export async function receivePurchaseOrderItem(
  itemId: string,
  quantityReceived: number,
  locationId: string
): Promise<void> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  // Get item details
  const { data: item, error: itemError } = await supabase
    .from('purchase_order_items')
    .select('*, purchase_orders!inner(id, status)')
    .eq('id', itemId)
    .single()

  if (itemError) throw itemError

  // Update item received quantity
  const { error: updateError } = await supabase
    .from('purchase_order_items')
    .update({
      quantity_received: quantityReceived,
      updated_at: new Date().toISOString()
    })
    .eq('id', itemId)

  if (updateError) throw updateError

  // Adjust stock
  await adjustStock({
    product_id: item.product_id,
    location_id: locationId,
    quantity: quantityReceived,
    movement_type: 'purchase',
    notes: `Received from PO: ${item.purchase_orders.id}`,
    cost_price: item.unit_price
  })

  // Check if all items are received
  const { data: allItems } = await supabase
    .from('purchase_order_items')
    .select('quantity_ordered, quantity_received')
    .eq('purchase_order_id', item.purchase_orders.id)

  if (allItems) {
    const allReceived = allItems.every(i =>
      i.quantity_received >= i.quantity_ordered
    )
    const partialReceived = allItems.some(i =>
      i.quantity_received > 0
    )

    let newStatus = item.purchase_orders.status
    if (allReceived) {
      newStatus = 'received'
    } else if (partialReceived) {
      newStatus = 'partial'
    }

    if (newStatus !== item.purchase_orders.status) {
      await updatePurchaseOrderStatus(item.purchase_orders.id, newStatus)
    }
  }
}

export async function deletePurchaseOrder(id: string): Promise<void> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('purchase_orders')
    .delete()
    .eq('id', id)

  if (error) throw error
}