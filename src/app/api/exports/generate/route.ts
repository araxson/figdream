import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// type ExportConfiguration = Database['public']['Tables']['export_configurations']['Row']

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { configurationId } = await request.json()

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get configuration
    const { data: config, error: configError } = await supabase
      .from('export_configurations')
      .select('*')
      .eq('id', configurationId)
      .single()

    if (configError || !config) {
      return NextResponse.json({ error: 'Configuration not found' }, { status: 404 })
    }

    // Create export history entry
    const { data: exportEntry, error: historyError } = await supabase
      .from('export_history')
      .insert({
        salon_id: config.salon_id,
        configuration_id: config.id,
        export_type: config.export_type,
        export_format: config.export_format || 'csv',
        status: 'processing',
        exported_by: user.id,
        file_size_bytes: 0,
        row_count: 0
      })
      .select()
      .single()

    if (historyError) {
      return NextResponse.json({ error: 'Failed to create export' }, { status: 500 })
    }

    // Generate export data based on type
    let exportData: unknown[] = []
    
    switch (config.export_type) {
      case 'customers':
        const { data: customers } = await supabase
          .from('customers')
          .select('*')
          .eq('salon_id', config.salon_id)
        exportData = customers || []
        break
        
      case 'appointments':
        const { data: appointments } = await supabase
          .from('appointments')
          .select(`
            *,
            customer:customers(*),
            service:services(*),
            staff:staff_profiles(*)
          `)
          .eq('salon_id', config.salon_id)
        exportData = appointments || []
        break
        
      case 'revenue':
        const { data: payments } = await supabase
          .from('appointments')
          .select('*')
          .eq('salon_id', config.salon_id)
          .eq('status', 'completed')
          .not('computed_total_price', 'is', null)
        exportData = payments || []
        break
        
      case 'services':
        const { data: services } = await supabase
          .from('services')
          .select('*')
          .eq('salon_id', config.salon_id)
        exportData = services || []
        break
        
      case 'staff':
        const { data: staff } = await supabase
          .from('staff_profiles')
          .select('*')
          .eq('salon_id', config.salon_id)
        exportData = staff || []
        break
    }

    // Format data based on format type
    let fileContent: string
    let mimeType: string
    
    switch (config.export_format) {
      case 'json':
        fileContent = JSON.stringify(exportData, null, 2)
        mimeType = 'application/json'
        break
        
      case 'csv':
        // Convert to CSV
        if (exportData.length > 0) {
          const firstRow = exportData[0] as Record<string, unknown>
          const headers = Object.keys(firstRow).join(',')
          const rows = exportData.map(row => {
            const record = row as Record<string, unknown>
            return Object.values(record).map(v => 
              typeof v === 'string' ? `"${v}"` : v
            ).join(',')
          })
          fileContent = [headers, ...rows].join('\n')
        } else {
          fileContent = ''
        }
        mimeType = 'text/csv'
        break
        
      default: // excel
        // For Excel, we'd need a library like xlsx
        // For now, fallback to CSV
        if (exportData.length > 0) {
          const headers = Object.keys(exportData[0] as Record<string, unknown>).join(',')
          const rows = exportData.map(row => 
            Object.values(row as Record<string, unknown>).map(v => 
              typeof v === 'string' ? `"${v}"` : v
            ).join(',')
          )
          fileContent = [headers, ...rows].join('\n')
        } else {
          fileContent = ''
        }
        mimeType = 'text/csv'
    }

    // Update export history with success
    await supabase
      .from('export_history')
      .update({
        status: 'completed',
        file_size: new Blob([fileContent]).size,
        record_count: exportData.length,
        completed_at: new Date().toISOString()
      })
      .eq('id', exportEntry.id)

    // Update configuration last run
    await supabase
      .from('export_configurations')
      .update({ last_run_at: new Date().toISOString() })
      .eq('id', configurationId)

    // Return the file content
    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${config.export_name}_${new Date().toISOString()}.${config.export_format}"`
      }
    })

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Export generation error:', error)
    }
    return NextResponse.json(
      { error: 'Failed to generate export' },
      { status: 500 }
    )
  }
}