import { BaseService, ServiceResponse } from '@/lib/api/services/base.service'
import { Database } from '@/types/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { 
  StaffWithDetails, 
  StaffFilters, 
  StaffScheduleUpdate,
  StaffTimeOffRequest,
  StaffServiceAssignment,
  StaffSpecialtyAssignment,
  StaffEarningsFilters,
  StaffUtilizationOptions
} from './staff/staff-types'
import { StaffScheduleService } from './staff/staff-schedule.service'
import { StaffAnalyticsService } from './staff/staff-analytics.service'

export class StaffService extends BaseService<'staff_profiles'> {
  private scheduleService: StaffScheduleService
  private analyticsService: StaffAnalyticsService

  constructor(supabase: SupabaseClient<Database>) {
    super('staff_profiles', supabase)
    this.scheduleService = new StaffScheduleService(supabase)
    this.analyticsService = new StaffAnalyticsService(supabase)
  }

  async getStaffWithDetails(
    filters: StaffFilters = {}
  ): Promise<ServiceResponse<StaffWithDetails[]>> {
    try {
      let query = this.supabase
        .from('staff_profiles')
        .select(`
          *,
          users!inner(email, first_name, last_name, avatar_url),
          staff_schedules(*),
          staff_services(*),
          staff_specialties(*),
          appointments(
            id,
            appointment_date,
            status,
            computed_total_price
          ),
          reviews(rating)
        `)

      if (filters.salon_id) {
        query = query.eq('salon_id', filters.salon_id)
      }

      if (filters.location_id) {
        query = query.eq('location_id', filters.location_id)
      }

      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active)
      }

      const { data, error } = await query

      if (error) throw error

      const staffWithStats = await Promise.all(
        (data || []).map(async (staff) => {
          const appointments = staff.appointments || []
          const reviews = staff.reviews || []
          
          const completedAppointments = appointments.filter(
            (apt) => apt.status === 'completed'
          )
          
          const totalRevenue = completedAppointments.reduce(
            (sum, apt) => sum + (apt.computed_total_price || 0),
            0
          )
          
          const averageRating = reviews.length
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : 0

          return {
            ...staff,
            total_appointments: appointments.length,
            total_revenue: totalRevenue,
            average_rating: Math.round(averageRating * 10) / 10
          }
        })
      )

      return {
        data: staffWithStats as unknown as StaffWithDetails[],
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to get staff details')
      }
    }
  }

  async getStaffById(id: string): Promise<ServiceResponse<StaffWithDetails>> {
    try {
      const { data, error } = await this.supabase
        .from('staff_profiles')
        .select(`
          *,
          users!inner(email, first_name, last_name, avatar_url),
          staff_schedules(*),
          staff_services(*, services(*)),
          staff_specialties(*, specialties(*)),
          staff_time_off(*),
          staff_breaks(*),
          appointments(
            id,
            appointment_date,
            status,
            computed_total_price,
            customers(first_name, last_name),
            services
          ),
          reviews(rating, comment, customers(first_name, last_name))
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      return {
        data: data as unknown as StaffWithDetails,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to get staff member')
      }
    }
  }

  async assignServices(
    assignment: StaffServiceAssignment
  ): Promise<ServiceResponse<boolean>> {
    try {
      // Remove existing services
      await this.supabase
        .from('staff_services')
        .delete()
        .eq('staff_id', assignment.staff_id)

      // Add new services
      if (assignment.service_ids.length > 0) {
        const { error } = await this.supabase
          .from('staff_services')
          .insert(
            assignment.service_ids.map(service_id => ({
              staff_id: assignment.staff_id,
              service_id
            }))
          )

        if (error) throw error
      }

      return {
        data: true,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to assign services')
      }
    }
  }

  async assignSpecialties(
    assignment: StaffSpecialtyAssignment
  ): Promise<ServiceResponse<boolean>> {
    try {
      // Remove existing specialties
      await this.supabase
        .from('staff_specialties')
        .delete()
        .eq('staff_id', assignment.staff_id)

      // Add new specialties
      if (assignment.specialty_ids.length > 0) {
        const { error } = await this.supabase
          .from('staff_specialties')
          .insert(
            assignment.specialty_ids.map(specialty => ({
              staff_id: assignment.staff_id,
              specialty
            }))
          )

        if (error) throw error
      }

      return {
        data: true,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to assign specialties')
      }
    }
  }

  // Delegate to schedule service
  async getAvailableStaff(date: string, service_id?: string) {
    return this.scheduleService.getAvailableStaff(date, service_id)
  }

  async updateSchedule(schedules: StaffScheduleUpdate[]) {
    return this.scheduleService.updateSchedule(schedules)
  }

  async requestTimeOff(request: StaffTimeOffRequest) {
    return this.scheduleService.requestTimeOff(request)
  }

  async approveTimeOff(timeOffId: string, approved: boolean) {
    return this.scheduleService.approveTimeOff(timeOffId, approved)
  }

  // Delegate to analytics service
  async calculateUtilization(options: StaffUtilizationOptions) {
    return this.analyticsService.calculateUtilization(options)
  }

  async getStaffEarnings(filters: StaffEarningsFilters) {
    return this.analyticsService.getStaffEarnings(filters)
  }

  async getStaffPerformanceMetrics(staffId: string, startDate: string, endDate: string) {
    return this.analyticsService.getStaffPerformanceMetrics(staffId, startDate, endDate)
  }
}

// Re-export types for convenience
export type {
  StaffWithDetails,
  StaffFilters,
  StaffScheduleUpdate,
  StaffTimeOffRequest,
  StaffServiceAssignment,
  StaffSpecialtyAssignment,
  StaffEarningsFilters,
  StaffUtilizationOptions
} from './staff/staff-types'