'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Clock } from 'lucide-react'
import type { BookingWizardState } from '../types'
import { formatPrice, formatDuration } from './wizard-utils/wizard-helpers'

interface BookingSummaryProps {
  state: BookingWizardState
  total: number
  totalDuration: number
}

export function BookingSummary({ state, total, totalDuration }: BookingSummaryProps) {
  return (
    <Card className="hidden lg:block fixed right-4 top-24 w-80">
      <CardHeader>
        <CardTitle className="text-sm">Booking Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm space-y-1">
          {state.selectedServices.map(service => (
            <div key={service.serviceId} className="flex justify-between">
              <span className="text-muted-foreground">{service.serviceName}</span>
              <span>{formatPrice(service.price * service.quantity)}</span>
            </div>
          ))}
          {state.selectedAddons.map(addon => (
            <div key={addon.serviceId} className="flex justify-between">
              <span className="text-muted-foreground">{addon.serviceName}</span>
              <span>{formatPrice(addon.price * addon.quantity)}</span>
            </div>
          ))}
        </div>
        <Separator />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formatDuration(totalDuration)}</span>
        </div>
      </CardContent>
    </Card>
  )
}