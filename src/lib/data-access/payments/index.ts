'use server'
/**
 * Payment Data Access Layer
 * 
 * This module handles subscription payments for salon owners ONLY.
 * Customers do NOT pay through the platform - they book for FREE.
 * Any payments between customers and salons happen OUTSIDE the platform.
 * 
 * Business Model:
 * - Platform is SaaS subscription-based
 * - ONLY salon owners pay subscriptions to use the platform
 * - Customers book appointments for FREE (no payment to platform)
 * - Payment processing between customers and salons is handled externally
 */

import { createClient } from '@/lib/database/supabase/server'
import { getUserWithRole } from '@/lib/data-access/auth/verify'
import { hasMinimumRoleLevel } from '@/lib/data-access/auth/roles'

/**
 * Check if salon has active subscription
 * Used to verify salon can accept bookings
 */
export async function checkSalonSubscriptionStatus(salonId: string) {
  try {
    const supabase = await createClient()
    
    const { data: subscription, error } = await supabase
      .from('salon_subscriptions')
      .select('status, current_period_end')
      .eq('salon_id', salonId)
      .eq('status', 'active')
      .gte('current_period_end', new Date().toISOString())
      .single()
    
    if (error || !subscription) {
      return { 
        isActive: false, 
        message: 'Salon subscription is not active'
      }
    }
    
    return { 
      isActive: true,
      currentPeriodEnd: subscription.current_period_end
    }
  } catch (_error) {
    return { 
      isActive: false, 
      message: 'Failed to verify subscription status'
    }
  }
}

/**
 * Get subscription details for salon owner
 * Only accessible by salon owners and super admins
 */
export async function getSalonSubscription(salonId: string) {
  try {
    const { user, role, error: authError } = await getUserWithRole()
    if (authError || !user || !role) {
      return { data: null, error: 'Not authenticated' }
    }
    
    // Check permissions - must be salon owner or super admin
    const { hasRole: canView } = await hasMinimumRoleLevel('salon_owner')
    if (!canView) {
      return { data: null, error: 'Insufficient permissions' }
    }
    
    const supabase = await createClient()
    
    const { data: subscription, error } = await supabase
      .from('salon_subscriptions')
      .select(`
        *,
        subscription_plans (
          name,
          price,
          features,
          max_locations,
          max_staff
        )
      `)
      .eq('salon_id', salonId)
      .single()
    
    if (error) {
      return { data: null, error: 'Subscription not found' }
    }
    
    return { data: subscription, error: null }
  } catch (_error) {
    return { data: null, error: 'Failed to get subscription' }
  }
}

/**
 * List all subscription plans available for salons
 * Public endpoint - anyone can view available plans
 */
export async function getSubscriptionPlans() {
  try {
    const supabase = await createClient()
    
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true })
    
    if (error) {
      return { data: null, error: 'Failed to load subscription plans' }
    }
    
    return { data: plans, error: null }
  } catch (_error) {
    return { data: null, error: 'Failed to get subscription plans' }
  }
}

/**
 * Get subscription invoices for salon
 * Only accessible by salon owners and super admins
 */
export async function getSalonInvoices(salonId: string) {
  try {
    const { user, role, error: authError } = await getUserWithRole()
    if (authError || !user || !role) {
      return { data: null, error: 'Not authenticated' }
    }
    
    const { hasRole: canView } = await hasMinimumRoleLevel('salon_owner')
    if (!canView) {
      return { data: null, error: 'Insufficient permissions' }
    }
    
    const supabase = await createClient()
    
    const { data: invoices, error } = await supabase
      .from('subscription_invoices')
      .select('*')
      .eq('salon_id', salonId)
      .order('created_at', { ascending: false })
    
    if (error) {
      return { data: null, error: 'Failed to load invoices' }
    }
    
    return { data: invoices, error: null }
  } catch (_error) {
    return { data: null, error: 'Failed to get invoices' }
  }
}

export {
  // Re-export only subscription-related functions from stripe.ts
  ensureStripeCustomerForSalon,
  createSalonSubscription,
  updateSalonSubscription,
  cancelSalonSubscription,
  getSalonBillingPortalUrl
} from './stripe'