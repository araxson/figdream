/**
 * Payment validation schemas for FigDream
 * Comprehensive Zod schemas for payment processing, refunds, and financial operations
 */
import { z } from 'zod'
// Import reusable schemas
import { userIdSchema } from './user-schema'
import { bookingIdSchema } from './booking-schema'
// Common regex patterns
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const creditCardRegex = /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/
const cvvRegex = /^\d{3,4}$/
const expirationRegex = /^(0[1-9]|1[0-2])\/\d{2}$/
const routingNumberRegex = /^\d{9}$/
const accountNumberRegex = /^\d{4,20}$/
const postalCodeRegex = /^[A-Za-z0-9\s\-]{3,10}$/
// Payment method enum
const PaymentMethod = z.enum(['cash', 'card', 'online', 'gift_card', 'bank_transfer', 'digital_wallet'], {
  message: 'Invalid payment method'
})
// Payment status enum
const PaymentStatus = z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded'], {
  message: 'Invalid payment status'
})
// Currency enum
const Currency = z.enum(['USD', 'CAD', 'EUR', 'GBP', 'AUD', 'JPY'], {
  message: 'Unsupported currency'
})
// Card type enum
const CardType = z.enum(['visa', 'mastercard', 'amex', 'discover', 'jcb', 'diners', 'unknown'], {
  message: 'Invalid card type'
})
// Digital wallet providers
const DigitalWalletProvider = z.enum(['apple_pay', 'google_pay', 'samsung_pay', 'paypal', 'venmo'], {
  message: 'Invalid digital wallet provider'
})
// Base validation schemas
export const paymentIdSchema = z
  .string()
  .regex(uuidRegex, 'Invalid payment ID format')
export const amountSchema = z
  .number()
  .min(0.01, 'Amount must be at least $0.01')
  .max(50000, 'Amount cannot exceed $50,000')
  .multipleOf(0.01, 'Amount must have at most 2 decimal places')
export const tipAmountSchema = z
  .number()
  .min(0, 'Tip amount cannot be negative')
  .max(5000, 'Tip amount cannot exceed $5,000')
  .multipleOf(0.01, 'Tip amount must have at most 2 decimal places')
  .optional()
  .default(0)
export const transactionIdSchema = z
  .string()
  .nullable()
  .optional()
  .refine((val) => !val || (val.length >= 5 && val.length <= 100), {
    message: 'Transaction ID must be between 5 and 100 characters'
  })
  .transform((val) => val?.trim() || null)
export const referenceNumberSchema = z
  .string()
  .nullable()
  .optional()
  .refine((val) => !val || (val.length >= 3 && val.length <= 50), {
    message: 'Reference number must be between 3 and 50 characters'
  })
  .transform((val) => val?.trim() || null)
// Credit card validation schemas
export const creditCardNumberSchema = z
  .string()
  .regex(creditCardRegex, 'Invalid card number format')
  .transform((val) => val.replace(/\s/g, '')) // Remove spaces
  .refine((val) => {
    // Luhn algorithm validation
    let sum = 0
    let isEven = false
    for (let i = val.length - 1; i >= 0; i--) {
      let digit = parseInt(val[i], 10)
      if (isEven) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }
      }
      sum += digit
      isEven = !isEven
    }
    return sum % 10 === 0
  }, {
    message: 'Invalid card number'
  })
export const cvvSchema = z
  .string()
  .regex(cvvRegex, 'CVV must be 3 or 4 digits')
export const expirationDateSchema = z
  .string()
  .regex(expirationRegex, 'Expiration date must be in MM/YY format')
  .refine((val) => {
    const [month, year] = val.split('/').map(Number)
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const expYear = year < 50 ? 2000 + year : 1900 + year
    const currentFullYear = currentDate.getFullYear()
    if (expYear < currentFullYear) return false
    if (expYear === currentFullYear && month < currentMonth) return false
    return true
  }, {
    message: 'Card has expired'
  })
