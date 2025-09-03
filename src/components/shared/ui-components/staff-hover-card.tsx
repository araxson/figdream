"use client"
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Separator
} from "@/components/ui"

import { Star, DollarSign, Calendar, User } from "lucide-react"
import type { Database } from "@/types/database.types"
type StaffProfile = Database['public']['Tables']['staff_profiles']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type Service = Database['public']['Tables']['services']['Row']
type StaffService = Database['public']['Tables']['staff_services']['Row']
type StaffMember = StaffProfile & {
  profiles?: Profile | null
  staff_services?: (StaffService & {
    services?: Service | null
  })[] | null
  appointments_count?: number
  revenue_generated?: number
  average_rating?: number
}
interface StaffHoverCardProps {
  staff: StaffMember
  children: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
}
export function StaffHoverCard({ staff, children, side = "right" }: StaffHoverCardProps) {
  const displayName = staff.profiles?.full_name || staff.display_name || 'Unknown Staff'
  const initials = displayName.split(' ').map(name => name[0]).join('').toUpperCase()
  // Get specialties/services
  const specialties = staff.staff_services
    ?.map(ss => ss.services?.name)
    .filter(Boolean) || []
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent side={side} className="w-80">
        <div className="flex gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={staff.avatar_url || undefined} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div>
              <h4 className="text-sm font-semibold">{displayName}</h4>
              {staff.title && (
                <p className="text-xs text-muted-foreground">{staff.title}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={staff.is_active ? "default" : "secondary"}>
                {staff.is_active ? "Active" : "Inactive"}
              </Badge>
              {staff.can_book_online && (
                <Badge variant="outline">
                  Online Booking
                </Badge>
              )}
            </div>
            {specialties.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-1">Specialties:</p>
                <div className="flex flex-wrap gap-1">
                  {specialties.slice(0, 3).map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                  {specialties.length > 3 && (
                    <Badge variant="secondary">
                      +{specialties.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
            <Separator />
            <div className="grid grid-cols-2 gap-2 text-xs">
              {staff.average_rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span>{staff.average_rating.toFixed(1)}</span>
                </div>
              )}
              {staff.appointments_count && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-blue-500" />
                  <span>{staff.appointments_count} bookings</span>
                </div>
              )}
              {staff.commission_rate && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-green-500" />
                  <span>{staff.commission_rate}% commission</span>
                </div>
              )}
              {staff.hire_date && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 text-gray-500" />
                  <span>Since {new Date(staff.hire_date).getFullYear()}</span>
                </div>
              )}
            </div>
            {staff.bio && (
              <>
                <Separator />
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {staff.bio}
                </p>
              </>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
