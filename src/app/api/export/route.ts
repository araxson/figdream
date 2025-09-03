import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/database/supabase/server'
import { getUser } from '@/lib/data-access/auth'
import { trackApiRequest } from '@/lib/data-access/monitoring/api-usage'
import { logError } from '@/lib/data-access/monitoring/error-logs'
import { apiError, checkRateLimit } from '@/app/api/middleware'
import { requireCSRFToken } from '@/lib/data-access/security/csrf'
import type { Database } from '@/types/database.types'
// Supported export formats
type ExportFormat = 'json' | 'csv'
// Export types
type ExportType = 
  | 'appointments'
  | 'customers' 
  | 'staff'
  | 'services'
  | 'reviews'
  | 'analytics'
  | 'locations'
  | 'earnings'
  | 'notifications'
interface ExportRequest {
  type: ExportType
  format: ExportFormat
  filters?: {
    startDate?: string
    endDate?: string
    locationId?: string
    staffId?: string
    customerId?: string
    status?: string
  }
  fields?: string[]
}
// Type-safe export data based on the export type
type ExportData = 
  | Database['public']['Tables']['appointments']['Row'][]
  | Database['public']['Tables']['customers']['Row'][]
  | Database['public']['Tables']['staff_profiles']['Row'][]
  | Database['public']['Tables']['services']['Row'][]
  | Database['public']['Tables']['reviews']['Row'][]
  | Database['public']['Tables']['analytics_patterns']['Row'][]
  | Database['public']['Tables']['salon_locations']['Row'][]
  | Database['public']['Tables']['staff_earnings']['Row'][]
  | Database['public']['Tables']['notifications']['Row'][]
