'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Shield, User, Database as DatabaseIcon, AlertTriangle } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'
import { Database } from '@/types/database.types'

type AuditLog = Database['public']['Tables']['audit_logs']['Row'] & {
  profiles?: {
    full_name: string
    email: string
  }
}

interface AuditLogTableProps {
  logs: AuditLog[]
  searchTerm: string
}

export function AuditLogTable({ logs, searchTerm }: AuditLogTableProps) {
  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'create': return 'default'
      case 'update': return 'secondary'
      case 'delete': return 'destructive'
      case 'login': return 'outline'
      default: return 'secondary'
    }
  }

  const getResourceIcon = (resource: string | null) => {
    switch (resource) {
      case 'users': return User
      case 'salons': return DatabaseIcon
      case 'security': return Shield
      default: return AlertTriangle
    }
  }

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      log.action?.toLowerCase().includes(searchLower) ||
      log.entity_type?.toLowerCase().includes(searchLower) ||
      log.resource_type?.toLowerCase().includes(searchLower) ||
      log.profiles?.email?.toLowerCase().includes(searchLower) ||
      log.profiles?.full_name?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <ScrollArea className="h-[600px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Resource</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>IP Address</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredLogs.map((log) => {
            const ResourceIcon = getResourceIcon(log.resource_type)
            return (
              <TableRow key={log.id}>
                <TableCell className="font-mono text-sm">
                  {formatDate(log.created_at)}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{log.profiles?.full_name || 'System'}</p>
                    <p className="text-sm text-muted-foreground">{log.profiles?.email || 'Automated'}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getActionBadgeVariant(log.action || '')}>
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <ResourceIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{log.resource_type || 'N/A'}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {log.entity_type}:{log.entity_id}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {log.ip_address ? String(log.ip_address) : 'N/A'}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </ScrollArea>
  )
}