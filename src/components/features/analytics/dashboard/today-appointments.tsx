import { AppointmentList } from '@/components/features/appointments/appointment-list'
import { requireAuth } from '@/lib/api/dal/auth'

export async function TodayAppointments() {
  const session = await requireAuth()
  const userRole = session.user.role
  
  return (
    <AppointmentList 
      userRole={userRole}
      view="today"
      displayMode="card"
      limit={10}
    />
  )
}