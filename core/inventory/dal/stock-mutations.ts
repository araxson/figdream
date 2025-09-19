import { createClient } from '@/lib/supabase/server'
import type {
  StockLocation,
  StockMovement,
  StockLocationFormData,
  StockAdjustmentFormData,
  StockTransferData
} from './types'

// ============= STOCK LOCATIONS =============

export async function createStockLocation(salonId: string, data: StockLocationFormData): Promise<StockLocation> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  // If setting as default, unset other defaults
  if (data.is_default) {
    await supabase
      .from('stock_locations')
      .update({ is_default: false })
      .eq('salon_id', salonId)
  }

  const { data: location, error } = await supabase
    .from('stock_locations')
    .insert({
      salon_id: salonId,
      ...data
    })
    .select()
    .single()

  if (error) throw error
  return location
}

export async function updateStockLocation(id: string, data: Partial<StockLocationFormData>): Promise<StockLocation> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  // If setting as default, get salon_id and unset other defaults
  if (data.is_default) {
    const { data: existingLocation } = await supabase
      .from('stock_locations')
      .select('salon_id')
      .eq('id', id)
      .single()

    if (existingLocation) {
      await supabase
        .from('stock_locations')
        .update({ is_default: false })
        .eq('salon_id', existingLocation.salon_id)
        .neq('id', id)
    }
  }

  const { data: location, error } = await supabase
    .from('stock_locations')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return location
}

export async function deleteStockLocation(id: string): Promise<void> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('stock_locations')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ============= STOCK ADJUSTMENTS =============

export async function adjustStock(data: StockAdjustmentFormData): Promise<void> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  // Start transaction
  const { error: movementError } = await supabase
    .from('stock_movements')
    .insert({
      product_id: data.product_id,
      location_id: data.location_id,
      movement_type: data.movement_type,
      quantity: data.quantity,
      notes: data.notes,
      cost_price: data.cost_price,
      performed_by: user.id
    })

  if (movementError) throw movementError

  // Update stock level
  const { data: currentStock } = await supabase
    .from('stock_levels')
    .select('*')
    .eq('product_id', data.product_id)
    .eq('location_id', data.location_id)
    .single()

  if (currentStock) {
    // Update existing stock level
    const newQuantity = currentStock.quantity + data.quantity
    const { error: updateError } = await supabase
      .from('stock_levels')
      .update({
        quantity: newQuantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentStock.id)

    if (updateError) throw updateError
  } else {
    // Create new stock level
    const { error: insertError } = await supabase
      .from('stock_levels')
      .insert({
        product_id: data.product_id,
        location_id: data.location_id,
        quantity: data.quantity
      })

    if (insertError) throw insertError
  }
}

export async function transferStock(data: StockTransferData): Promise<void> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  // Record transfer movement
  const { error: movementError } = await supabase
    .from('stock_movements')
    .insert({
      product_id: data.product_id,
      location_id: data.from_location_id,
      movement_type: 'transfer',
      quantity: -data.quantity, // Negative for source location
      from_location_id: data.from_location_id,
      to_location_id: data.to_location_id,
      notes: data.notes,
      performed_by: user.id
    })

  if (movementError) throw movementError

  // Update source location stock
  await adjustStock({
    product_id: data.product_id,
    location_id: data.from_location_id,
    quantity: -data.quantity,
    movement_type: 'transfer',
    notes: `Transfer to location: ${data.to_location_id}`
  })

  // Update destination location stock
  await adjustStock({
    product_id: data.product_id,
    location_id: data.to_location_id,
    quantity: data.quantity,
    movement_type: 'transfer',
    notes: `Transfer from location: ${data.from_location_id}`
  })
}

// ============= STOCK ALERTS =============

export async function resolveStockAlert(alertId: string): Promise<void> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('stock_alerts')
    .update({
      is_resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: user.id
    })
    .eq('id', alertId)

  if (error) throw error
}

export async function createStockAlert(
  productId: string,
  locationId: string | null,
  alertType: string,
  alertLevel: string,
  currentQuantity: number,
  thresholdQuantity: number,
  message: string
): Promise<void> {
  const supabase = await createClient()

  // Auth check - this might be called by system
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('stock_alerts')
    .insert({
      product_id: productId,
      location_id: locationId,
      alert_type: alertType,
      alert_level: alertLevel,
      current_quantity: currentQuantity,
      threshold_quantity: thresholdQuantity,
      message: message
    })

  if (error) throw error
}