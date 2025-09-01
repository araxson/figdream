'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { 
  Search, 
  Star, 
  Clock, 
  Calendar,
  AlertCircle,
  CheckCircle,
  User,
  Users,
  Award,
  Shuffle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, addHours, isToday, isTomorrow } from 'date-fns'
import type { Database } from '@/types/database.types'

// Use proper database types
type StaffProfile = Database['public']['Tables']['staff_profiles']['Row']
type StaffSchedule = Database['public']['Tables']['staff_schedules']['Row']

// Extended type with computed fields and relationships
export type StaffMember = StaffProfile & {
  staff_schedules?: StaffSchedule[]
  rating?: number
  total_reviews?: number
  next_available?: string | null
  is_available_on_date?: boolean
  years_experience?: number
}

export interface StaffSelectorProps {
  locationId: string
  serviceIds?: string[]
  selectedDate?: Date
  selectedTime?: string
  className?: string
  onStaffSelect?: (staff: StaffMember | null) => void
  selectedStaff?: StaffMember | null
  allowAnyStaff?: boolean
  showAvailability?: boolean
  showRatings?: boolean
  showBios?: boolean
  disabled?: boolean
  filterByService?: boolean
  layout?: 'grid' | 'list'
}

export function StaffSelector({
  locationId,
  serviceIds = [],
  selectedDate,
  selectedTime,
  className,
  onStaffSelect,
  selectedStaff,
  allowAnyStaff = true,
  showAvailability = true,
  showRatings = true,
  showBios = false,
  disabled = false,
  filterByService = true,
  layout = 'grid'
}: StaffSelectorProps) {
  const [staff, setStaff] = React.useState<StaffMember[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [sortBy, setSortBy] = React.useState<'name' | 'rating' | 'availability' | 'experience'>('name')
  const [showOnlyAvailable, setShowOnlyAvailable] = React.useState(false)

  // Load staff for location and services
  const loadStaff = React.useCallback(async () => {
    if (!locationId) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (serviceIds.length > 0 && filterByService) {
        serviceIds.forEach(id => params.append('service_id', id))
      }
      if (selectedDate) {
        params.append('date', format(selectedDate, 'yyyy-MM-dd'))
      }
      if (selectedTime) {
        params.append('time', selectedTime)
      }
      if (showAvailability) {
        params.append('include_availability', 'true')
      }

      const url = `/api/staff/location/${locationId}?${params.toString()}`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Failed to load staff')
      }

      const data = await response.json()
      setStaff(data.staff || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load staff')
    } finally {
      setLoading(false)
    }
  }, [locationId, serviceIds, selectedDate, selectedTime, showAvailability, filterByService])

  // Effect to load staff
  React.useEffect(() => {
    loadStaff()
  }, [loadStaff])

  // Filter and sort staff
  const filteredStaff = React.useMemo(() => {
    let filtered = staff

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(member =>
        `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.specialties?.some(specialty => 
          specialty.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        member.bio?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by availability if date/time selected
    if (showOnlyAvailable && selectedDate && selectedTime) {
      filtered = filtered.filter(member => member.is_available_on_date)
    }

    // Sort staff
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          const ratingA = a.rating || 0
          const ratingB = b.rating || 0
          return ratingB - ratingA // Higher rating first
        case 'availability':
          // Available staff first, then by next available time
          if (a.is_available_on_date && !b.is_available_on_date) return -1
          if (!a.is_available_on_date && b.is_available_on_date) return 1
          if (a.next_available && b.next_available) {
            return new Date(a.next_available).getTime() - new Date(b.next_available).getTime()
          }
          return 0
        case 'experience':
          const expA = a.years_experience || 0
          const expB = b.years_experience || 0
          return expB - expA // More experience first
        case 'name':
        default:
          return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
      }
    })

    return filtered
  }, [staff, searchQuery, sortBy, showOnlyAvailable, selectedDate, selectedTime])

  // Handle staff selection
  const handleStaffSelect = (member: StaffMember | null) => {
    if (disabled) return
    onStaffSelect?.(member)
  }

  // Handle random staff selection
  const handleRandomSelect = () => {
    if (disabled || filteredStaff.length === 0) return
    
    const availableStaff = selectedDate && selectedTime 
      ? filteredStaff.filter(s => s.is_available_on_date)
      : filteredStaff
    
    if (availableStaff.length === 0) return
    
    const randomIndex = Math.floor(Math.random() * availableStaff.length)
    handleStaffSelect(availableStaff[randomIndex])
  }

  // Format next available time
  const formatNextAvailable = (dateTime: string | null | undefined) => {
    if (!dateTime) return null
    
    const date = new Date(dateTime)
    
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`
    } else if (isTomorrow(date)) {
      return `Tomorrow at ${format(date, 'h:mm a')}`
    } else {
      return format(date, 'MMM d, h:mm a')
    }
  }

  // Get initials for avatar fallback
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  // Render staff member card
  const renderStaffCard = (member: StaffMember) => {
    const isSelected = selectedStaff?.id === member.id
    const isAvailable = !selectedDate || !selectedTime || member.is_available_on_date

    return (
      <Card
        key={member.id}
        className={cn(
          "cursor-pointer transition-all hover:shadow-md",
          isSelected && "ring-2 ring-primary border-primary",
          !isAvailable && "opacity-60",
          disabled && "cursor-not-allowed opacity-50"
        )}
        onClick={() => !disabled && handleStaffSelect(member)}
      >
        <CardContent>
          <div className="flex items-start gap-3">
            <HoverCard>
              <HoverCardTrigger asChild>
                <Avatar className="h-12 w-12 cursor-pointer">
                  <AvatarImage src={member.avatar_url || undefined} />
                  <AvatarFallback>
                    {getInitials(member.first_name, member.last_name)}
                  </AvatarFallback>
                </Avatar>
              </HoverCardTrigger>
              <HoverCardContent className="w-80" side="right">
                <div className="flex justify-between space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={member.avatar_url || undefined} />
                    <AvatarFallback className="text-lg">
                      {getInitials(member.first_name, member.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 flex-1">
                    <h4 className="text-sm font-semibold">{member.first_name} {member.last_name}</h4>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                    {member.bio && (
                      <p className="text-sm">{member.bio}</p>
                    )}
                    <div className="flex items-center gap-4 pt-2">
                      {member.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium">{member.rating.toFixed(1)}</span>
                        </div>
                      )}
                      {member.years_experience && (
                        <div className="flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          <span className="text-xs">{member.years_experience}y exp</span>
                        </div>
                      )}
                    </div>
                    {member.specialties && member.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        {member.specialties.map((specialty, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium truncate">
                  {member.first_name} {member.last_name}
                </h4>
                {isSelected && (
                  <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                )}
                {!isAvailable && (
                  <Badge variant="secondary" className="text-xs">
                    Busy
                  </Badge>
                )}
              </div>

              <div className="space-y-1 text-sm text-muted-foreground">
                <div>{member.role}</div>
                
                {showRatings && member.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{member.rating.toFixed(1)}</span>
                    {member.total_reviews && (
                      <span>({member.total_reviews} reviews)</span>
                    )}
                  </div>
                )}

                {member.years_experience && (
                  <div className="flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    <span>{member.years_experience} years experience</span>
                  </div>
                )}

                {member.specialties && member.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {member.specialties.slice(0, 3).map((specialty, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {member.specialties.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{member.specialties.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                {showAvailability && (
                  <div className="mt-2">
                    {isAvailable ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Available
                      </Badge>
                    ) : member.next_available ? (
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="h-3 w-3" />
                        <span>Next: {formatNextAvailable(member.next_available)}</span>
                      </div>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        Unavailable
                      </Badge>
                    )}
                  </div>
                )}

                {showBios && member.bio && (
                  <p className="text-xs mt-2 line-clamp-2">{member.bio}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render staff member list item
  const renderStaffListItem = (member: StaffMember) => {
    const isSelected = selectedStaff?.id === member.id
    const isAvailable = !selectedDate || !selectedTime || member.is_available_on_date

    return (
      <div
        key={member.id}
        className={cn(
          "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent",
          isSelected && "bg-primary/5 border-primary",
          !isAvailable && "opacity-60",
          disabled && "cursor-not-allowed opacity-50"
        )}
        onClick={() => !disabled && handleStaffSelect(member)}
      >
        <RadioGroupItem
          value={member.id}
          id={member.id}
          checked={isSelected}
          className="pointer-events-none"
        />
        
        <Avatar className="h-10 w-10">
          <AvatarImage src={member.avatar_url || undefined} />
          <AvatarFallback>
            {getInitials(member.first_name, member.last_name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <Label 
            htmlFor={member.id} 
            className="font-medium cursor-pointer"
          >
            {member.first_name} {member.last_name}
          </Label>
          
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span>{member.role}</span>
            
            {showRatings && member.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{member.rating.toFixed(1)}</span>
              </div>
            )}

            {showAvailability && (
              <div>
                {isAvailable ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                    Available
                  </Badge>
                ) : (
                  <span className="text-xs">
                    Next: {formatNextAvailable(member.next_available)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Select Staff Member</h3>
        </div>
        
        {allowAnyStaff && filteredStaff.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRandomSelect}
            disabled={disabled}
          >
            <Shuffle className="h-4 w-4 mr-2" />
            Any Available
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search staff by name or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            disabled={disabled}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-auto min-w-32">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="availability">Availability</SelectItem>
              <SelectItem value="experience">Experience</SelectItem>
            </SelectContent>
          </Select>

          {showAvailability && selectedDate && selectedTime && (
            <Button
              variant={showOnlyAvailable ? "default" : "outline"}
              size="sm"
              onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
              disabled={disabled}
            >
              Available Only
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Staff List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="text-center py-8">
          <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h4 className="text-lg font-medium mb-2">No staff found</h4>
          <p className="text-muted-foreground">
            {searchQuery.trim() 
              ? "Try adjusting your search"
              : serviceIds.length > 0 
              ? "No staff available for the selected services"
              : "No staff available at this location"}
          </p>
        </div>
      ) : (
        <ScrollArea className="h-96">
          <div className={cn(
            layout === 'grid' 
              ? "grid gap-3 md:grid-cols-2" 
              : "space-y-2"
          )}>
            {layout === 'grid' 
              ? filteredStaff.map(renderStaffCard)
              : (
                <RadioGroup 
                  value={selectedStaff?.id || ''} 
                  onValueChange={(value) => {
                    const member = filteredStaff.find(s => s.id === value)
                    if (member) handleStaffSelect(member)
                  }}
                  disabled={disabled}
                  className="space-y-2"
                >
                  {filteredStaff.map(renderStaffListItem)}
                </RadioGroup>
              )}
          </div>
        </ScrollArea>
      )}

      {/* Any Staff Option */}
      {allowAnyStaff && (
        <Card 
          className={cn(
            "cursor-pointer border-dashed transition-colors hover:bg-accent",
            selectedStaff === null && "ring-2 ring-primary border-primary",
            disabled && "cursor-not-allowed opacity-50"
          )}
          onClick={() => !disabled && handleStaffSelect(null)}
        >
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full border-2 border-dashed border-muted-foreground flex items-center justify-center">
                <Shuffle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h4 className="font-medium">Any Available Staff</h4>
                <p className="text-sm text-muted-foreground">
                  Let us assign the best available staff member
                </p>
              </div>
              {selectedStaff === null && (
                <CheckCircle className="h-5 w-5 text-primary ml-auto" />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Staff Summary */}
      {selectedStaff && (
        <Card className="border-primary">
          <CardContent>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-primary" />
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedStaff.avatar_url || undefined} />
                <AvatarFallback>
                  {getInitials(selectedStaff.first_name, selectedStaff.last_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {selectedStaff.first_name} {selectedStaff.last_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedStaff.role}
                  {showRatings && selectedStaff.rating && (
                    <span className="ml-2">
                      ⭐ {selectedStaff.rating.toFixed(1)}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      <div className="text-xs text-muted-foreground text-center">
        {allowAnyStaff 
          ? "Select a specific staff member or let us choose the best available option"
          : "Select a staff member for your appointment"
        }
      </div>
    </div>
  )
}