export const cardholderNameSchema = z
  .string()
  .min(1, 'Cardholder name is required')
  .max(100, 'Cardholder name must be less than 100 characters')
  .regex(/^[a-zA-Z\s\-\'\.]+$/, 'Cardholder name can only contain letters, spaces, hyphens, apostrophes, and periods')
  .trim()
// Billing address schema
export const billingAddressSchema = z.object({
  street_address: z
    .string()
    .min(5, 'Street address must be at least 5 characters')
    .max(100, 'Street address must be less than 100 characters')
    .trim(),
  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must be less than 50 characters')
    .regex(/^[a-zA-Z\s\-\'\.]+$/, 'City can only contain letters, spaces, hyphens, apostrophes, and periods')
    .trim(),
  state: z
    .string()
    .min(2, 'State must be at least 2 characters')
    .max(50, 'State must be less than 50 characters')
    .trim(),
  postal_code: z
    .string()
    .regex(postalCodeRegex, 'Invalid postal code format')
    .trim(),
  country: z
    .string()
    .min(2, 'Country must be at least 2 characters')
    .max(50, 'Country must be less than 50 characters')
    .default('United States')
})
// Bank account validation schemas
export const bankAccountSchema = z.object({
  account_holder_name: z
    .string()
    .min(1, 'Account holder name is required')
    .max(100, 'Account holder name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-\'\.]+$/, 'Account holder name can only contain letters, spaces, hyphens, apostrophes, and periods')
    .trim(),
  routing_number: z
    .string()
    .regex(routingNumberRegex, 'Routing number must be 9 digits'),
  account_number: z
    .string()
    .regex(accountNumberRegex, 'Account number must be between 4 and 20 digits'),
  account_type: z
    .enum(['checking', 'savings'])
    .default('checking')
})
// Credit card payment schema
export const creditCardPaymentSchema = z.object({
  card_number: creditCardNumberSchema,
  cvv: cvvSchema,
  expiration_date: expirationDateSchema,
  cardholder_name: cardholderNameSchema,
  billing_address: billingAddressSchema,
  save_card: z.boolean().optional().default(false),
  card_type: CardType.optional()
})
// Digital wallet payment schema
export const digitalWalletPaymentSchema = z.object({
  provider: DigitalWalletProvider,
  wallet_token: z
    .string()
    .min(10, 'Invalid wallet token')
    .max(500, 'Wallet token is too long'),
  device_id: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || val.length <= 100, {
      message: 'Device ID must be less than 100 characters'
    })
})
// Bank transfer payment schema
export const bankTransferPaymentSchema = z.object({
  bank_account: bankAccountSchema,
  transfer_type: z
    .enum(['ach', 'wire', 'instant'])
    .default('ach'),
  memo: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || val.length <= 100, {
      message: 'Memo must be less than 100 characters'
    })
    .transform((val) => val?.trim() || null)
})
// Gift card payment schema
export const giftCardPaymentSchema = z.object({
  gift_card_code: z
    .string()
    .min(8, 'Gift card code must be at least 8 characters')
    .max(50, 'Gift card code must be less than 50 characters')
    .regex(/^[A-Z0-9\-]+$/, 'Gift card code can only contain uppercase letters, numbers, and hyphens')
    .trim(),
  pin: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || /^\d{4,8}$/.test(val), {
      message: 'PIN must be 4-8 digits'
    })
})
// Base payment schema
export const createPaymentSchema = z.object({
  booking_id: bookingIdSchema,
  customer_id: userIdSchema,
  amount: amountSchema,
  tip_amount: tipAmountSchema,
  currency: Currency.default('USD'),
  payment_method: PaymentMethod,
  description: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || val.length <= 250, {
      message: 'Description must be less than 250 characters'
    })
    .transform((val) => val?.trim() || null),
  metadata: z
    .record(z.string(), z.string())
    .optional()
    .refine((val) => !val || Object.keys(val).length <= 10, {
      message: 'Cannot have more than 10 metadata fields'
    }),
  save_payment_method: z.boolean().optional().default(false)
}).and(
  z.discriminatedUnion('payment_method', [
    z.object({
      payment_method: z.literal('card'),
      card_details: creditCardPaymentSchema
    }),
    z.object({
      payment_method: z.literal('digital_wallet'),
      wallet_details: digitalWalletPaymentSchema
    }),
    z.object({
      payment_method: z.literal('bank_transfer'),
      bank_details: bankTransferPaymentSchema
    }),
    z.object({
      payment_method: z.literal('gift_card'),
      gift_card_details: giftCardPaymentSchema
    }),
    z.object({
      payment_method: z.literal('cash'),
      received_by: userIdSchema
    }),
    z.object({
      payment_method: z.literal('online'),
      payment_intent_id: z.string().min(1, 'Payment intent ID is required')
    })
  ])
)
// Payment confirmation schema
export const confirmPaymentSchema = z.object({
  payment_id: paymentIdSchema,
  transaction_id: transactionIdSchema.refine((val) => val !== null && val !== undefined, {
    message: 'Transaction ID is required for payment confirmation'
  }),
  confirmed_amount: amountSchema.optional(),
  gateway_response: z
    .record(z.string(), z.any())
    .optional(),
  receipt_url: z
    .string()
    .url('Receipt URL must be valid')
    .optional()
    .nullable()
})
// Payment refund schema
export const refundPaymentSchema = z.object({
  payment_id: paymentIdSchema,
  refund_amount: amountSchema.optional(), // If not provided, full refund
  reason: z
    .string()
    .min(5, 'Refund reason must be at least 5 characters')
    .max(250, 'Refund reason must be less than 250 characters')
    .trim(),
  refunded_by: userIdSchema,
  notify_customer: z.boolean().optional().default(true),
  internal_notes: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || val.length <= 500, {
      message: 'Internal notes must be less than 500 characters'
    })
    .transform((val) => val?.trim() || null)
})
// Payment dispute schema
export const paymentDisputeSchema = z.object({
  payment_id: paymentIdSchema,
  dispute_id: z
    .string()
    .min(5, 'Dispute ID must be at least 5 characters')
    .max(100, 'Dispute ID must be less than 100 characters'),
  dispute_reason: z
    .enum(['fraudulent', 'unrecognized', 'duplicate', 'product_not_received', 'product_unacceptable', 'other'])
    .default('other'),
  dispute_amount: amountSchema,
  evidence_required: z.boolean().optional().default(false),
  response_deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Response deadline must be in YYYY-MM-DD format')
    .optional()
    .nullable(),
  status: z
    .enum(['open', 'under_review', 'won', 'lost', 'withdrawn'])
    .default('open')
})
// Saved payment method schema
export const savedPaymentMethodSchema = z.object({
  customer_id: userIdSchema,
  payment_method_type: z.enum(['card', 'bank_account', 'digital_wallet']),
  is_default: z.boolean().optional().default(false),
  nickname: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || (val.length >= 1 && val.length <= 50), {
      message: 'Nickname must be between 1 and 50 characters'
    })
    .transform((val) => val?.trim() || null)
}).and(
  z.discriminatedUnion('payment_method_type', [
    z.object({
      payment_method_type: z.literal('card'),
      card_last_four: z.string().length(4, 'Card last four must be 4 digits').regex(/^\d{4}$/, 'Card last four must be digits'),
      card_type: CardType,
      expiration_month: z.number().int().min(1).max(12),
      expiration_year: z.number().int().min(new Date().getFullYear()).max(new Date().getFullYear() + 20),
      cardholder_name: cardholderNameSchema,
      billing_address: billingAddressSchema
    }),
    z.object({
      payment_method_type: z.literal('bank_account'),
      account_last_four: z.string().length(4, 'Account last four must be 4 digits').regex(/^\d{4}$/, 'Account last four must be digits'),
      account_type: z.enum(['checking', 'savings']),
      bank_name: z.string().min(1).max(100),
      account_holder_name: z.string().min(1).max(100)
    }),
    z.object({
      payment_method_type: z.literal('digital_wallet'),
      provider: DigitalWalletProvider,
      wallet_email: z.string().email('Invalid wallet email').optional().nullable()
    })
  ])
)
// Payment analytics schema
export const paymentAnalyticsSchema = z.object({
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
  salon_id: z.string().regex(uuidRegex, 'Invalid salon ID format').optional(),
  location_id: z.string().regex(uuidRegex, 'Invalid location ID format').optional(),
  payment_methods: z.array(PaymentMethod).optional(),
  currency: Currency.optional(),
  group_by: z
    .enum(['day', 'week', 'month', 'payment_method', 'location'])
    .optional()
    .default('day'),
  include_refunds: z.boolean().optional().default(true),
  include_tips: z.boolean().optional().default(true)
}).refine((data) => {
  return new Date(data.start_date) <= new Date(data.end_date)
}, {
  message: 'Start date must be before or equal to end date',
  path: ['end_date']
})
// Payment search/filter schema
export const paymentFilterSchema = z.object({
  customer_id: userIdSchema.optional(),
  booking_id: bookingIdSchema.optional(),
  payment_method: PaymentMethod.optional(),
  status: PaymentStatus.optional(),
  currency: Currency.optional(),
  min_amount: z.number().min(0).optional(),
  max_amount: z.number().min(0).optional(),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
    .optional(),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
    .optional(),
  transaction_id: z.string().optional(),
  has_tip: z.boolean().optional(),
  page: z
    .number()
    .int()
    .min(1, 'Page must be at least 1')
    .optional()
    .default(1),
  limit: z
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .optional()
    .default(20),
  sort_by: z
    .enum(['created_at', 'amount', 'status', 'payment_method'])
    .optional()
    .default('created_at'),
  sort_order: z
    .enum(['asc', 'desc'])
    .optional()
    .default('desc')
}).refine((data) => {
  if (data.min_amount && data.max_amount) {
    return data.min_amount <= data.max_amount
  }
  return true
}, {
  message: 'Minimum amount must be less than or equal to maximum amount',
  path: ['max_amount']
}).refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.start_date) <= new Date(data.end_date)
  }
  return true
}, {
  message: 'Start date must be before or equal to end date',
  path: ['end_date']
})
// Bulk payment operations schema
export const bulkPaymentUpdateSchema = z.object({
  payment_ids: z
    .array(paymentIdSchema)
    .min(1, 'At least one payment ID is required')
    .max(100, 'Cannot update more than 100 payments at once'),
  updates: z.object({
    status: PaymentStatus.optional(),
    internal_notes: z
      .string()
      .optional()
      .refine((val) => !val || val.length <= 500, {
        message: 'Internal notes must be less than 500 characters'
      })
  }).refine((data) => {
    return Object.keys(data).length > 0
  }, {
    message: 'At least one update field must be provided'
  })
})
// Partial schemas for updates
// Note: Since createPaymentSchema uses intersection, we can't use .partial() directly
// For updates, specific update schemas should be created as needed
export const createPaymentUpdateSchema = z.object({
  amount: amountSchema.optional(),
  tip_amount: tipAmountSchema.optional(),
  description: z.string().optional().nullable(),
  metadata: z.record(z.string(), z.any()).optional()
})
// Type exports
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>
export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>
export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>
export type PaymentDisputeInput = z.infer<typeof paymentDisputeSchema>
export type SavedPaymentMethodInput = z.infer<typeof savedPaymentMethodSchema>
export type PaymentAnalyticsInput = z.infer<typeof paymentAnalyticsSchema>
export type PaymentFilterInput = z.infer<typeof paymentFilterSchema>
export type BulkPaymentUpdateInput = z.infer<typeof bulkPaymentUpdateSchema>
export type CreditCardPaymentInput = z.infer<typeof creditCardPaymentSchema>
export type DigitalWalletPaymentInput = z.infer<typeof digitalWalletPaymentSchema>
export type BankTransferPaymentInput = z.infer<typeof bankTransferPaymentSchema>
export type GiftCardPaymentInput = z.infer<typeof giftCardPaymentSchema>
export type BillingAddressInput = z.infer<typeof billingAddressSchema>
export type BankAccountInput = z.infer<typeof bankAccountSchema>
// Update type exports
export type CreatePaymentUpdateInput = z.infer<typeof createPaymentUpdateSchema>