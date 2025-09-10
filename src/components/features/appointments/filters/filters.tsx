import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AppointmentFiltersProps {
  filters?: unknown
  onFiltersChange?: unknown
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function AppointmentFilters(_props: AppointmentFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
        <CardDescription>Filter appointments</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Filter options will be displayed here</p>
      </CardContent>
    </Card>
  )
}