interface _ExportResult {
  success: boolean
  data?: ExportData
  format: ExportFormat
  type: ExportType
  count: number
  error?: string
  downloadUrl?: string
  filename: string
  generatedAt: string
}
// Check user permissions for export type
async function checkExportPermissions(
  userId: string,
  userRole: string,
  exportType: ExportType
): Promise<boolean> {
  // Super admin can export anything
  if (userRole === 'super_admin') return true
  // Define role-based export permissions
  const permissions: Record<string, ExportType[]> = {
    salon_owner: ['appointments', 'customers', 'staff', 'services', 'reviews', 'analytics', 'locations', 'earnings'],
    location_manager: ['appointments', 'customers', 'staff', 'services', 'reviews', 'analytics', 'earnings'],
    staff: ['appointments', 'customers', 'services', 'reviews', 'earnings'],
    customer: ['appointments', 'reviews']
  }
  return permissions[userRole]?.includes(exportType) || false
}
// Convert data to CSV format with proper typing
function convertToCSV(data: Record<string, unknown>[], fields?: string[]): string {
  if (!data || data.length === 0) return ''
  // Get headers from first object or use specified fields
  const headers = fields || Object.keys(data[0])
  const csvHeaders = headers.join(',')
  // Convert each row to CSV
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header]
      if (value === null || value === undefined) return ''
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }).join(',')
  })
  return [csvHeaders, ...csvRows].join('\n')
}
// Export data handler
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  try {
    // Validate CSRF token
    const formData = await request.formData()
    await requireCSRFToken(formData)
    // Get request body
    const body: ExportRequest = JSON.parse(formData.get('data') as string)
    // Get authenticated user
    const user = await getUser()
    if (!user) {
      return apiError('Unauthorized', 401)
    }
    // Check rate limiting
    const { allowed, retryAfter } = await checkRateLimit(
      user.id,
      request.headers.get('x-forwarded-for')?.split(',')[0],
      '/api/export'
    )
    if (!allowed) {
      return apiError('Rate limit exceeded', 429, 'RATE_LIMIT', { retryAfter })
    }
    // Check permissions
    const hasPermission = await checkExportPermissions(
      user.id,
      user.role,
      body.type
    )
    if (!hasPermission) {
      return apiError('Insufficient permissions for this export type', 403)
    }
    // Track API request
    await trackApiRequest(
      '/api/export',
      'POST',
      user.id,
      Date.now() - startTime,
      200,
      request.headers.get('user-agent') || undefined,
      request.headers.get('x-forwarded-for')?.split(',')[0]
    )
    // Initialize Supabase client
    const supabase = await createClient()
    // Build query based on export type
    let query
    let data: Record<string, unknown>[] = []
    switch (body.type) {
      case 'appointments':
        query = supabase
          .from('appointments')
          .select(`
            *,
            services (name, price, duration),
            profiles!appointments_customer_id_fkey (first_name, last_name, email),
            staff_profiles (
              profiles (first_name, last_name)
            )
          `)
        // Apply filters
        if (body.filters?.startDate) {
          query = query.gte('start_time', body.filters.startDate)
        }
        if (body.filters?.endDate) {
          query = query.lte('start_time', body.filters.endDate)
        }
        if (body.filters?.locationId) {
          query = query.eq('location_id', body.filters.locationId)
        }
        if (body.filters?.staffId) {
          query = query.eq('staff_id', body.filters.staffId)
        }
        if (body.filters?.customerId) {
          query = query.eq('customer_id', body.filters.customerId)
        }
        if (body.filters?.status) {
          query = query.eq('status', body.filters.status)
        }
        // Apply role-based filtering
        if (user.role === 'staff') {
          query = query.eq('staff_id', user.id)
        } else if (user.role === 'customer') {
          query = query.eq('customer_id', user.id)
        }
        const appointmentsResult = await query
        data = appointmentsResult.data || []
        break
      case 'customers':
        if (user.role === 'customer') {
          // Customers can only export their own data
          query = supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
        } else {
          // Get customers associated with the user's salon
          query = supabase
            .from('profiles')
            .select(`
              *,
              appointments!appointments_customer_id_fkey (count)
            `)
            .eq('role', 'customer')
          if (body.filters?.startDate || body.filters?.endDate) {
            // Filter by customers with appointments in date range
            const appointmentsQuery = supabase
              .from('appointments')
              .select('customer_id')
            if (body.filters.startDate) {
              appointmentsQuery.gte('start_time', body.filters.startDate)
            }
            if (body.filters.endDate) {
              appointmentsQuery.lte('start_time', body.filters.endDate)
            }
            const { data: appointmentCustomers } = await appointmentsQuery
            const customerIds = [...new Set(appointmentCustomers?.map(a => a.customer_id) || [])]
            query = query.in('id', customerIds)
          }
        }
        const customersResult = await query
        data = customersResult.data || []
        break
      case 'services':
        query = supabase
          .from('services')
          .select(`
            *,
            service_categories (name)
          `)
        if (body.filters?.locationId) {
          query = query.eq('location_id', body.filters.locationId)
        }
        const servicesResult = await query
        data = servicesResult.data || []
        break
      case 'reviews':
        query = supabase
          .from('reviews')
          .select(`
            *,
            profiles!reviews_customer_id_fkey (first_name, last_name),
            appointments (
              services (name),
              staff_profiles (
                profiles (first_name, last_name)
              )
            )
          `)
        if (body.filters?.startDate) {
          query = query.gte('created_at', body.filters.startDate)
        }
        if (body.filters?.endDate) {
          query = query.lte('created_at', body.filters.endDate)
        }
        const reviewsResult = await query
        data = reviewsResult.data || []
        break
      default:
        return apiError(`Export type '${body.type}' not implemented`, 400)
    }
    // Format data based on requested format
    let responseData: string
    let contentType: string
    let filename: string
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    if (body.format === 'csv') {
      responseData = convertToCSV(data, body.fields)
      contentType = 'text/csv'
      filename = `${body.type}-export-${timestamp}.csv`
    } else {
      responseData = JSON.stringify(data, null, 2)
      contentType = 'application/json'
      filename = `${body.type}-export-${timestamp}.json`
    }
    // Create response with appropriate headers
    const response = new NextResponse(responseData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Export-Count': String(data.length),
        'X-Export-Type': body.type,
        'X-Export-Format': body.format,
        'X-Response-Time': `${Date.now() - startTime}ms`
      }
    })
    return response
  } catch (_error) {
    // Log error
    await logError(
      'Export API error',
      'api',
      'high',
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    )
    return apiError(
      'Failed to export data',
      500,
      'EXPORT_ERROR',
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}
// Handle GET requests (for download links)
export async function GET(_request: NextRequest) {
  return apiError('Method not allowed. Use POST to export data.', 405)
}