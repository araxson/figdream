// Ultra-thin booking confirmation page
import { BookingConfirmation } from '@/core/customer/components/booking'
import { getBookingById } from '@/core/customer/dal'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function BookingConfirmationPage({ params }: PageProps) {
  const resolvedParams = await params;
  // Fetch booking data server-side
  const booking = await getBookingById(resolvedParams.id)

  // Transform to confirmation format with type safety
  const salonData = booking.salon as any // Type assertion for joined data
  const confirmation = {
    confirmationCode: booking.confirmation_code || '',
    appointment: booking,
    services: booking.appointment_services || [],
    staff: booking.staff,
    salon: {
      id: salonData?.id || '',
      name: salonData?.name || '',
      address: salonData?.address || '',
      phone: salonData?.phone || '',
      email: salonData?.email || ''
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