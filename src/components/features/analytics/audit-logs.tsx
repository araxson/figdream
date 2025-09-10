'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { AuditLogFilters } from '@/components/features/platform/audit-log-filters'
import { AuditLogTable } from '@/components/features/platform/audit-log-table'
import { Skeleton } from '@/components/ui/skeleton'

type AuditLog = Database['public']['Tables']['audit_logs']['Row'] & {
  profiles?: {
    full_name: string
    email: string
  }
}

export function AuditLogsViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [resourceFilter, setResourceFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('today')
  const supabase = createClient()

  const fetchAuditLogs = useCallback(async () => {
    try {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          profiles!user_id(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      // Apply date filter
      const now = new Date()
      switch (dateFilter) {
        case 'today':
          const todayStart = new Date(now.setHours(0, 0, 0, 0))
          query = query.gte('created_at', todayStart.toISOString())
          break
        case 'week':
          const weekAgo = new Date(now.setDate(now.getDate() - 7))
          query = query.gte('created_at', weekAgo.toISOString())
          break
        case 'month':
          const monthAgo = new Date(now.setMonth(now.getMonth() - 1))
          query = query.gte('created_at', monthAgo.toISOString())
          break
      }

      // Apply action filter
      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter)
      }

      // Apply resource filter
      if (resourceFilter !== 'all') {
        query = query.eq('resource_type', resourceFilter)
      }

      const { data } = await query

      if (data) {
        setLogs(data as AuditLog[])
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching audit logs:', error)
      }
    } finally {
      setLoading(false)
    }
  }, [actionFilter, resourceFilter, dateFilter, supabase])
  
  useEffect(() => {
    fetchAuditLogs()
  }, [fetchAuditLogs])

  async function exportLogs() {
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Entity', 'Resource', 'IP Address', 'User Agent'],
      ...logs.map(log => [
        log.created_at,
        log.profiles?.email || 'System',
        log.action,
        `${log.entity_type}:${log.entity_id}`,
        log.resource_type || 'N/A',
        String(log.ip_address || 'N/A'),
        log.user_agent || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-96" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Audit Logs</CardTitle>
            <CardDescription>
              Track all system activities and user actions
            </CardDescription>
          </div>
          <Button onClick={exportLogs} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <AuditLogFilters
          searchTerm={searchTerm}
          actionFilter={actionFilter}
          resourceFilter={resourceFilter}
          dateFilter={dateFilter}
          onSearchChange={setSearchTerm}
          onActionFilterChange={setActionFilter}
          onResourceFilterChange={setResourceFilter}
          onDateFilterChange={setDateFilter}
        />
        <AuditLogTable logs={logs} searchTerm={searchTerm} />
      </CardContent>
    </Card>
  )
}