import { getAuditLogs } from '@/lib/api/dal/audit-logs'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || undefined
    const entityType = searchParams.get('entityType') || undefined
    const limit = parseInt(searchParams.get('limit') || '500')
    
    const logs = await getAuditLogs({
      action: action,
      entity_type: entityType
    })
    
    return NextResponse.json(logs.slice(0, limit))
  } catch (error) {
    console.error('Get audit logs error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}