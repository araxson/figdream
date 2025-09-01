import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/database/supabase/server'
import { getUser } from '@/lib/data-access/auth'
import { logError, logCriticalError, logApiError } from '@/src/lib/errors/logger'
import type { Database } from '@/src/types/database.types'

// Supported export formats
type ExportFormat = 'json' | 'csv'

// Export types
type ExportType = 
  | 'bookings'
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

interface ExportResult {
  success: boolean
  data?: any[]
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
  userRole: string | null,
  exportType: ExportType,
  filters?: ExportRequest['filters']
): Promise<{ allowed: boolean; reason?: string; additionalFilters?: Record<string, any> }> {
  
  const additionalFilters: Record<string, any> = {}
  
  switch (userRole) {
    case 'super_admin':
      // Super admin can export everything
      return { allowed: true }
      
    case 'salon_owner':
      // Salon admin can export data for their salons
      switch (exportType) {
        case 'bookings':
        case 'customers':
        case 'staff':
        case 'reviews':
        case 'analytics':
        case 'locations':
        case 'services':
          // TODO: Add salon ownership check
          return { allowed: true }
        case 'earnings':
        case 'notifications':
          return { allowed: true }
        default:
          return { allowed: false, reason: 'Export type not allowed' }
      }
      
    case 'location_manager':
      // Location admin can export data for their location
      switch (exportType) {
        case 'bookings':
        case 'customers':
        case 'staff':
        case 'reviews':
        case 'analytics':
          // TODO: Add location ownership check
          return { allowed: true }
        case 'notifications':
          additionalFilters.user_id = userId
          return { allowed: true, additionalFilters }
        default:
          return { allowed: false, reason: 'Export type not allowed' }
      }
      
    case 'staff':
      // Staff can only export their own data
      switch (exportType) {
        case 'bookings':
          additionalFilters.staff_id = userId
          return { allowed: true, additionalFilters }
        case 'earnings':
          additionalFilters.staff_id = userId
          return { allowed: true, additionalFilters }
        case 'notifications':
          additionalFilters.user_id = userId
          return { allowed: true, additionalFilters }
        default:
          return { allowed: false, reason: 'Export type not allowed' }
      }
      
    case 'customer':
      // Customers can only export their own data
      switch (exportType) {
        case 'bookings':
          additionalFilters.customer_id = userId
          return { allowed: true, additionalFilters }
        case 'notifications':
          additionalFilters.user_id = userId
          return { allowed: true, additionalFilters }
        default:
          return { allowed: false, reason: 'Export type not allowed' }
      }
      
    default:
      return { allowed: false, reason: 'Invalid user role' }
  }
}

// Build SQL query based on export type and filters
function buildExportQuery(
  exportType: ExportType,
  filters?: ExportRequest['filters'],
  additionalFilters?: Record<string, any>,
  fields?: string[]
): { table: string; select: string; filterQuery: any } {
  
  const combinedFilters = { ...filters, ...additionalFilters }
  
  switch (exportType) {
    case 'bookings':
      return {
        table: 'bookings',
        select: fields?.join(', ') || `
          id,
          customer_id,
          location_id,
          staff_id,
          status,
          scheduled_at,
          total_price,
          notes,
          created_at,
          updated_at,
          profiles!customer_id (full_name, email, phone),
          locations (name, address),
          staff (display_name)
        `,
        filterQuery: combinedFilters
      }
      
    case 'customers':
      return {
        table: 'profiles',
        select: fields?.join(', ') || `
          id,
          email,
          full_name,
          phone,
          created_at,
          updated_at
        `,
        filterQuery: { ...combinedFilters, role: 'customer' }
      }
      
    case 'staff':
      return {
        table: 'staff',
        select: fields?.join(', ') || `
          id,
          user_id,
          location_id,
          display_name,
          bio,
          commission_rate,
          is_active,
          created_at,
          updated_at,
          profiles!user_id (full_name, email, phone),
          locations (name)
        `,
        filterQuery: combinedFilters
      }
      
    case 'services':
      return {
        table: 'services',
        select: fields?.join(', ') || `
          id,
          name,
          description,
          duration_minutes,
          buffer_minutes,
          price,
          created_at,
          updated_at
        `,
        filterQuery: combinedFilters
      }
      
    case 'reviews':
      return {
        table: 'reviews',
        select: fields?.join(', ') || `
          id,
          booking_id,
          customer_id,
          staff_id,
          location_id,
          rating,
          comment,
          is_published,
          created_at,
          profiles!customer_id (full_name),
          staff (display_name),
          locations (name)
        `,
        filterQuery: combinedFilters
      }
      
    case 'analytics':
      return {
        table: 'analytics_daily',
        select: fields?.join(', ') || `
          id,
          location_id,
          date,
          total_bookings,
          total_revenue,
          new_customers,
          returning_customers,
          average_booking_value,
          no_show_count,
          cancellation_count,
          created_at,
          locations (name)
        `,
        filterQuery: combinedFilters
      }
      
    case 'locations':
      return {
        table: 'locations',
        select: fields?.join(', ') || `
          id,
          salon_id,
          name,
          address,
          city,
          state,
          zip_code,
          country,
          phone,
          email,
          is_active,
          created_at,
          updated_at,
          salons (name)
        `,
        filterQuery: combinedFilters
      }
      
    case 'earnings':
      return {
        table: 'earnings',
        select: fields?.join(', ') || `
          id,
          staff_id,
          booking_id,
          amount,
          commission_amount,
          tip_amount,
          status,
          paid_at,
          created_at,
          staff (display_name),
          bookings (scheduled_at)
        `,
        filterQuery: combinedFilters
      }
      
    case 'notifications':
      return {
        table: 'notifications',
        select: fields?.join(', ') || `
          id,
          user_id,
          type,
          title,
          message,
          data,
          is_read,
          created_at
        `,
        filterQuery: combinedFilters
      }
      
    default:
      throw new Error(`Unsupported export type: ${exportType}`)
  }
}

