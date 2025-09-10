import * as z from 'zod'

export const customerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
    .or(z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Invalid phone format')),
  dateOfBirth: z.date().optional(),
  address: z.string().max(200, 'Address is too long').optional(),
  city: z.string().max(50, 'City name is too long').optional(),
  state: z.string().max(50, 'State name is too long').optional(),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code').optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  marketingConsent: z.boolean().default(false),
})

export const updateCustomerSchema = customerSchema.partial()

export type CustomerInput = z.infer<typeof customerSchema>
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>