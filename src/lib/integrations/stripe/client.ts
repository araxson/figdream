/**
 * Stripe client configuration for FigDream
 * Browser-side Stripe initialization and utilities
 */
import { loadStripe, Stripe, StripeElementsOptions } from '@stripe/stripe-js'
// Singleton pattern for Stripe instance
let stripePromise: Promise<Stripe | null> | null = null
/**
 * Get Stripe instance (browser-side only)
 * This should only be called on the client side
 */
export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!publishableKey) {
      return Promise.resolve(null)
    }
    stripePromise = loadStripe(publishableKey, {
      // Optional: Configure Stripe.js options
      locale: 'en',
      apiVersion: '2025-08-27.basil',
    })
  }
  return stripePromise
}
/**
 * Default Elements options for consistent styling
 */
export const defaultElementsOptions: StripeElementsOptions = {
  appearance: {
    theme: 'stripe',
    variables: {
      colorPrimary: '#6366f1', // Indigo-500
      colorBackground: '#ffffff',
      colorText: '#374151', // Gray-700
      colorDanger: '#ef4444', // Red-500
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
    rules: {
      '.Input': {
        fontSize: '14px',
        padding: '12px',
        border: '1px solid #d1d5db', // Gray-300
      },
      '.Input:focus': {
        border: '1px solid #6366f1', // Indigo-500
        boxShadow: '0 0 0 1px #6366f1',
      },
      '.Label': {
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151', // Gray-700
      },
      '.Error': {
        fontSize: '12px',
        color: '#ef4444', // Red-500
      },
    },
  },
  clientSecret: '', // This will be set dynamically
}
/**
 * Create Elements options with client secret
 */
export const createElementsOptions = (
  clientSecret: string,
  options?: Partial<StripeElementsOptions>
): StripeElementsOptions => ({
  ...defaultElementsOptions,
  ...options,
  clientSecret,
} as StripeElementsOptions)
/**
 * Stripe payment method types supported by FigDream
 */
export const SUPPORTED_PAYMENT_METHODS = [
  'card',
  'us_bank_account',
  'apple_pay',
  'google_pay',
  'link',
] as const
export type SupportedPaymentMethod = typeof SUPPORTED_PAYMENT_METHODS[number]
/**
 * Currency codes supported by FigDream
 */
export const SUPPORTED_CURRENCIES = [
  'usd',
  'cad',
  'eur', 
  'gbp',
  'aud',
] as const
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number]
/**
 * Payment intent confirmation options
 */
export const DEFAULT_CONFIRMATION_OPTIONS = {
  return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/confirmation`,
  use_stripe_sdk: true,
}
/**
 * Setup intent confirmation options
 */
export const DEFAULT_SETUP_OPTIONS = {
  return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/setup-confirmation`,
  use_stripe_sdk: true,
}
/**
 * Format amount for Stripe (convert dollars to cents)
 */
export const formatAmountForStripe = (amount: number, currency: SupportedCurrency = 'usd'): number => {
  const zeroDecimalCurrencies = ['jpy', 'krw', 'vnd']
  if (zeroDecimalCurrencies.includes(currency.toLowerCase())) {
    return Math.round(amount)
  }
  return Math.round(amount * 100)
}
/**
 * Format amount from Stripe (convert cents to dollars)
 */
export const formatAmountFromStripe = (amount: number, currency: SupportedCurrency = 'usd'): number => {
  const zeroDecimalCurrencies = ['jpy', 'krw', 'vnd']
  if (zeroDecimalCurrencies.includes(currency.toLowerCase())) {
    return amount
  }
  return amount / 100
}
/**
 * Format amount for display
 */
export const formatAmountForDisplay = (
  amount: number, 
  currency: SupportedCurrency = 'usd',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(formatAmountFromStripe(amount, currency))
}
/**
 * Validate Stripe client secret format
 */
export const isValidClientSecret = (clientSecret: string): boolean => {
  if (!clientSecret || typeof clientSecret !== 'string') {
    return false
  }
  // Payment Intent client secrets start with 'pi_'
  // Setup Intent client secrets start with 'seti_'
  return clientSecret.includes('_client_secret_') && 
         (clientSecret.startsWith('pi_') || clientSecret.startsWith('seti_'))
}
/**
 * Get payment method type from Stripe PaymentMethod object
 */
export const getPaymentMethodDisplayName = (type: string): string => {
  const displayNames: Record<string, string> = {
    card: 'Credit/Debit Card',
    us_bank_account: 'Bank Account',
    apple_pay: 'Apple Pay',
    google_pay: 'Google Pay',
    link: 'Link',
    paypal: 'PayPal',
  }
  return displayNames[type] || type.replace('_', ' ')
}
/**
 * Check if payment method type is wallet-based
 */
export const isWalletPaymentMethod = (type: string): boolean => {
  return ['apple_pay', 'google_pay', 'samsung_pay', 'paypal'].includes(type)
}
/**
 * Error handling for Stripe errors
 */
export class CustomStripeError extends Error {
  public code?: string
  public type?: string
  public param?: string
  constructor(message: string, code?: string, type?: string, param?: string) {
    super(message)
    this.name = 'CustomStripeError'
    this.code = code
    this.type = type
    this.param = param
  }
}
/**
 * Format Stripe error for display
 */
export const formatStripeError = (error: StripeJSError | CustomStripeError | unknown): string => {
  if (!error) return 'An unknown error occurred'
  const stripeError = error as StripeJSError | CustomStripeError
  if (stripeError.type === 'card_error' || stripeError.type === 'validation_error') {
    return stripeError.message || 'Invalid card information'
  }
  if ('type' in stripeError && stripeError.type === 'rate_limit_error') {
    return 'Too many requests. Please try again later.'
  }
  if (stripeError.type === 'invalid_request_error') {
    return 'Invalid request. Please check your information and try again.'
  }
  if (stripeError.type === 'api_connection_error') {
    return 'Network error. Please check your connection and try again.'
  }
  if (stripeError.type === 'api_error') {
    return 'Payment service temporarily unavailable. Please try again later.'
  }
  if (stripeError.type === 'authentication_error') {
    return 'Authentication error. Please refresh the page and try again.'
  }
  return (error as Error).message || 'Payment failed. Please try again.'
}
/**
 * Check if browser supports Stripe features
 */
export const checkBrowserSupport = (): {
  supportsPaymentRequest: boolean
  supportsSecurePayments: boolean
} => {
  if (typeof window === 'undefined') {
    return {
      supportsPaymentRequest: false,
      supportsSecurePayments: false,
    }
  }
  return {
    supportsPaymentRequest: !!window.PaymentRequest,
    supportsSecurePayments: window.location.protocol === 'https:' || 
                            window.location.hostname === 'localhost',
  }
}