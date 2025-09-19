import { z } from 'zod'

export const CreateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  display_name: z.string().min(2, 'Name must be at least 2 characters'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  role: z.enum(['customer', 'staff', 'owner', 'admin', 'super_admin']).default('customer'),
  send_welcome_email: z.boolean().default(true),
  auto_confirm_email: z.boolean().default(false)
})

export const UpdateUserSchema = CreateUserSchema.omit({ email: true, password: true }).partial()

export const UpdateRoleSchema = z.object({
  role: z.enum(['customer', 'staff', 'owner', 'admin', 'super_admin']),
  reason: z.string().optional()
})

export const ResetPasswordSchema = z.object({
  temporary_password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  send_email: z.boolean().default(true),
  require_change: z.boolean().default(true)
})

export const SecuritySettingsSchema = z.object({
  two_factor_enabled: z.boolean().optional(),
  email_notifications: z.boolean().optional(),
  security_alerts: z.boolean().optional()
})

export const BulkOperationSchema = z.object({
  userIds: z.array(z.string()),
  operation: z.enum(['suspend', 'activate', 'delete'])
})