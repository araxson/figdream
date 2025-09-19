'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Calendar, Users, FileText, Settings, DollarSign } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface QuickActionsProps {
  salonId: string
}

export function QuickActions({ salonId }: QuickActionsProps) {
  const router = useRouter()

  const actions = [
    {
      icon: Calendar,
      label: 'New Appointment',
      description: 'Book a new appointment',
      onClick: () => router.push('/dashboard/appointments/new')
    },
    {
      icon: Users,
      label: 'Add Customer',
      description: 'Register a new customer',
      onClick: () => router.push('/dashboard/customers/new')
    },
    {
      icon: FileText,
      label: 'Generate Report',
      description: 'Create analytics report',
      onClick: () => router.push('/dashboard/reports')
    },
    {
      icon: DollarSign,
      label: 'Process Payment',
      description: 'Handle billing & payments',
      onClick: () => router.push('/dashboard/billing')
    },
    {
      icon: Plus,
      label: 'Add Service',
      description: 'Create new service offering',
      onClick: () => router.push('/dashboard/services/new')
    },
    {
      icon: Settings,
      label: 'Settings',
      description: 'Manage salon settings',
      onClick: () => router.push('/dashboard/settings')
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <Button
                key={index}
                variant="outline"
                className="h-auto flex flex-col items-center justify-center p-4 space-y-2"
                onClick={action.onClick}
              >
                <Icon className="h-5 w-5" />
                <div className="text-center">
                  <p className="text-sm font-medium">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}