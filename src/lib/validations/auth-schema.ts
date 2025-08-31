/**
 * Authentication validation schemas for FigDream
 * Comprehensive Zod schemas for login, register, password reset, and other auth operations
 */

import { z } from 'zod'

// Common regex patterns
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/

// User roles enum
const UserRole = z.enum(['super_admin', 'salon_admin', 'location_admin', 'staff', 'customer'], {
  errorMap: () => ({ message: 'Invalid user role' })
})

// Gender enum
const Gender = z.enum(['male', 'female', 'other', 'prefer_not_to_say'], {
  errorMap: () => ({ message: 'Please select a valid gender option' })
})

// Base validation schemas
export const emailSchema = z
  .string({ required_error: 'Email is required' })
  .min(1, 'Email is required')
  .max(255, 'Email must be less than 255 characters')
  .regex(emailRegex, 'Please enter a valid email address')
  .toLowerCase()
  .trim()

export const passwordSchema = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must be less than 128 characters')
  .regex(passwordRegex, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')

export const phoneSchema = z
  .string()
  .optional()
  .nullable()
  .refine((val) => !val || phoneRegex.test(val), {
    message: 'Please enter a valid phone number'
  })
  .transform((val) => val || null)

export const nameSchema = z
  .string({ required_error: 'Name is required' })
  .min(1, 'Name is required')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s\-\'\.]+$/, 'Name can only contain letters, spaces, hyphens, apostrophes, and periods')
  .trim()

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
  remember_me: z.boolean().optional().default(false)
})

// Register schema
export const registerSchema = z.object({
  first_name: nameSchema,
  last_name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  confirm_password: z.string({ required_error: 'Please confirm your password' }),
  date_of_birth: z
    .string()
    .optional()
    .nullable()
    .refine((val) => {
      if (!val) return true
      const date = new Date(val)
      const today = new Date()
      const age = today.getFullYear() - date.getFullYear()
      return age >= 13 && age <= 120
    }, {
      message: 'You must be between 13 and 120 years old'
    })
    .transform((val) => val || null),
  gender: Gender.optional().nullable(),
  terms_accepted: z
    .boolean({ required_error: 'You must accept the terms and conditions' })
    .refine((val) => val === true, {
      message: 'You must accept the terms and conditions'
    }),
  marketing_consent: z.boolean().optional().default(false)
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password']
})

// Salon owner registration schema
export const salonOwnerRegisterSchema = registerSchema.extend({
  salon_name: z
    .string({ required_error: 'Salon name is required' })
    .min(1, 'Salon name is required')
    .max(100, 'Salon name must be less than 100 characters')
    .trim(),
  business_license: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || val.length <= 50, {
      message: 'Business license must be less than 50 characters'
    })
    .transform((val) => val || null)
})

// Staff registration schema
export const staffRegisterSchema = z.object({
  first_name: nameSchema,
  last_name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  confirm_password: z.string({ required_error: 'Please confirm your password' }),
  date_of_birth: z
    .string()
    .optional()
    .nullable()
    .refine((val) => {
      if (!val) return true
      const date = new Date(val)
      const today = new Date()
      const age = today.getFullYear() - date.getFullYear()
      return age >= 16 && age <= 120
    }, {
      message: 'Staff must be between 16 and 120 years old'
    })
    .transform((val) => val || null),
  gender: Gender.optional().nullable(),
  employee_id: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || val.length <= 20, {
      message: 'Employee ID must be less than 20 characters'
    })
    .transform((val) => val || null),
  terms_accepted: z
    .boolean({ required_error: 'You must accept the terms and conditions' })
    .refine((val) => val === true, {
      message: 'You must accept the terms and conditions'
    })
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password']
})

// Password reset request schema
export const forgotPasswordSchema = z.object({
  email: emailSchema
})

// Password reset schema
export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirm_password: z.string({ required_error: 'Please confirm your password' }),
  token: z
    .string({ required_error: 'Reset token is required' })
    .min(1, 'Invalid reset token')
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password']
})

