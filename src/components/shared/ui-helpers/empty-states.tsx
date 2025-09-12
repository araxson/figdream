import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: LucideIcon
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ 
  title, 
  description, 
  icon: Icon, 
  action,
  className 
}: EmptyStateProps) {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="flex flex-col items-center justify-center py-12">
        {Icon && (
          <Icon className="h-12 w-12 text-muted-foreground mb-4" />
        )}
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
            {description}
          </p>
        )}
        {action && (
          <Button onClick={action.onClick} variant="outline">
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

interface EmptyListProps {
  message?: string
  className?: string
}

export function EmptyList({ 
  message = "No items found", 
  className 
}: EmptyListProps) {
  return (
    <div className={cn("text-center py-8 text-muted-foreground", className)}>
      {message}
    </div>
  )
}