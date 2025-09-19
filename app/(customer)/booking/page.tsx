// Ultra-thin booking page
import { BookingWizard } from '@/core/customer/components/booking'

export default function BookingPage() {
  // In production, get salonId from context or params
  const salonId = 'salon-123' // Replace with actual salon ID

  return (
    <div className="container mx-auto py-8">
      <BookingWizard salonId={salonId} />
    </div>
  )
}