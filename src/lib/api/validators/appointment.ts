import * as z from 'zod'

export const appointmentSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  salonId: z.string().uuid('Invalid salon ID'),
  serviceId: z.string().uuid('Invalid service ID'),
  staffId: z.string().uuid('Invalid staff ID'),
  date: z.date({
    message: 'Please select a date',
  }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
})

export const rescheduleAppointmentSchema = z.object({
  appointmentId: z.string().uuid('Invalid appointment ID'),
  date: z.date({
    message: 'Please select a new date',
  }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  reason: z.string().max(200, 'Reason must be less than 200 characters').optional(),
})

export const cancelAppointmentSchema = z.object({
  appointmentId: z.string().uuid('Invalid appointment ID'),
  reason: z.string().min(5, 'Please provide a reason').max(200, 'Reason must be less than 200 characters'),
})

export const appointmentStatusSchema = z.enum([
  'pending',
  'confirmed',
  'cancelled',
  'completed',
  'no_show'
])

export type AppointmentInput = z.infer<typeof appointmentSchema>
export type RescheduleAppointmentInput = z.infer<typeof rescheduleAppointmentSchema>
export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>
export type AppointmentStatus = z.infer<typeof appointmentStatusSchema>