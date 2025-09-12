'use client'

import { StatsCard } from './stats-card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

export interface StatItem {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

interface StatsGridProps {
  stats: StatItem[]
  columns?: 2 | 3 | 4
  className?: string
}

export function StatsGrid({ stats, columns = 4, className }: StatsGridProps) {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4"
  }

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {stats.map((stat, index) => (
        <StatsCard key={`${stat.title}-${index}`} {...stat} />
      ))}
    </div>
  )
}