import { Database } from "@/types/database.types"
import { Avatar, AvatarFallback, AvatarImage, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from "@/components/ui"
type StaffMember = Database['public']['Tables']['staff_profiles']['Row'] & {
  profiles?: Database['public']['Tables']['profiles']['Row'] | null
}
interface StaffScheduleViewProps {
  staff: StaffMember[]
  appointmentCounts?: Map<string, number>
}
export function StaffScheduleView({ staff, appointmentCounts = new Map() }: StaffScheduleViewProps) {
  const activeStaff = staff.filter(s => s.is_active)
  if (activeStaff.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No active staff members at this location.</p>
      </div>
    )
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Today&apos;s Appointments</TableHead>
          <TableHead>Commission</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activeStaff.map((member) => (
          <TableRow key={member.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.profiles?.avatar_url || undefined} />
                  <AvatarFallback>
                    {member.profiles?.full_name?.split(' ').map(n => n[0]).join('') || 'S'}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{member.profiles?.full_name || 'Unknown'}</span>
              </div>
            </TableCell>
            <TableCell>{member.title || 'Staff Member'}</TableCell>
            <TableCell>
              <div className="space-y-1">
                {member.profiles?.email && (
                  <div className="text-sm">{member.profiles.email}</div>
                )}
                {member.profiles?.phone && (
                  <div className="text-sm text-muted-foreground">{member.profiles.phone}</div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="font-medium">
                {appointmentCounts.get(member.id) || 0}
              </div>
            </TableCell>
            <TableCell>{member.commission_rate}%</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Badge variant="default">Active</Badge>
                {member.is_bookable && (
                  <Badge variant="secondary">Bookable</Badge>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}