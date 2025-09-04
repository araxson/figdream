'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  href?: string
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
  }
  className?: string
  variant?: 'default' | 'gradient'
}

export function StatsCard({
  href,
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  variant = 'default'
}: StatsCardProps) {
  const cardContent = (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-200",
      href && "hover:shadow-lg hover:-translate-y-1 cursor-pointer",
      variant === 'gradient' && "border-muted",
      className
    )}>
      {variant === 'gradient' && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <div className={cn(
            "p-2 rounded-lg transition-colors",
            variant === 'gradient' 
              ? "bg-primary/10 group-hover:bg-primary/20" 
              : "bg-muted"
          )}>
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-2xl font-bold tracking-tight">{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          {trend && (
            <Badge variant="secondary" className="ml-2">
              {trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (href) {
    return (
      <Link href={href} className="block group">
        {cardContent}
      </Link>
    )
  }

  return cardContent
}

interface StatsGridProps {
  children: React.ReactNode
  className?: string
  columns?: 2 | 3 | 4
}

export function StatsGrid({ children, className, columns = 4 }: StatsGridProps) {
  return (
    <div className={cn(
      "grid gap-4",
      {
        'md:grid-cols-2': columns === 2,
        'md:grid-cols-2 lg:grid-cols-3': columns === 3,
        'md:grid-cols-2 lg:grid-cols-4': columns === 4,
      },
      className
    )}>
      {children}
    </div>
  )
}