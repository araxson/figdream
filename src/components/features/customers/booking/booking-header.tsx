import { cn } from '@/lib/utils'

export function BookingHeader() {
  return (
    <div>
      <h1 className={cn("text-3xl font-bold tracking-tight")}>Book an Appointment</h1>
      <p className={cn("text-muted-foreground")}>
        Choose your services and preferred time
      </p>
    </div>
  )
}