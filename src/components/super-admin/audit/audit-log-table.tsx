'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSeparator } from '@/components/ui/context-menu'
import { format } from 'date-fns'
import { Search, Download, Eye, User, Activity, Shield, FileText, Copy, ExternalLink, LucideIcon } from 'lucide-react'
import { Database } from '@/types/database.types'
import { exportAuditLogs } from '@/lib/data-access/audit-logs'
import { toast } from 'sonner'
import type { VariantProps } from 'class-variance-authority'
import { badgeVariants } from '@/components/ui/badge'

type BadgeVariant = VariantProps<typeof badgeVariants>['variant']

type AuditLog = Database['public']['Tables']['audit_logs']['Row'] & {
  profiles?: {
    id: string
    email: string | null
    full_name: string | null
  } | null
}

interface AuditLogTableProps {
  logs: AuditLog[]
}

export function AuditLogTable({ logs }: AuditLogTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  // Filter logs based on search
  const filteredLogs = logs.filter(log => {
    const search = searchTerm.toLowerCase()
    return (
      log.action.toLowerCase().includes(search) ||
      log.entity_type.toLowerCase().includes(search) ||
      log.entity_id?.toLowerCase().includes(search) ||
      log.profiles?.email?.toLowerCase().includes(search) ||
      log.profiles?.full_name?.toLowerCase().includes(search)
    )
  })

  const handleExport = async () => {
    try {
      const data = await exportAuditLogs()
      
      // Create CSV content
      const csvContent = [
        data.headers.join(','),
        ...data.rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast.success(`Exported ${data.count} audit logs`)
    } catch (error) {
      toast.error('Failed to export audit logs')
      console.error(error)
    }
  }

  const handleCopyLogId = (log: AuditLog) => {
    navigator.clipboard.writeText(log.id)
    toast.success('Log ID copied to clipboard')
  }

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log)
    setShowDetails(true)
  }

  const handleExportSingle = (log: AuditLog) => {
    const csvContent = [
      'ID,Action,Entity Type,Entity ID,User ID,User Email,IP Address,Created At,Metadata',
      `"${log.id}","${log.action}","${log.entity_type}","${log.entity_id || ''}","${log.user_id}","${log.profiles?.email || ''}","${log.ip_address || ''}","${log.created_at}","${log.metadata ? JSON.stringify(log.metadata) : ''}"`
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${log.id.substring(0, 8)}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast.success('Single log exported')
  }

  const getActionBadge = (action: string) => {
    const actionTypes: Record<string, { variant: BadgeVariant; icon: LucideIcon }> = {
      'login': { variant: 'default', icon: User },
      'logout': { variant: 'secondary', icon: User },
      'create': { variant: 'default', icon: FileText },
      'update': { variant: 'secondary', icon: FileText },
      'delete': { variant: 'destructive', icon: FileText },
      'approve': { variant: 'default', icon: Activity },
      'reject': { variant: 'destructive', icon: Activity },
      'permission_change': { variant: 'outline', icon: Shield },
      'role_change': { variant: 'outline', icon: Shield },
      'access_denied': { variant: 'destructive', icon: Shield },
      'suspicious_activity': { variant: 'destructive', icon: Shield },
    }
    
    const config = actionTypes[action] || { variant: 'secondary', icon: Activity }
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {action}
      </Badge>
    )
  }

  const getEntityBadge = (entity: string) => {
    return <Badge variant="outline">{entity}</Badge>
  }

  return (
    <>
      <div className="space-y-4">
        {/* Search and Export */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by action, entity, user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Showing {filteredLogs.length} of {logs.length} events
        </p>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <ContextMenu key={log.id}>
                    <ContextMenuTrigger asChild>
                      <TableRow className="cursor-context-menu">
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {format(new Date(log.created_at), 'MMM d, yyyy')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(log.created_at), 'h:mm:ss a')}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {log.profiles?.full_name || 'Unknown User'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {log.profiles?.email || log.user_id}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{getActionBadge(log.action)}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {getEntityBadge(log.entity_type)}
                            {log.entity_id && (
                              <p className="text-xs text-muted-foreground font-mono">
                                {log.entity_id.substring(0, 8)}...
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">
                            {log.ip_address || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewDetails(log)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem onClick={() => handleViewDetails(log)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => handleCopyLogId(log)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Log ID
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem onClick={() => handleExportSingle(log)}>
                        <Download className="mr-2 h-4 w-4" />
                        Export This Log
                      </ContextMenuItem>
                      {log.entity_id && (
                        <ContextMenuItem onClick={() => handleCopyLogId({ ...log, id: log.entity_id! })}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Copy Entity ID
                        </ContextMenuItem>
                      )}
                    </ContextMenuContent>
                  </ContextMenu>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    {searchTerm ? 'No events found matching your search' : 'No audit logs found'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              Complete information about this event
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <ScrollArea className="max-h-[600px] pr-4">
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Event ID</p>
                    <p className="font-mono text-sm">{selectedLog.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Timestamp</p>
                    <p className="text-sm">
                      {format(new Date(selectedLog.created_at), 'PPpp')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">User</p>
                    <p className="text-sm">
                      {selectedLog.profiles?.full_name || 'Unknown'} ({selectedLog.profiles?.email || selectedLog.user_id})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Action</p>
                    <div className="mt-1">{getActionBadge(selectedLog.action)}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Entity Type</p>
                    <div className="mt-1">{getEntityBadge(selectedLog.entity_type)}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Entity ID</p>
                    <p className="font-mono text-sm">{selectedLog.entity_id || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">IP Address</p>
                    <p className="font-mono text-sm">{selectedLog.ip_address || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">User Agent</p>
                    <p className="text-sm truncate">{selectedLog.user_agent || 'N/A'}</p>
                  </div>
                </div>
                
                {selectedLog.changes && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Changes</p>
                    <pre className="rounded-lg bg-muted p-3 text-xs overflow-x-auto">
                      {JSON.stringify(selectedLog.changes, null, 2)}
                    </pre>
                  </div>
                )}
                
                {selectedLog.metadata && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Metadata</p>
                    <pre className="rounded-lg bg-muted p-3 text-xs overflow-x-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}