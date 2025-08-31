'use server'

import { createClient } from '@/lib/database/supabase/server'
import { getUser } from '@/lib/data-access/auth'
import {
  type CreateGiftCardInput,
  type PurchaseGiftCardInput,
  type RedeemGiftCardInput,
  type CheckGiftCardBalanceInput,
  createGiftCardSchema,
  purchaseGiftCardSchema,
  redeemGiftCardSchema,
  checkGiftCardBalanceSchema,
  giftCardTypes,
  giftCardStatuses,
} from '@/lib/validations/advanced-features-schema'

/**
 * Data Access Layer for Gift Card Operations
 * Handles gift card creation, purchase, redemption, and balance management
 */

export type GiftCard = {
  id: string
  salon_id: string
  code: string
  type: typeof giftCardTypes[number]
  status: typeof giftCardStatuses[number]
  original_amount: number
  current_balance: number
  currency: string
  purchaser_name: string
  purchaser_email: string
  purchaser_phone: string | null
  recipient_name: string
  recipient_email: string | null
  recipient_phone: string | null
  message: string | null
  delivery_date: string | null
  expires_at: string | null
  design_template: string | null
  custom_image_url: string | null
  created_at: string
  purchased_at: string | null
  first_used_at: string | null
  last_used_at: string | null
}

export type GiftCardTransaction = {
  id: string
  gift_card_id: string
  customer_id: string | null
  booking_id: string | null
  amount: number
  transaction_type: 'purchase' | 'redemption' | 'refund' | 'adjustment'
  description: string
  payment_intent_id: string | null
  created_at: string
}

export type GiftCardRedemption = {
  id: string
  gift_card_id: string
  customer_id: string
  booking_id: string | null
  amount_redeemed: number
  remaining_balance: number
  created_at: string
}

/**
 * Generate a unique gift card code
 */
function generateGiftCardCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  
  // Format: XXXX-XXXX-XXXX-XXXX
  for (let i = 0; i < 4; i++) {
    if (i > 0) result += '-'
    for (let j = 0; j < 4; j++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
  }
  
  return result
}

/**
 * Create a new gift card (without payment processing)
 */
export async function createGiftCard(input: CreateGiftCardInput) {
  try {
    const validatedInput = createGiftCardSchema.parse(input)
    const supabase = await createClient()

    // Generate unique code
    let code: string
    let codeExists = true
    let attempts = 0
    
    do {
      code = generateGiftCardCode()
      const { data } = await supabase
        .from('gift_cards')
        .select('id')
        .eq('code', code)
        .single()
      
      codeExists = !!data
      attempts++
    } while (codeExists && attempts < 10)

    if (codeExists) {
      throw new Error('Unable to generate unique gift card code')
    }

    // Set default expiration if not provided (1 year from now)
    const expiresAt = validatedInput.expires_at || 
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('gift_cards')
      .insert({
        salon_id: validatedInput.salon_id,
        code,
        type: validatedInput.type,
        status: 'pending',
        original_amount: validatedInput.amount,
        current_balance: validatedInput.amount,
        currency: validatedInput.currency,
        purchaser_name: validatedInput.purchaser_name,
        purchaser_email: validatedInput.purchaser_email,
        purchaser_phone: validatedInput.purchaser_phone,
        recipient_name: validatedInput.recipient_name,
        recipient_email: validatedInput.recipient_email,
        recipient_phone: validatedInput.recipient_phone,
        message: validatedInput.message,
        delivery_date: validatedInput.delivery_date,
        expires_at: expiresAt,
        design_template: validatedInput.design_template,
        custom_image_url: validatedInput.custom_image_url,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating gift card:', error)
      throw new Error('Failed to create gift card')
    }

    return { success: true, data }
  } catch (error) {
    console.error('Create gift card error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create gift card'
    }
  }
}

/**
 * Purchase a gift card with payment processing
 */
export async function purchaseGiftCard(input: PurchaseGiftCardInput) {
  try {
    const validatedInput = purchaseGiftCardSchema.parse(input)
    const supabase = await createClient()

    // First create the gift card
    const createResult = await createGiftCard(validatedInput)
    if (!createResult.success) {
      throw new Error(createResult.error)
    }

    const giftCard = createResult.data!

    try {
      // Process payment with Stripe (mock implementation)
      const paymentResult = await processGiftCardPayment({
        amount: validatedInput.amount,
        currency: validatedInput.currency,
        payment_method_id: validatedInput.payment_method_id,
        customer_email: validatedInput.purchaser_email,
        gift_card_id: giftCard.id,
        billing_address: validatedInput.billing_address,
      })

      if (!paymentResult.success) {
        // Delete the gift card if payment fails
        await supabase
          .from('gift_cards')
          .delete()
          .eq('id', giftCard.id)

        throw new Error(paymentResult.error || 'Payment failed')
      }

      // Update gift card status to active
      const { data: updatedGiftCard, error: updateError } = await supabase
        .from('gift_cards')
        .update({
          status: 'active',
          purchased_at: new Date().toISOString(),
        })
        .eq('id', giftCard.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating gift card status:', updateError)
        throw new Error('Payment processed but failed to activate gift card')
      }

      // Record purchase transaction
      await supabase
        .from('gift_card_transactions')
        .insert({
          gift_card_id: giftCard.id,
          amount: validatedInput.amount,
          transaction_type: 'purchase',
          description: `Gift card purchased by ${validatedInput.purchaser_name}`,
          payment_intent_id: paymentResult.paymentIntentId,
        })

      // Schedule delivery email if delivery date is specified
      if (validatedInput.delivery_date) {
        await scheduleGiftCardDelivery(giftCard.id, validatedInput.delivery_date)
      } else {
        // Send immediately
        await sendGiftCardEmail(giftCard.id)
      }

      return { success: true, data: updatedGiftCard }
    } catch (error) {
      // Clean up gift card if payment processing fails
      await supabase
        .from('gift_cards')
        .delete()
        .eq('id', giftCard.id)
      
      throw error
    }
  } catch (error) {
    console.error('Purchase gift card error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to purchase gift card'
    }
  }
}

/**
 * Check gift card balance and status
 */
export async function checkGiftCardBalance(input: CheckGiftCardBalanceInput) {
  try {
    const validatedInput = checkGiftCardBalanceSchema.parse(input)
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('gift_cards')
      .select(`
        id,
        code,
        status,
        current_balance,
        original_amount,
        currency,
        recipient_name,
        expires_at,
        salon_id,
        salons (
          name,
          slug
        )
      `)
      .eq('code', validatedInput.code)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          success: false,
          error: 'Gift card not found'
        }
      }
      console.error('Error checking gift card balance:', error)
      throw new Error('Failed to check gift card balance')
    }

    // Check if gift card is expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return {
        success: false,
        error: 'Gift card has expired'
      }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Check gift card balance error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check gift card balance'
    }
  }
}

