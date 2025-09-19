import * as z from 'zod'

/**
 * Product form validation schema
 */
export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional().nullable(),
  category_id: z.string().optional().nullable(),
  supplier_id: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  unit_of_measure: z.string().min(1, 'Unit of measure is required'),
  cost_price: z.coerce.number().min(0, 'Cost price must be positive').optional().nullable(),
  retail_price: z.coerce.number().min(0, 'Retail price must be positive').optional().nullable(),
  min_stock_level: z.coerce.number().min(0, 'Minimum stock must be non-negative'),
  max_stock_level: z.coerce.number().min(0, 'Maximum stock must be non-negative').optional().nullable(),
  reorder_point: z.coerce.number().min(0, 'Reorder point must be non-negative'),
  reorder_quantity: z.coerce.number().min(1, 'Reorder quantity must be at least 1'),
  image_url: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
  is_active: z.boolean(),
  is_trackable: z.boolean(),
  is_for_sale: z.boolean(),
  tax_rate: z.coerce.number().min(0, 'Tax rate must be non-negative').max(100, 'Tax rate cannot exceed 100%').optional().nullable(),
  expiry_warning_days: z.coerce.number().min(0, 'Warning days must be non-negative').optional().nullable(),
  notes: z.string().optional().nullable()
})

export type ProductFormValues = z.infer<typeof productSchema>