// Apply filters to Supabase query
function applyFilters(query: any, filters: Record<string, any>): any {
  let filteredQuery = query
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      switch (key) {
        case 'startDate':
          filteredQuery = filteredQuery.gte('created_at', value)
          break
        case 'endDate':
          filteredQuery = filteredQuery.lte('created_at', value)
          break
        case 'locationId':
          filteredQuery = filteredQuery.eq('location_id', value)
          break
        case 'staffId':
          filteredQuery = filteredQuery.eq('staff_id', value)
          break
        case 'customerId':
          filteredQuery = filteredQuery.eq('customer_id', value)
          break
        case 'status':
          filteredQuery = filteredQuery.eq('status', value)
          break
        case 'user_id':
          filteredQuery = filteredQuery.eq('user_id', value)
          break
        default:
          filteredQuery = filteredQuery.eq(key, value)
          break
      }
    }
  })
  
  return filteredQuery
}

// Convert data to CSV format
function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) {
    return ''
  }
  
  // Get all unique keys from all objects (in case objects have different properties)
  const allKeys = new Set<string>()
  data.forEach(item => {
    Object.keys(flattenObject(item)).forEach(key => allKeys.add(key))
  })
  
  const headers = Array.from(allKeys)
  const csvRows: string[] = []
  
  // Add header row
  csvRows.push(headers.map(header => `"${header}"`).join(','))
  
  // Add data rows
  data.forEach(item => {
    const flatItem = flattenObject(item)
    const row = headers.map(header => {
      const value = flatItem[header]
      if (value === null || value === undefined) {
        return '""'
      }
      // Escape quotes and wrap in quotes
      return `"${String(value).replace(/"/g, '""')}"`
    })
    csvRows.push(row.join(','))
  })
  
  return csvRows.join('\n')
}

// Flatten nested objects for CSV export
function flattenObject(obj: any, prefix = ''): Record<string, any> {
  const flattened: Record<string, any> = {}
  
  Object.keys(obj).forEach(key => {
    const value = obj[key]
    const newKey = prefix ? `${prefix}.${key}` : key
    
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively flatten nested objects
      Object.assign(flattened, flattenObject(value, newKey))
    } else if (Array.isArray(value)) {
      // Convert arrays to comma-separated strings
      flattened[newKey] = value.join(', ')
    } else {
      flattened[newKey] = value
    }
  })
  
  return flattened
}

// Generate filename for export
function generateFilename(type: ExportType, format: ExportFormat, timestamp: Date): string {
  const dateStr = timestamp.toISOString().split('T')[0]
  const timeStr = timestamp.toTimeString().split(' ')[0].replace(/:/g, '-')
  return `figdream_${type}_${dateStr}_${timeStr}.${format}`
}

// Main export function
async function exportData(
  exportType: ExportType,
  format: ExportFormat,
  filters?: ExportRequest['filters'],
  additionalFilters?: Record<string, any>,
  fields?: string[]
): Promise<ExportResult> {
  const timestamp = new Date()
  const filename = generateFilename(exportType, format, timestamp)
  
  try {
    const supabase = await createClient()
    
    // Build query
    const { table, select, filterQuery } = buildExportQuery(
      exportType, 
      filters, 
      additionalFilters, 
      fields
    )
    
    // Execute query
    let query = supabase
      .from(table)
      .select(select)
    
    // Apply filters
    query = applyFilters(query, filterQuery)
    
    // Add ordering
    query = query.order('created_at', { ascending: false })
    
    // Execute query
    const { data, error } = await query
    
    if (error) {
      throw new Error(`Database query failed: ${error.message}`)
    }
    
    if (!data) {
      return {
        success: false,
        format,
        type: exportType,
        count: 0,
        filename,
        generatedAt: timestamp.toISOString(),
        error: 'No data found'
      }
    }
    
    console.log(`Exporting ${data.length} ${exportType} records in ${format} format`)
    
    return {
      success: true,
      data,
      format,
      type: exportType,
      count: data.length,
      filename,
      generatedAt: timestamp.toISOString()
    }
    
  } catch (error) {
    logError(
      error as Error,
      'medium',
      'api',
      { context: 'data_export', exportType, format }
    )
    
    return {
      success: false,
      format,
      type: exportType,
      count: 0,
      filename,
      generatedAt: timestamp.toISOString(),
      error: (error as Error).message
    }
  }
}

