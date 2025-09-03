import { Progress, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui"
import { PieChart } from "lucide-react"
interface PopularService {
  name: string
  count: number
}
interface AppointmentReportProps {
  popularServices: PopularService[]
  totalAppointments: number
}
export function AppointmentReport({ popularServices, totalAppointments }: AppointmentReportProps) {
  if (popularServices.length === 0) {
    return (
      <div className="text-center py-8">
        <PieChart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No service data available</p>
      </div>
    )
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Service</TableHead>
          <TableHead className="text-center">Bookings</TableHead>
          <TableHead className="text-center">Popularity</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {popularServices.map((service, index) => {
          const popularity = totalAppointments > 0
            ? (service.count / totalAppointments) * 100
            : 0
          return (
            <TableRow key={index}>
              <TableCell className="font-medium">{service.name}</TableCell>
              <TableCell className="text-center">{service.count}</TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Progress value={popularity} className="w-20 h-2" />
                  <span className="text-sm">{popularity.toFixed(0)}%</span>
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}