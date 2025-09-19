'use client'

import { Card, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Star } from 'lucide-react'
import type { StaffStepProps } from '../wizard-utils/wizard-types'

export function StaffSelectionStep({ state, staff, onStateChange }: StaffStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Choose Your Professional</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select a staff member or let us assign the best available
        </p>
      </div>

      <RadioGroup
        value={state.selectedStaff || 'any'}
        onValueChange={(value) => onStateChange({
          selectedStaff: value === 'any' ? null : value
        })}
      >
        <Card className="cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="any" id="any-staff" />
              <Label htmlFor="any-staff" className="cursor-pointer flex-1">
                <div>
                  <p className="font-medium">Any Available Professional</p>
                  <p className="text-sm text-muted-foreground">
                    We'll assign the best available staff member
                  </p>
                </div>
              </Label>
            </div>
          </CardContent>
        </Card>

        <ScrollArea className="h-[350px]">
          <div className="space-y-3">
            {staff.map(member => (
              <Card key={member.id} className="cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value={member.id!} id={member.id} />
                    <Avatar>
                      <AvatarImage src={member.avatar_url || undefined} />
                      <AvatarFallback>
                        {member.display_name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Label htmlFor={member.id} className="cursor-pointer flex-1">
                      <div>
                        <p className="font-medium">{member.display_name}</p>
                        <p className="text-sm text-muted-foreground">{member.title}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">4.8 (127 reviews)</span>
                        </div>
                      </div>
                    </Label>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </RadioGroup>
    </div>
  )
}