/**
 * Redeem gift card for payment
 */
export async function redeemGiftCard(input: RedeemGiftCardInput) {
  try {
    const validatedInput = redeemGiftCardSchema.parse(input)
    const supabase = await createClient()

    // First check the gift card
    const balanceCheck = await checkGiftCardBalance({ code: validatedInput.code })
    if (!balanceCheck.success) {
      return balanceCheck
    }

    const giftCard = balanceCheck.data!

    // Validate gift card status
    if (giftCard.status !== 'active') {
      return {
        success: false,
        error: 'Gift card is not active'
      }
    }

    // Check if there's sufficient balance
    const redemptionAmount = validatedInput.amount || giftCard.current_balance
    if (redemptionAmount > giftCard.current_balance) {
      return {
        success: false,
        error: 'Insufficient gift card balance'
      }
    }

    // Calculate new balance
    const newBalance = giftCard.current_balance - redemptionAmount

    // Update gift card balance
    const { error: updateError } = await supabase
      .from('gift_cards')
      .update({
        current_balance: newBalance,
        status: newBalance <= 0 ? 'redeemed' : 'active',
        first_used_at: giftCard.first_used_at || new Date().toISOString(),
        last_used_at: new Date().toISOString(),
      })
      .eq('id', giftCard.id)

    if (updateError) {
      console.error('Error updating gift card balance:', updateError)
      throw new Error('Failed to redeem gift card')
    }

    // Record redemption transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('gift_card_transactions')
      .insert({
        gift_card_id: giftCard.id,
        customer_id: validatedInput.customer_id,
        booking_id: validatedInput.booking_id,
        amount: -redemptionAmount, // Negative for redemption
        transaction_type: 'redemption',
        description: `Gift card redeemed${validatedInput.booking_id ? ` for booking` : ''}`,
      })
      .select()
      .single()

    if (transactionError) {
      console.error('Error recording gift card transaction:', transactionError)
      // Note: We don't rollback the gift card update here as the redemption was successful
    }

    return {
      success: true,
      data: {
        redeemedAmount: redemptionAmount,
        remainingBalance: newBalance,
        giftCardId: giftCard.id,
        transactionId: transaction?.id,
      }
    }
  } catch (error) {
    console.error('Redeem gift card error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to redeem gift card'
    }
  }
}

