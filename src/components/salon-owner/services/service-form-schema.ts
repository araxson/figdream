import * as z from 'zod'

export const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category_id: z.string().uuid('Please select a category'),
  service_type: z.enum(['standard', 'premium', 'express', 'addon']),
  price: z.number().min(0, 'Price must be positive'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes'),
  max_capacity: z.number().min(1, 'Capacity must be at least 1'),
  
  // Booking settings
  buffer_time: z.number().min(0),
  advance_booking_days: z.number().min(0),
  max_bookings_per_day: z.number().min(0).optional(),
  requires_deposit: z.boolean(),
  deposit_amount: z.number().min(0).optional(),
  deposit_percentage: z.number().min(0).max(100).optional(),
  
  // Availability
  is_active: z.boolean(),
  available_online: z.boolean(),
  available_for_walkins: z.boolean(),
  available_days: z.array(z.string()).optional(),
  
  // Add-ons and extras
  allow_addons: z.boolean(),
  addon_ids: z.array(z.string()).optional(),
  
  // Pricing variations
  enable_dynamic_pricing: z.boolean(),
  peak_price_multiplier: z.number().min(1).max(3).optional(),
  off_peak_discount: z.number().min(0).max(50).optional(),
  
  // Requirements
  preparation_time: z.number().min(0).optional(),
  cleanup_time: z.number().min(0).optional(),
  special_equipment: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
})

export type ServiceFormData = z.infer<typeof serviceSchema>

export const weekDays = [
  { value: 'mon', label: 'Monday' },
  { value: 'tue', label: 'Tuesday' },
  { value: 'wed', label: 'Wednesday' },
  { value: 'thu', label: 'Thursday' },
  { value: 'fri', label: 'Friday' },
  { value: 'sat', label: 'Saturday' },
  { value: 'sun', label: 'Sunday' },
]