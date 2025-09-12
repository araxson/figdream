'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Server, Database, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SystemHealthData {
  database: number
  api: number
  storage: number
  uptime: number
}

interface SystemHealthCardProps {
  health: SystemHealthData
}

const healthItems = [
  { key: 'database' as const, label: 'Database', icon: Database },
  { key: 'api' as const, label: 'API', icon: Server },
  { key: 'storage' as const, label: 'Storage', icon: Zap },
]

function getHealthStatus(value: number) {
  if (value >= 95) return { label: 'Healthy', color: 'text-green-600' }
  if (value >= 80) return { label: 'Warning', color: 'text-yellow-600' }
  return { label: 'Critical', color: 'text-red-600' }
}

export function SystemHealthCard({ health }: SystemHealthCardProps) {
  return (
    <Card className={cn("col-span-full")}>
      <CardHeader>
        <CardTitle>System Health</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn("grid gap-6 md:grid-cols-3")}>
          {healthItems.map(({ key, label, icon: Icon }) => {
            const value = health[key]
            const status = getHealthStatus(value)
            
            return (
              <div key={key} className={cn("space-y-2")}>
                <div className={cn("flex items-center justify-between")}>
                  <div className={cn("flex items-center gap-2")}>
                    <Icon className={cn("h-4 w-4 text-muted-foreground")} />
                    <span className={cn("text-sm font-medium")}>{label}</span>
                  </div>
                  <Badge variant="outline" className={cn(status.color)}>
                    {status.label}
                  </Badge>
                </div>
                <Progress value={value} className={cn("h-2")} />
                <p className={cn("text-xs text-muted-foreground")}>{value}% operational</p>
              </div>
            )
          })}
        </div>
        <div className={cn("mt-4 pt-4 border-t")}>
          <div className={cn("flex items-center justify-between")}>
            <span className={cn("text-sm font-medium")}>Overall Uptime</span>
            <span className={cn("text-sm font-bold text-green-600")}>{health.uptime}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}