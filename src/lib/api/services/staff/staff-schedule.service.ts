import { Database } from '@/types/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { ServiceResponse } from '@/lib/api/services/base.service'
import { StaffScheduleUpdate, StaffTimeOffRequest } from './staff-types'

export class StaffScheduleService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async updateSchedule(
    schedules: StaffScheduleUpdate[]
  ): Promise<ServiceResponse<boolean>> {
    try {
      await Promise.all(
        schedules.map(async (schedule) => {
          const { error } = await this.supabase
            .from('staff_schedules')
            .upsert({
              staff_id: schedule.staff_id,
              day_of_week: schedule.day_of_week,
              start_time: schedule.start_time,
              end_time: schedule.end_time,
              is_available: schedule.is_available,
              updated_at: new Date().toISOString()
            })
            .select()
            .single()

          if (error) throw error
        })
      )

      return {
        data: true,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to update schedule')
      }
    }
  }

  async requestTimeOff(
    request: StaffTimeOffRequest
  ): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await this.supabase
        .from('staff_time_off')
        .insert({
          staff_id: request.staff_id,
          start_date: request.start_date,
          end_date: request.end_date,
          reason: request.reason,
          type: request.type,
          status: 'pending',
          created_at: new Date().toISOString()
        })

      if (error) throw error

      return {
        data: true,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to request time off')
      }
    }
  }

  async approveTimeOff(
    timeOffId: string,
    approved: boolean
  ): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await this.supabase
        .from('staff_time_off')
        .update({
          status: approved ? 'approved' : 'rejected',
          approved_at: new Date().toISOString()
        })
        .eq('id', timeOffId)

      if (error) throw error

      return {
        data: true,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to update time off request')
      }
    }
  }

  async getAvailableStaff(
    date: string,
    service_id?: string
  ): Promise<ServiceResponse<unknown[]>> {
    try {
      const dayOfWeek = new Date(date).getDay()
      
      const selectString = service_id
        ? `
          *,
          staff_schedules!inner(*),
          staff_services!inner(service_id),
          staff_time_off(*),
          appointments(*)
        `
        : `
          *,
          staff_schedules!inner(*),
          staff_time_off(*),
          appointments(*)
        `

      let query = this.supabase
        .from('staff_profiles')
        .select(selectString)
        .eq('is_active', true)
        .eq('staff_schedules.day_of_week', dayOfWeek)
        .eq('staff_schedules.is_available', true)

      if (service_id) {
        query = query.eq('staff_services.service_id', service_id)
      }

      const { data, error } = await query

      if (error) throw error

      // Filter out staff on time off
      type StaffWithTimeOff = typeof data extends Array<infer T> ? T : never
      const availableStaff = ((data || []) as unknown as StaffWithTimeOff[]).filter(staff => {
        const timeOffRecords = (staff as unknown as {
          staff_time_off?: Array<{
            is_approved: boolean | null
            start_date: string
            end_date: string
          }>
        }).staff_time_off
        
        const onTimeOff = timeOffRecords?.some(
          (timeOff) =>
            timeOff.is_approved === true &&
            new Date(date) >= new Date(timeOff.start_date) &&
            new Date(date) <= new Date(timeOff.end_date)
        )
        return !onTimeOff
      })

      return {
        data: availableStaff,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to get available staff')
      }
    }
  }
}