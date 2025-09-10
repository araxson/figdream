import * as z from 'zod'

export const serviceSchema = z.object({
  salonId: z.string().uuid('Invalid salon ID'),
  name: z.string().min(1, 'Service name is required').max(100, 'Service name is too long'),
  category: z.string().min(1, 'Category is required').max(50, 'Category name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  duration: z.number()
    .min(15, 'Duration must be at least 15 minutes')
    .max(480, 'Duration cannot exceed 8 hours'),
  price: z.number()
    .min(0, 'Price cannot be negative')
    .max(10000, 'Price seems too high'),
  isActive: z.boolean().default(true),
  requiresDeposit: z.boolean().default(false),
  depositAmount: z.number().min(0).optional(),
  maxAdvanceBooking: z.number().min(1).max(365).default(30),
  minAdvanceBooking: z.number().min(0).max(48).default(0),
})

export const serviceCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50),
  description: z.string().max(200).optional(),
  displayOrder: z.number().min(0).default(0),
})

export type ServiceInput = z.infer<typeof serviceSchema>
export type ServiceCategoryInput = z.infer<typeof serviceCategorySchema>