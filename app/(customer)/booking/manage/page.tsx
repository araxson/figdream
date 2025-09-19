// Ultra-thin booking management page
import { BookingManager, BookingLiveFeed } from '@/core/booking/components'

export default function BookingManagementPage() {
  // In production, get salonId from context or params
  const salonId = 'salon-123' // Replace with actual salon ID

  return (
    <div className="container mx-auto py-8">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BookingManager salonId={salonId} />
        </div>
        <div>
          <BookingLiveFeed
            salonId={salonId}
            enableNotifications={true}
            enableSound={true}
          />
        </div>
      </div>
    </div>
  )
}