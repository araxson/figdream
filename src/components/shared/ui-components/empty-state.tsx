'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
  variant?: 'card' | 'inline'
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  variant = 'card'
}: EmptyStateProps) {
  const content = (
    <div className="max-w-sm mx-auto space-y-3 text-center">
      {Icon && (
        <div className="p-3 bg-muted rounded-full w-fit mx-auto">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <h3 className="font-medium">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && (
        <div className="pt-2">
          {action.href ? (
            <Link href={action.href}>
              <Button variant="outline" size="sm">
                {action.label}
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )

  if (variant === 'card') {
    return (
      <Card className={cn("p-8 border-dashed", className)}>
        {content}
      </Card>
    )
  }

  return (
    <div className={cn("py-8", className)}>
      {content}
    </div>
  )
}