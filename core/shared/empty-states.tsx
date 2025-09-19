import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Calendar,
  Users,
  ShoppingBag,
  FileText,
  Search,
  Plus,
  FolderOpen,
  Inbox,
  AlertCircle,
  Database
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  actionLabel,
  onAction,
  className
}: EmptyStateProps) {
  return (
    <Card className={cn('border-dashed', className)}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <Icon className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mb-4 max-w-sm">{description}</p>
        )}
        {actionLabel && onAction && (
          <Button onClick={onAction} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export function NoAppointmentsState({ onCreateNew }: { onCreateNew?: () => void }) {
  return (
    <EmptyState
      icon={Calendar}
      title="No appointments found"
      description="You don't have any appointments scheduled yet. Book your first appointment to get started."
      actionLabel="Book Appointment"
      onAction={onCreateNew}
    />
  )
}

export function NoCustomersState({ onCreateNew }: { onCreateNew?: () => void }) {
  return (
    <EmptyState
      icon={Users}
      title="No customers yet"
      description="Start building your customer base by adding your first customer."
      actionLabel="Add Customer"
      onAction={onCreateNew}
    />
  )
}

export function NoServicesState({ onCreateNew }: { onCreateNew?: () => void }) {
  return (
    <EmptyState
      icon={ShoppingBag}
      title="No services available"
      description="Create your first service to start accepting bookings."
      actionLabel="Add Service"
      onAction={onCreateNew}
    />
  )
}

export function NoResultsState({ query }: { query?: string }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={query ? `No results found for "${query}". Try adjusting your search terms.` : "Try adjusting your filters or search terms."}
    />
  )
}

export function NoDataState() {
  return (
    <EmptyState
      icon={Database}
      title="No data available"
      description="There's no data to display at the moment. Check back later."
    />
  )
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <EmptyState
      icon={AlertCircle}
      title="Something went wrong"
      description={message || "An error occurred while loading the data. Please try again."}
      actionLabel="Retry"
      onAction={onRetry}
    />
  )
}

export function NoNotificationsState() {
  return (
    <EmptyState
      icon={Inbox}
      title="All caught up!"
      description="You don't have any notifications at the moment."
    />
  )
}

export function NoReportsState({ onCreateNew }: { onCreateNew?: () => void }) {
  return (
    <EmptyState
      icon={FileText}
      title="No reports generated"
      description="Generate your first report to analyze your business performance."
      actionLabel="Generate Report"
      onAction={onCreateNew}
    />
  )
}