/**
 * Get gift card transaction history
 */
export async function getGiftCardHistory(giftCardId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('gift_card_transactions')
      .select(`
        *,
        bookings (
          id,
          service_name,
          appointment_time
        )
      `)
      .eq('gift_card_id', giftCardId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching gift card history:', error)
      throw new Error('Failed to fetch gift card history')
    }

    return { success: true, data }
  } catch (error) {
    console.error('Get gift card history error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch gift card history'
    }
  }
}

/**
 * Get customer's gift cards
 */
export async function getCustomerGiftCards(customerEmail: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('gift_cards')
      .select(`
        *,
        salons (
          name,
          slug
        )
      `)
      .or(`purchaser_email.eq.${customerEmail},recipient_email.eq.${customerEmail}`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching customer gift cards:', error)
      throw new Error('Failed to fetch customer gift cards')
    }

    return { success: true, data }
  } catch (error) {
    console.error('Get customer gift cards error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch customer gift cards'
    }
  }
}

/**
 * Get salon gift card analytics
 */
export async function getGiftCardAnalytics(salonId: string) {
  try {
    const { user } = await getUser()
    if (!user) {
      throw new Error('Authentication required')
    }

    const supabase = await createClient()

    // Check user permissions
    const { data: salonAccess } = await supabase
      .from('user_salon_access')
      .select('role')
      .eq('user_id', user.id)
      .eq('salon_id', salonId)
      .single()

    if (!salonAccess || !['salon_admin', 'location_admin', 'super_admin'].includes(salonAccess.role)) {
      throw new Error('Insufficient permissions')
    }

    // Get gift card statistics
    const { data: giftCards, error: cardsError } = await supabase
      .from('gift_cards')
      .select('status, original_amount, current_balance, type, purchased_at')
      .eq('salon_id', salonId)

    if (cardsError) {
      throw new Error('Failed to fetch gift card data')
    }

    // Get transaction data for the last 12 months
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    const { data: transactions, error: transactionsError } = await supabase
      .from('gift_card_transactions')
      .select(`
        amount,
        transaction_type,
        created_at,
        gift_cards!inner (salon_id)
      `)
      .eq('gift_cards.salon_id', salonId)
      .gte('created_at', twelveMonthsAgo.toISOString())

    if (transactionsError) {
      throw new Error('Failed to fetch transaction data')
    }

    // Calculate metrics
    const totalSold = giftCards.filter(gc => gc.status !== 'pending').length
    const totalValue = giftCards
      .filter(gc => gc.status !== 'pending')
      .reduce((sum, gc) => sum + gc.original_amount, 0)
    
    const totalRedeemed = giftCards
      .reduce((sum, gc) => sum + (gc.original_amount - gc.current_balance), 0)
    
    const activeCards = giftCards.filter(gc => gc.status === 'active').length
    const outstandingBalance = giftCards
      .filter(gc => gc.status === 'active')
      .reduce((sum, gc) => sum + gc.current_balance, 0)

    const redemptionRate = totalValue > 0 ? (totalRedeemed / totalValue) * 100 : 0

    // Monthly breakdown
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = new Date()
      month.setMonth(month.getMonth() - i)
      const monthKey = month.toISOString().slice(0, 7) // YYYY-MM format
      
      const monthTransactions = transactions.filter(t => 
        t.created_at.slice(0, 7) === monthKey
      )
      
      const purchases = monthTransactions
        .filter(t => t.transaction_type === 'purchase')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const redemptions = monthTransactions
        .filter(t => t.transaction_type === 'redemption')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
      
      return {
        month: monthKey,
        purchases,
        redemptions,
      }
    }).reverse()

    const analytics = {
      overview: {
        totalSold,
        totalValue,
        totalRedeemed,
        activeCards,
        outstandingBalance,
        redemptionRate,
      },
      typeBreakdown: {
        digital: giftCards.filter(gc => gc.type === 'digital').length,
        physical: giftCards.filter(gc => gc.type === 'physical').length,
      },
      monthlyTrends: monthlyData,
    }

    return { success: true, data: analytics }
  } catch (error) {
    console.error('Get gift card analytics error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch gift card analytics'
    }
  }
}

/**
 * Mock payment processing function
 * In production, this would integrate with Stripe or other payment processors
 */
