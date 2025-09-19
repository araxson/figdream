// Action types and interfaces for subscription actions

export interface ActionResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[] | undefined>
  code?: string
  message?: string
}

export interface Subscription {
  id: string
  salon_id: string
  customer_id: string
  stripe_subscription_id?: string | null
  plan_id: string
  status: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'incomplete'
  current_period_start: string
  current_period_end: string
  cancel_at_period_end?: boolean
  trial_end?: string | null
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface SubscriptionInsert {
  salon_id: string
  customer_id?: string
  stripe_subscription_id?: string
  plan_id: string
  trial_end?: string
  metadata?: Record<string, any>
}

export interface SubscriptionUpdate {
  status?: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'incomplete'
  cancel_at_period_end?: boolean
  metadata?: Record<string, any>
}