interface FeedStats {
  totalToday: number
  newBookings: number
  cancellations: number
  modifications: number
}

interface BookingStatsDisplayProps {
  stats: FeedStats
}

export function BookingStatsDisplay({ stats }: BookingStatsDisplayProps) {
  return (
    <div className="grid grid-cols-4 gap-2 mb-4">
      <div className="text-center">
        <p className="text-2xl font-bold">{stats.totalToday}</p>
        <p className="text-xs text-muted-foreground">Total Today</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-green-600">{stats.newBookings}</p>
        <p className="text-xs text-muted-foreground">New Bookings</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-red-600">{stats.cancellations}</p>
        <p className="text-xs text-muted-foreground">Cancellations</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-blue-600">{stats.modifications}</p>
        <p className="text-xs text-muted-foreground">Modifications</p>
      </div>
    </div>
  )
}