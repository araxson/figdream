import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui"
import { Award } from "lucide-react"
interface StaffPerformance {
  name: string
  appointments: number
  revenue: number
}
interface StaffReportProps {
  staffPerformance: StaffPerformance[]
}
export function StaffReport({ staffPerformance }: StaffReportProps) {
  if (staffPerformance.length === 0) {
    return (
      <div className="text-center py-8">
        <Award className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No staff performance data available</p>
      </div>
    )
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Staff Member</TableHead>
          <TableHead className="text-center">Appointments</TableHead>
          <TableHead className="text-right">Revenue</TableHead>
          <TableHead className="text-right">Avg per Service</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {staffPerformance.map((staff, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{staff.name}</TableCell>
            <TableCell className="text-center">{staff.appointments}</TableCell>
            <TableCell className="text-right">${staff.revenue.toFixed(2)}</TableCell>
            <TableCell className="text-right">
              ${staff.appointments > 0 
                ? (staff.revenue / staff.appointments).toFixed(2)
                : '0.00'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}