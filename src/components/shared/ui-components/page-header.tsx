'use client'

import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  badge?: string
  actions?: ReactNode
  className?: string
  children?: ReactNode
}

export function PageHeader({
  title,
  description,
  badge,
  actions,
  className,
  children
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {badge && (
              <Badge variant="secondary" className="ml-2">
                {badge}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      {children}
      <Separator />
    </div>
  )
}

interface PageSectionProps {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
  children: ReactNode
}

export function PageSection({
  title,
  description,
  actions,
  className,
  children
}: PageSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  )
}