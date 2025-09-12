import { requireAuth } from '@/lib/api/dal/auth'
import { AppointmentsPageContent } from '@/components/features/appointments/appointments-page-content'

export default async function OwnerAppointmentsPage() {
  const session = await requireAuth()
  return <AppointmentsPageContent userRole={session.user.role} />
}