// Change password schema
export const changePasswordSchema = z.object({
  current_password: z
    .string({ required_error: 'Current password is required' })
    .min(1, 'Current password is required'),
  new_password: passwordSchema,
  confirm_password: z.string({ required_error: 'Please confirm your new password' })
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password']
}).refine((data) => data.current_password !== data.new_password, {
  message: 'New password must be different from current password',
  path: ['new_password']
})

// Email verification schema
export const emailVerificationSchema = z.object({
  token: z
    .string({ required_error: 'Verification token is required' })
    .min(1, 'Invalid verification token'),
  email: emailSchema.optional()
})

// Resend verification email schema
export const resendVerificationSchema = z.object({
  email: emailSchema
})

// OAuth callback schema
export const oauthCallbackSchema = z.object({
  code: z
    .string({ required_error: 'Authorization code is required' })
    .min(1, 'Invalid authorization code'),
  state: z
    .string()
    .optional()
    .nullable(),
  provider: z.enum(['google', 'facebook', 'apple'], {
    errorMap: () => ({ message: 'Invalid OAuth provider' })
  })
})

// Session refresh schema
export const refreshSessionSchema = z.object({
  refresh_token: z
    .string({ required_error: 'Refresh token is required' })
    .min(1, 'Invalid refresh token')
})

// Account deactivation schema
export const deactivateAccountSchema = z.object({
  password: z
    .string({ required_error: 'Password is required to deactivate account' })
    .min(1, 'Password is required'),
  reason: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || val.length <= 500, {
      message: 'Reason must be less than 500 characters'
    })
    .transform((val) => val || null),
  feedback: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || val.length <= 1000, {
      message: 'Feedback must be less than 1000 characters'
    })
    .transform((val) => val || null)
})

// Two-factor authentication setup schema
export const twoFactorSetupSchema = z.object({
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
  phone: phoneSchema.refine((val) => val !== null && val !== undefined, {
    message: 'Phone number is required for two-factor authentication'
  })
})

// Two-factor authentication verify schema
export const twoFactorVerifySchema = z.object({
  code: z
    .string({ required_error: 'Verification code is required' })
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d{6}$/, 'Verification code must contain only numbers'),
  remember_device: z.boolean().optional().default(false)
})

// Partial schemas for updates
export const loginUpdateSchema = loginSchema.partial()
export const registerUpdateSchema = registerSchema.partial()
export const salonOwnerRegisterUpdateSchema = salonOwnerRegisterSchema.partial()
export const staffRegisterUpdateSchema = staffRegisterSchema.partial()

// Type exports
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type SalonOwnerRegisterInput = z.infer<typeof salonOwnerRegisterSchema>
export type StaffRegisterInput = z.infer<typeof staffRegisterSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type EmailVerificationInput = z.infer<typeof emailVerificationSchema>
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>
export type OAuthCallbackInput = z.infer<typeof oauthCallbackSchema>
export type RefreshSessionInput = z.infer<typeof refreshSessionSchema>
export type DeactivateAccountInput = z.infer<typeof deactivateAccountSchema>
export type TwoFactorSetupInput = z.infer<typeof twoFactorSetupSchema>
export type TwoFactorVerifyInput = z.infer<typeof twoFactorVerifySchema>

// Update type exports
export type LoginUpdateInput = z.infer<typeof loginUpdateSchema>
export type RegisterUpdateInput = z.infer<typeof registerUpdateSchema>
export type SalonOwnerRegisterUpdateInput = z.infer<typeof salonOwnerRegisterUpdateSchema>
export type StaffRegisterUpdateInput = z.infer<typeof staffRegisterUpdateSchema>

// Export individual field schemas for reuse
export { 
  UserRole, 
  Gender, 
  emailSchema, 
  passwordSchema, 
  phoneSchema, 
  nameSchema 
}