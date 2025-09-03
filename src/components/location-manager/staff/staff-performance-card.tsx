import { Database } from "@/types/database.types"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui"
import { Award } from "lucide-react"
type StaffMember = Database['public']['Tables']['staff_profiles']['Row'] & {
  profiles?: Database['public']['Tables']['profiles']['Row'] | null
}
interface StaffPerformanceCardProps {
  staff: StaffMember[]
  appointmentCounts?: Map<string, number>
}
export function StaffPerformanceCard({ staff, appointmentCounts = new Map() }: StaffPerformanceCardProps) {
  if (staff.length === 0) {
    return (
      <div className="text-center py-12">
        <Award className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No performance data</h3>
        <p className="text-muted-foreground">
          No staff members to show performance for.
        </p>
      </div>
    )
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Staff Member</TableHead>
          <TableHead className="text-center">Appointments</TableHead>
          <TableHead className="text-center">Utilization</TableHead>
          <TableHead>Commission Rate</TableHead>
          <TableHead>Experience</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {staff.map((member) => {
          const appointmentCount = appointmentCounts.get(member.id) || 0
          const utilization = appointmentCount > 0 ? Math.min(100, (appointmentCount / 8) * 100) : 0
          const experience = member.hire_date 
            ? Math.floor((new Date().getTime() - new Date(member.hire_date).getTime()) / (1000 * 60 * 60 * 24 * 365))
            : 0
          return (
            <TableRow key={member.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.profiles?.avatar_url || undefined} />
                    <AvatarFallback>
                      {member.profiles?.full_name?.split(' ').map(n => n[0]).join('') || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{member.profiles?.full_name || 'Unknown'}</div>
                    <div className="text-sm text-muted-foreground">{member.title}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="font-medium">{appointmentCount}</div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="font-medium">{utilization.toFixed(0)}%</div>
                  {utilization > 75 && <Badge variant="default">High</Badge>}
                  {utilization > 0 && utilization <= 25 && <Badge variant="outline">Low</Badge>}
                </div>
              </TableCell>
              <TableCell>{member.commission_rate}%</TableCell>
              <TableCell>
                {experience > 0 ? `${experience} year${experience > 1 ? 's' : ''}` : 'New'}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}