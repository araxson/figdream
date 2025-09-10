import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { error: errorMessage, errorInfo, userId } = body

    // Log error to database
    const { error: dbError } = await supabase
      .from('error_logs')
      .insert({
        error_type: 'client_error',
        error_message: errorMessage || 'Unknown error',
        error_stack: JSON.stringify(errorInfo || {}),
        user_id: userId || null,
        endpoint: request.headers.get('referer') || '',
        method: request.method,
        user_agent: request.headers.get('user-agent') || ''
      })

    if (dbError) {
      console.error('Failed to log error to database:', dbError)
    }

    // In production, you might want to send this to a service like Sentry
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Error reported successfully' 
    })
  } catch (error) {
    console.error('Error reporting error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to report error' },
      { status: 500 }
    )
  }
}