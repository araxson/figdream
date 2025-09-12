'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface SectionHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export function SectionHeader({
  title,
  description,
  actions,
  className
}: SectionHeaderProps) {
  return (
    <div className={cn(
      'flex flex-col gap-2 md:flex-row md:items-center md:justify-between',
      className
    )}>
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
  )
}