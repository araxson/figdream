import { getAuditLogs } from '@/lib/api/dal/audit-logs'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all'
    const limit = parseInt(searchParams.get('limit') || '100')
    
    let actionFilter = undefined
    
    // Convert UI filter to action pattern
    if (filter !== 'all') {
      switch (filter) {
        case 'auth':
          actionFilter = 'login'
          break
        case 'data':
          actionFilter = 'create'
          break
        case 'admin':
          actionFilter = 'admin'
          break
      }
    }
    
    const logs = await getAuditLogs({
      action: actionFilter
    })
    
    return NextResponse.json(logs.slice(0, limit))
  } catch (error) {
    console.error('Get platform activity error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch platform activity' },
      { status: 500 }
    )
  }
}