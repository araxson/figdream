// Ultra-thin booking confirmation page
import { BookingConfirmation } from '@/core/booking/components'
import { getBookingById } from '@/core/booking/dal'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function BookingConfirmationPage({ params }: PageProps) {
  const resolvedParams = await params;
  // Fetch booking data server-side
  const booking = await getBookingById(resolvedParams.id)

  // Transform to confirmation format
  const confirmation = {
    confirmationCode: booking.confirmation_code || '',
    appointment: booking,
    services: booking.appointment_services || [],
    staff: booking.staff,
    salon: {
      id: booking.salon?.id || '',
      name: booking.salon?.name || '',
      address: booking.salon?.address || '',
      phone: booking.salon?.phone || '',
      email: booking.salon?.email || ''
    },
    totalAmount: booking.total_amount || 0,
    depositAmount: booking.deposit_amount,
    cancellationPolicy: '24 hour cancellation policy applies'
  }

  return (
    <div className="container mx-auto py-8">
      <BookingConfirmation
        confirmation={confirmation}
        onClose={() => {
          // Navigate to home or dashboard
          window.location.href = '/'
        }}
      />
    </div>
  )
}