// GET handler for data export
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Check authentication
    const { user, error: authError } = await getUser()
    
    if (authError || !user) {
      logApiError(
        'Unauthorized export attempt',
        '/api/export',
        401
      )
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const userRole = user.raw_app_meta_data?.role || user.app_metadata?.role || null
    const { searchParams } = new URL(request.url)
    
    // Parse request parameters
    const exportType = searchParams.get('type') as ExportType
    const format = (searchParams.get('format') || 'json') as ExportFormat
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined
    const locationId = searchParams.get('locationId') || undefined
    const staffId = searchParams.get('staffId') || undefined
    const customerId = searchParams.get('customerId') || undefined
    const status = searchParams.get('status') || undefined
    const fieldsParam = searchParams.get('fields')
    const fields = fieldsParam ? fieldsParam.split(',') : undefined
    
    // Validate required parameters
    if (!exportType) {
      return NextResponse.json(
        { 
          error: 'Export type is required',
          supportedTypes: ['bookings', 'customers', 'staff', 'services', 'reviews', 'analytics', 'locations', 'earnings', 'notifications']
        },
        { status: 400 }
      )
    }
    
    if (!['json', 'csv'].includes(format)) {
      return NextResponse.json(
        { 
          error: 'Invalid format',
          supportedFormats: ['json', 'csv']
        },
        { status: 400 }
      )
    }
    
    // Check permissions
    const filters = { startDate, endDate, locationId, staffId, customerId, status }
    const permissionCheck = await checkExportPermissions(user.id, userRole, exportType, filters)
    
    if (!permissionCheck.allowed) {
      return NextResponse.json(
        { error: permissionCheck.reason },
        { status: 403 }
      )
    }
    
    console.log(`Exporting ${exportType} data for user ${user.id} in ${format} format`)
    
    // Export data
    const result = await exportData(
      exportType, 
      format, 
      filters, 
      permissionCheck.additionalFilters,
      fields
    )
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Export failed' },
        { status: 500 }
      )
    }
    
    // Format response based on requested format
    if (format === 'csv') {
      const csvData = convertToCSV(result.data || [])
      
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${result.filename}"`,
          'X-Export-Count': result.count.toString(),
          'X-Export-Type': exportType,
          'X-Generated-At': result.generatedAt
        }
      })
    } else {
      // JSON format
      return NextResponse.json({
        success: true,
        message: 'Data exported successfully',
        type: exportType,
        format,
        count: result.count,
        filename: result.filename,
        generatedAt: result.generatedAt,
        data: result.data
      })
    }
    
  } catch (error) {
    logCriticalError(
      error as Error,
      'api',
      { context: 'export_handler', endpoint: '/api/export' }
    )
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to export data'
      },
      { status: 500 }
    )
  }
}

// POST handler for advanced export requests
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Check authentication
    const { user, error: authError } = await getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const userRole = user.raw_app_meta_data?.role || user.app_metadata?.role || null
    
    // Parse request body
    const body: ExportRequest = await request.json()
    const { type: exportType, format, filters, fields } = body
    
    // Validate required fields
    if (!exportType || !format) {
      return NextResponse.json(
        { error: 'Export type and format are required' },
        { status: 400 }
      )
    }
    
    // Check permissions
    const permissionCheck = await checkExportPermissions(user.id, userRole, exportType, filters)
    
    if (!permissionCheck.allowed) {
      return NextResponse.json(
        { error: permissionCheck.reason },
        { status: 403 }
      )
    }
    
    console.log(`Advanced export: ${exportType} data for user ${user.id} in ${format} format`)
    
    // Export data
    const result = await exportData(
      exportType, 
      format, 
      filters, 
      permissionCheck.additionalFilters,
      fields
    )
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Export failed' },
        { status: 500 }
      )
    }
    
    // Always return JSON for POST requests (for AJAX handling)
    return NextResponse.json({
      success: true,
      message: 'Data exported successfully',
      type: exportType,
      format,
      count: result.count,
      filename: result.filename,
      generatedAt: result.generatedAt,
      data: result.data,
      csvData: format === 'csv' ? convertToCSV(result.data || []) : undefined
    })
    
  } catch (error) {
    logCriticalError(
      error as Error,
      'api',
      { context: 'export_post_handler', endpoint: '/api/export' }
    )
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to export data'
      },
      { status: 500 }
    )
  }
}