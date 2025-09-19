"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { StaffProfile } from "../../dal/staff-types"

interface ProfileServicesSectionProps {
  staff: StaffProfile
}

export function ProfileServicesSection({ staff }: ProfileServicesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assigned Services</CardTitle>
        <CardDescription>Services this staff member can perform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {staff.services?.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div>
                <p className="font-medium">{service.name}</p>
                <p className="text-sm text-muted-foreground">
                  {service.duration} min • ${service.price}
                </p>
              </div>
              <Badge>{service.category}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}