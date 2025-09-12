'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon | React.ComponentType<{ className?: string }>
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
  iconColor?: string
  unit?: string
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  description,
  trend,
  className,
  iconColor = 'text-muted-foreground',
  unit = ''
}: StatsCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-2")}>
        <CardTitle className={cn("text-sm font-medium")}>{title}</CardTitle>
        <Icon className={cn("h-4 w-4", iconColor)} />
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold")}>
          {typeof value === 'number' ? value.toLocaleString() : value}{unit}
        </div>
        {(description || trend) && (
          <p className={cn("text-xs text-muted-foreground")}>
            {trend && (
              <span className={cn(trend.isPositive ? "text-green-600" : "text-red-600")}>
                {trend.isPositive ? "+" : ""}{trend.value}%{" "}
              </span>
            )}
            {description || (trend ? 'from last period' : '')}
          </p>
        )}
      </CardContent>
    </Card>
  )
}