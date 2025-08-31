import { createClient } from "@/lib/database/supabase/server"
import { RevenueChart } from '@/components/features/charts/revenue-chart'
import { AppointmentOverviewChart } from '@/components/features/charts/appointment-overview-chart'

interface RevenueSectionProps {
  salonId: string
}

export async function RevenueSection({ salonId }: RevenueSectionProps) {
  const supabase = await createClient()
  
  // Get last 7 days of data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return date.toISOString().split('T')[0]
  }).reverse()

  // Fetch revenue data for each day
  const revenueData = await Promise.all(
    last7Days.map(async (date) => {
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)
      
      const { data: appointments } = await supabase
        .from("appointments")
        .select("total_price, status")
        .eq("salon_id", salonId)
        .gte("start_time", `${date}T00:00:00`)
        .lt("start_time", `${nextDate.toISOString().split('T')[0]}T00:00:00`)
      
      const revenue = appointments
        ?.filter(apt => apt.status === 'completed')
        .reduce((sum, apt) => sum + (apt.total_price || 0), 0) || 0
      
      const appointmentCount = appointments?.length || 0
      
      return {
        date,
        revenue,
        appointments: appointmentCount
      }
    })
  )

  // Get appointment status breakdown for the week
  const { data: weekAppointments } = await supabase
    .from("appointments")
    .select("status")
    .eq("salon_id", salonId)
    .gte("start_time", `${last7Days[0]}T00:00:00`)
  
  const statusBreakdown = [
    {
      name: 'This Week',
      total: weekAppointments?.length || 0,
      completed: weekAppointments?.filter(a => a.status === 'completed').length || 0,
      cancelled: weekAppointments?.filter(a => a.status === 'cancelled').length || 0,
      pending: weekAppointments?.filter(a => a.status === 'pending').length || 0,
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <RevenueChart data={revenueData} type="area" />
      <AppointmentOverviewChart data={statusBreakdown} />
    </div>
  )
}