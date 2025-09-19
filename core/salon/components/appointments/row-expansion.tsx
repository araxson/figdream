'use client'

import { Phone, Mail } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { TableCell, TableRow } from '@/components/ui/table'
import type { AppointmentWithRelations } from '../types'

interface AppointmentRowExpansionProps {
  appointment: AppointmentWithRelations
  colSpan: number
}

export function AppointmentRowExpansion({
  appointment,
  colSpan,
}: AppointmentRowExpansionProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="p-0">
        <div className="p-4 bg-muted/50">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium mb-1">Contact Information</p>
              <div className="space-y-1">
                {appointment.customer?.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-3 w-3" />
                    {appointment.customer.phone}
                  </div>
                )}
                {appointment.customer?.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-3 w-3" />
                    {appointment.customer.email}
                  </div>
                )}
              </div>
            </div>

            {appointment.notes && (
              <div>
                <p className="text-sm font-medium mb-1">Notes</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.notes}
                </p>
              </div>
            )}

            {appointment.confirmation_code && (
              <div>
                <p className="text-sm font-medium mb-1">Confirmation Code</p>
                <Badge variant="secondary">
                  #{appointment.confirmation_code}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </TableCell>
    </TableRow>
  )
}