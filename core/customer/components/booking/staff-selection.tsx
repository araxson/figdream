'use client'

import { useState } from 'react'
import { Star, Award, Clock, User, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { StaffMember, ServiceSelectionItem } from '../../types'

interface StaffSelectionProps {
  staff: StaffMember[]
  selectedServices: ServiceSelectionItem[]
  selectedStaffId?: string
  onStaffSelect: (staffId: string | undefined) => void
  onContinue: () => void
  allowAnyStaff?: boolean
}

export function StaffSelection({
  staff,
  selectedServices,
  selectedStaffId,
  onStaffSelect,
  onContinue,
  allowAnyStaff = true
}: StaffSelectionProps) {
  const [expandedStaff, setExpandedStaff] = useState<string | null>(null)

  // Filter staff based on service requirements
  const availableStaff = staff.filter(member => {
    if (!member.isAvailable) return false

    // Check if staff can perform all selected services
    return selectedServices.every(service => {
      if (!service.staffRequired || service.staffRequired.length === 0) {
        return true // Service doesn't require specific staff
      }
      return service.staffRequired.includes(member.id)
    })
  })

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

  const StaffCard = ({ member }: { member: StaffMember }) => {
    const isExpanded = expandedStaff === member.id
    const isSelected = selectedStaffId === member.id

    return (
      <Card className={`transition-all ${
        isSelected ? 'ring-2 ring-primary border-primary' : 'hover:shadow-md'
      }`}>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={member.profileImageUrl} alt={member.name} />
              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription>{member.title}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{member.rating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">
                      ({member.reviewCount})
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {member.experienceYears} years exp.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Bio Preview */}
            <p className="text-sm text-muted-foreground line-clamp-2">
              {member.bio}
            </p>

            {/* Specializations */}
            {member.specializations && member.specializations.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {member.specializations.slice(0, 3).map((spec) => (
                  <Badge key={spec} variant="secondary" className="text-xs">
                    {spec}
                  </Badge>
                ))}
                {member.specializations.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{member.specializations.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            {/* Availability Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                {member.isAvailable ? (
                  <span className="text-green-600">Available today</span>
                ) : (
                  <span className="text-orange-600">Limited availability</span>
                )}
                {member.nextAvailableSlot && (
                  <span className="text-muted-foreground">
                    • Next: {member.nextAvailableSlot.toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Expand/Collapse */}
              <Collapsible open={isExpanded} onOpenChange={() =>
                setExpandedStaff(isExpanded ? null : member.id)
              }>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {isExpanded ? (
                      <>
                        Less <ChevronUp className="h-4 w-4 ml-1" />
                      </>
                    ) : (
                      <>
                        More <ChevronDown className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                  <Separator />

                  {/* Full Bio */}
                  <div>
                    <h4 className="font-medium mb-2">About</h4>
                    <p className="text-sm text-muted-foreground">{member.bio}</p>
                  </div>

                  {/* All Specializations */}
                  {member.specializations && member.specializations.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Specializations</h4>
                      <div className="flex flex-wrap gap-1">
                        {member.specializations.map((spec) => (
                          <Badge key={spec} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Portfolio */}
                  {member.portfolioUrls && member.portfolioUrls.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Portfolio</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {member.portfolioUrls.slice(0, 6).map((url, index) => (
                          <div key={index} className="aspect-square rounded-md bg-muted overflow-hidden">
                            <img
                              src={url}
                              alt={`${member.name} portfolio ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience Badge */}
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      {member.experienceYears} Years of Experience
                    </span>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Select Button */}
            <Button
              variant={isSelected ? "default" : "outline"}
              className="w-full"
              onClick={() => onStaffSelect(isSelected ? undefined : member.id)}
            >
              {isSelected ? 'Selected' : 'Select'} {member.name.split(' ')[0]}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Choose Your Stylist</h2>
        <p className="text-muted-foreground">
          Select a staff member for your appointment or let us choose for you
        </p>
      </div>

      {/* Service Requirements Alert */}
      {selectedServices.some(s => s.staffRequired && s.staffRequired.length > 0) && (
        <Alert>
          <User className="h-4 w-4" />
          <AlertDescription>
            Some of your selected services require specific staff members.
            Available options are filtered accordingly.
          </AlertDescription>
        </Alert>
      )}

      {/* Any Staff Option */}
      {allowAnyStaff && (
        <Card className={`cursor-pointer transition-all ${
          !selectedStaffId ? 'ring-2 ring-primary border-primary' : 'hover:shadow-md'
        }`}>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <RadioGroup
                value={selectedStaffId || 'any'}
                onValueChange={(value) => onStaffSelect(value === 'any' ? undefined : value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="any" id="any-staff" />
                  <Label htmlFor="any-staff" className="cursor-pointer">
                    <div>
                      <div className="font-medium">Any Available Staff</div>
                      <div className="text-sm text-muted-foreground">
                        Let us assign the best available stylist for your services
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staff List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Available Staff ({availableStaff.length})
        </h3>

        {availableStaff.length === 0 ? (
          <Card className="p-12 text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No staff available</h3>
            <p className="text-muted-foreground">
              No staff members are currently available for your selected services.
              Please try a different date or modify your service selection.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {availableStaff.map((member) => (
              <StaffCard key={member.id} member={member} />
            ))}
          </div>
        )}
      </div>

      {/* Continue Button */}
      <div className="flex justify-between items-center pt-4">
        <div className="text-sm text-muted-foreground">
          {selectedStaffId ? 'Staff member selected' : 'Any staff member will be assigned'}
        </div>
        <Button
          onClick={onContinue}
          disabled={availableStaff.length === 0}
          className="min-w-32"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}