import { Database } from '@/types/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { ServiceResponse } from '@/lib/api/services/base.service'
import { StaffEarningsFilters, StaffUtilizationOptions } from './staff-types'

type StaffSchedule = Database['public']['Tables']['staff_schedules']['Row']

export class StaffAnalyticsService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async calculateUtilization(
    options: StaffUtilizationOptions
  ): Promise<ServiceResponse<number>> {
    try {
      const { data: appointments, error: apptError } = await this.supabase
        .from('appointments')
        .select('appointment_date, computed_total_duration')
        .eq('staff_id', options.staff_id)
        .eq('status', 'completed')
        .gte('appointment_date', options.start_date)
        .lte('appointment_date', options.end_date)

      if (apptError) throw apptError

      const { data: schedules, error: schedError } = await this.supabase
        .from('staff_schedules')
        .select('*')
        .eq('staff_id', options.staff_id)

      if (schedError) throw schedError

      const totalWorkMinutes = this.calculateTotalWorkMinutes(
        schedules || [],
        options.start_date,
        options.end_date
      )

      const totalAppointmentMinutes = (appointments || []).reduce(
        (sum, apt) => sum + (apt.computed_total_duration || 30),
        0
      )

      const utilization = totalWorkMinutes > 0
        ? (totalAppointmentMinutes / totalWorkMinutes) * 100
        : 0

      return {
        data: Math.round(utilization * 100) / 100,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to calculate utilization')
      }
    }
  }

  async getStaffEarnings(
    filters: StaffEarningsFilters
  ): Promise<ServiceResponse<unknown[]>> {
    try {
      let query = this.supabase
        .from('staff_earnings')
        .select('*')
        .eq('staff_id', filters.staff_id)
        .order('created_at', { ascending: false })

      if (filters.start_date) {
        query = query.gte('created_at', filters.start_date)
      }

      if (filters.end_date) {
        query = query.lte('created_at', filters.end_date)
      }

      if (filters.type) {
        query = query.eq('category', filters.type)
      }

      const { data, error } = await query

      if (error) throw error

      return {
        data: data || [],
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to get staff earnings')
      }
    }
  }

  async getStaffPerformanceMetrics(
    staffId: string,
    startDate: string,
    endDate: string
  ): Promise<ServiceResponse<unknown>> {
    try {
      // Get appointments
      const { data: appointments } = await this.supabase
        .from('appointments')
        .select('*')
        .eq('staff_id', staffId)
        .gte('start_time', startDate)
        .lte('start_time', endDate)

      // Get reviews
      const { data: reviews } = await this.supabase
        .from('reviews')
        .select('rating')
        .eq('staff_id', staffId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)

      // Get earnings
      const { data: earnings } = await this.supabase
        .from('staff_earnings')
        .select('commission_amount, tip_amount')
        .eq('staff_id', staffId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)

      const totalAppointments = appointments?.length || 0
      const completedAppointments = appointments?.filter(a => a.status === 'completed').length || 0
      const cancelledAppointments = appointments?.filter(a => a.status === 'cancelled').length || 0
      const noShowAppointments = appointments?.filter(a => a.status === 'no_show').length || 0

      const averageRating = reviews?.length
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0

      const totalEarnings = earnings?.reduce((sum, e) => sum + ((e.commission_amount || 0) + (e.tip_amount || 0)), 0) || 0
      const commissionEarnings = earnings?.reduce((sum, e) => sum + (e.commission_amount || 0), 0) || 0
      const tipEarnings = earnings?.reduce((sum, e) => sum + (e.tip_amount || 0), 0) || 0

      return {
        data: {
          totalAppointments,
          completedAppointments,
          cancelledAppointments,
          noShowAppointments,
          completionRate: totalAppointments > 0 
            ? (completedAppointments / totalAppointments) * 100 
            : 0,
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews: reviews?.length || 0,
          totalEarnings,
          commissionEarnings,
          tipEarnings
        },
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to get performance metrics')
      }
    }
  }

  private calculateTotalWorkMinutes(
    schedules: StaffSchedule[],
    startDate: string,
    endDate: string
  ): number {
    const start = new Date(startDate)
    const end = new Date(endDate)
    let totalMinutes = 0

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay()
      const schedule = schedules.find(s => s.day_of_week === dayOfWeek && s.is_working)
      
      if (schedule) {
        const startTime = new Date(`2000-01-01 ${schedule.start_time}`)
        const endTime = new Date(`2000-01-01 ${schedule.end_time}`)
        const workMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60)
        totalMinutes += workMinutes
      }
    }

    return totalMinutes
  }
}