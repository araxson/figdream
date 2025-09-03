import { Database } from "@/types/database.types"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Card,
  CardContent,
} from "@/components/ui"
import { Mail, Phone } from "lucide-react"
import { format } from "date-fns"
type StaffMember = Database['public']['Tables']['staff_profiles']['Row'] & {
  profiles?: Database['public']['Tables']['profiles']['Row'] | null
}
interface StaffListProps {
  staff: StaffMember[]
  appointmentCounts?: Map<string, number>
}
export function StaffList({ staff, appointmentCounts = new Map() }: StaffListProps) {
  if (staff.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No staff members assigned to this location.</p>
      </div>
    )
  }
  return (
    <div className="space-y-4">
      {staff.map((member) => (
        <Card key={member.id}>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={member.profiles?.avatar_url || undefined} />
                <AvatarFallback>
                  {member.profiles?.full_name?.split(' ').map(n => n[0]).join('') || 'S'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{member.profiles?.full_name || 'Unknown'}</div>
                <div className="text-sm text-muted-foreground">{member.title || 'Staff Member'}</div>
                <div className="flex items-center gap-4 mt-1">
                  {member.profiles?.email && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {member.profiles.email}
                    </div>
                  )}
                  {member.profiles?.phone && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {member.profiles.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium">
                  {appointmentCounts.get(member.id) || 0} appointments today
                </div>
                <div className="text-xs text-muted-foreground">
                  Hired {member.hire_date ? format(new Date(member.hire_date), 'MMM d, yyyy') : 'Unknown'}
                </div>
              </div>
              <div className="flex gap-2">
                {member.is_active ? (
                  <Badge variant="default">Active</Badge>
                ) : (
                  <Badge variant="outline">Inactive</Badge>
                )}
                {member.is_bookable && (
                  <Badge variant="secondary">Bookable</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}