async function processGiftCardPayment(params: {
  amount: number
  currency: string
  payment_method_id: string
  customer_email: string
  gift_card_id: string
  billing_address?: any
}) {
  try {
    // Mock implementation - in production, integrate with Stripe
    const paymentIntentId = `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock payment success (in production, this would be actual Stripe processing)
    return {
      success: true,
      paymentIntentId,
    }
  } catch (error) {
    console.error('Payment processing error:', error)
    return {
      success: false,
      error: 'Payment processing failed',
    }
  }
}

/**
 * Schedule gift card delivery email
 */
async function scheduleGiftCardDelivery(giftCardId: string, deliveryDate: string) {
  try {
    const supabase = await createClient()
    
    // In production, this would integrate with a job queue or scheduling service
    // For now, we'll just log the scheduled delivery
    console.log(`Gift card ${giftCardId} scheduled for delivery on ${deliveryDate}`)
    
    // Store the scheduled delivery in a queue table (not implemented here)
    // await supabase
    //   .from('scheduled_emails')
    //   .insert({
    //     type: 'gift_card_delivery',
    //     reference_id: giftCardId,
    //     scheduled_for: deliveryDate,
    //     status: 'pending',
    //   })
    
    return { success: true }
  } catch (error) {
    console.error('Schedule gift card delivery error:', error)
    return { success: false, error: 'Failed to schedule delivery' }
  }
}

/**
 * Send gift card email immediately
 */
async function sendGiftCardEmail(giftCardId: string) {
  try {
    const supabase = await createClient()
    
    // Get gift card details
    const { data: giftCard } = await supabase
      .from('gift_cards')
      .select(`
        *,
        salons (
          name,
          slug,
          logo_url
        )
      `)
      .eq('id', giftCardId)
      .single()
    
    if (!giftCard) {
      throw new Error('Gift card not found')
    }
    
    // In production, this would integrate with Resend or other email service
    console.log(`Sending gift card email for ${giftCard.code} to ${giftCard.recipient_email}`)
    
    // Mock email sending
    const emailData = {
      to: giftCard.recipient_email || giftCard.purchaser_email,
      subject: `Gift Card from ${giftCard.salons.name}`,
      html: generateGiftCardEmailHtml(giftCard),
    }
    
    // In production: await sendEmail(emailData)
    
    return { success: true }
  } catch (error) {
    console.error('Send gift card email error:', error)
    return { success: false, error: 'Failed to send gift card email' }
  }
}

/**
 * Generate HTML for gift card email
 */
function generateGiftCardEmailHtml(giftCard: any): string {
  return `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <h1>You've Received a Gift Card!</h1>
      <div style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center;">
        <h2 style="color: #1f2937; margin-bottom: 16px;">${giftCard.salons.name} Gift Card</h2>
        <div style="font-size: 24px; font-weight: bold; color: #059669; margin: 16px 0;">
          $${giftCard.original_amount.toFixed(2)}
        </div>
        <div style="font-size: 18px; font-weight: bold; background: #f3f4f6; padding: 12px; border-radius: 4px; margin: 16px 0;">
          ${giftCard.code}
        </div>
        ${giftCard.message ? `<p style="font-style: italic; color: #6b7280;">"${giftCard.message}"</p>` : ''}
        <p>From: ${giftCard.purchaser_name}</p>
      </div>
      <p>Use this code when booking your appointment online or show this email in-salon.</p>
      ${giftCard.expires_at ? `<p style="color: #dc2626;"><strong>Expires:</strong> ${new Date(giftCard.expires_at).toLocaleDateString()}</p>` : ''}
    </div>
  `
}

/**
 * Validate and activate gift card (for physical cards)
 */
export async function activateGiftCard(code: string, salonId: string) {
  try {
    const { user } = await getUser()
    if (!user) {
      throw new Error('Authentication required')
    }

    const supabase = await createClient()

    // Check user permissions
    const { data: salonAccess } = await supabase
      .from('user_salon_access')
      .select('role')
      .eq('user_id', user.id)
      .eq('salon_id', salonId)
      .single()

    if (!salonAccess || !['salon_admin', 'location_admin', 'staff', 'super_admin'].includes(salonAccess.role)) {
      throw new Error('Insufficient permissions')
    }

    // Find and activate the gift card
    const { data, error } = await supabase
      .from('gift_cards')
      .update({
        status: 'active',
        purchased_at: new Date().toISOString(),
      })
      .eq('code', code.toUpperCase())
      .eq('salon_id', salonId)
      .eq('status', 'pending')
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          success: false,
          error: 'Gift card not found or already activated'
        }
      }
      throw new Error('Failed to activate gift card')
    }

    return { success: true, data }
  } catch (error) {
    console.error('Activate gift card error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to activate gift card'
    }
  }
}