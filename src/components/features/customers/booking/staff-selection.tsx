'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'
import { useState } from 'react'
import { StaffDTO } from '@/lib/api/dal/staff'

interface StaffSelectionClientProps {
  initialStaff: StaffDTO[]
  onStaffSelect?: (staffId: string) => void
}

export function StaffSelectionClient({ 
  initialStaff,
  onStaffSelect 
}: StaffSelectionClientProps) {
  const [selectedStaff, setSelectedStaff] = useState<string>('any')

  const handleStaffChange = (value: string) => {
    setSelectedStaff(value)
    onStaffSelect?.(value)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Staff Member</CardTitle>
        <CardDescription>Choose your preferred stylist or select any available</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedStaff} onValueChange={handleStaffChange}>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="any" id="any" className="mt-1" />
              <Label htmlFor="any" className="flex-1 cursor-pointer">
                <div className="space-y-1">
                  <span className="font-medium">Any Available Staff</span>
                  <p className="text-sm text-muted-foreground">
                    We&apos;ll match you with the next available professional
                  </p>
                </div>
              </Label>
            </div>
            
            {initialStaff.map((member) => {
              const name = 'Staff Member'
              const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              
              return (
                <div key={member.id} className="flex items-start space-x-3">
                  <RadioGroupItem value={member.id} id={member.id} className="mt-1" />
                  <Label htmlFor={member.id} className="flex-1 cursor-pointer">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage src={''} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{name}</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-current text-yellow-500" />
                            <span className="text-sm">4.9</span>
                          </div>
                        </div>
                        {member.specialties && member.specialties.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {member.specialties.slice(0, 3).map((specialty, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                            {member.specialties.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{member.specialties.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Label>
                </div>
              )
            })}
            
            {initialStaff.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No staff members available at this time
              </p>
            )}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  )
}