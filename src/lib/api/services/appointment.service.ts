import { BaseService, ServiceResponse } from '@/lib/api/services/base.service'
import { Database } from '@/types/database.types'
import { SupabaseClient } from '@supabase/supabase-js'

type Tables = Database['public']['Tables']
type Appointment = Tables['appointments']['Row']
type AppointmentInsert = Tables['appointments']['Insert']
type AppointmentUpdate = Tables['appointments']['Update']

export interface AppointmentWithDetails extends Omit<Appointment, 'services'> {
  customers?: Tables['customers']['Row']
  staff_profiles?: Tables['staff_profiles']['Row']
  services?: Tables['services']['Row'][]
  appointment_services?: Tables['appointment_services']['Row'][]
  appointment_notes?: Tables['appointment_notes']['Row'][]
}

export interface AppointmentFilters {
  salon_id?: string
  customer_id?: string
  staff_id?: string
  status?: Database['public']['Enums']['appointment_status']
  date_from?: string
  date_to?: string
}

export class AppointmentService extends BaseService<'appointments'> {
  constructor(supabase: SupabaseClient<Database>) {
    super('appointments', supabase)
  }

  async getAppointmentsWithDetails(
    filters: AppointmentFilters = {}
  ): Promise<ServiceResponse<AppointmentWithDetails[]>> {
    try {
      let query = this.supabase
        .from('appointments')
        .select(`
          *,
          customers!inner(
            id,
            name,
            email,
            phone,
            avatar_url
          ),
          staff_profiles!inner(
            id,
            user_id,
            display_name,
            specialties,
            avatar_url
          ),
          appointment_services!inner(
            id,
            service_id,
            quantity,
            price,
            duration,
            services!inner(
              id,
              name,
              description,
              category,
              base_price,
              duration_minutes
            )
          ),
          appointment_notes(
            id,
            note,
            is_private,
            created_at,
            staff_id
          )
        `)
        .order('appointment_date', { ascending: true })

      if (filters.salon_id) {
        query = query.eq('salon_id', filters.salon_id)
      }

      if (filters.customer_id) {
        query = query.eq('customer_id', filters.customer_id)
      }

      if (filters.staff_id) {
        query = query.eq('staff_id', filters.staff_id)
      }

      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      if (filters.date_from) {
        query = query.gte('appointment_date', filters.date_from)
      }

      if (filters.date_to) {
        query = query.lte('appointment_date', filters.date_to)
      }

      const { data, error } = await query

      if (error) throw error

      return {
        data: data as unknown as AppointmentWithDetails[],
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  async getTodayAppointments(
    salon_id: string,
    staff_id?: string
  ): Promise<ServiceResponse<AppointmentWithDetails[]>> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const filters: AppointmentFilters = {
      salon_id,
      date_from: today.toISOString(),
      date_to: tomorrow.toISOString()
    }

    if (staff_id) {
      filters.staff_id = staff_id
    }

    return this.getAppointmentsWithDetails(filters)
  }

  async getUpcomingAppointments(
    customer_id: string,
    limit: number = 10
  ): Promise<ServiceResponse<AppointmentWithDetails[]>> {
    try {
      const now = new Date().toISOString()
      
      const { data, error } = await this.supabase
        .from('appointments')
        .select(`
          *,
          staff_profiles!inner(
            id,
            display_name,
            avatar_url
          ),
          salons!inner(
            id,
            name,
            address,
            phone
          ),
          appointment_services!inner(
            services!inner(
              id,
              name,
              duration_minutes
            )
          )
        `)
        .eq('customer_id', customer_id)
        .gte('appointment_date', now)
        .order('appointment_date', { ascending: true })
        .limit(limit)

      if (error) throw error

      return {
        data: data as unknown as AppointmentWithDetails[],
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  async checkAvailability(
    staff_id: string,
    datetime: string,
    duration_minutes: number
  ): Promise<ServiceResponse<boolean>> {
    try {
      const start = new Date(datetime)
      const end = new Date(start.getTime() + duration_minutes * 60000)

      const { data: existingAppointments, error } = await this.supabase
        .from('appointments')
        .select('id, appointment_date, duration_minutes')
        .eq('staff_id', staff_id)
        .neq('status', 'cancelled')
        .gte('appointment_date', start.toISOString())
        .lt('appointment_date', end.toISOString())

      if (error) throw error

      const { data: blockedTimes, error: blockedError } = await this.supabase
        .from('blocked_times')
        .select('id')
        .eq('staff_id', staff_id)
        .lte('start_time', start.toISOString())
        .gte('end_time', end.toISOString())

      if (blockedError) throw blockedError

      const isAvailable = 
        (!existingAppointments || existingAppointments.length === 0) &&
        (!blockedTimes || blockedTimes.length === 0)

      return {
        data: isAvailable,
        error: null
      }
    } catch (error) {
      return {
        data: false,
        error: error as Error
      }
    }
  }

  async createAppointmentWithServices(
    appointment: AppointmentInsert,
    services: Array<{
      service_id: string
      quantity: number
      price: number
      duration: number
    }>
  ): Promise<ServiceResponse<AppointmentWithDetails>> {
    try {
      const { data: appointmentData, error: appointmentError } = await this.supabase
        .from('appointments')
        .insert(appointment)
        .select()
        .single()

      if (appointmentError) throw appointmentError

      const appointmentServices = services.map(service => ({
        appointment_id: appointmentData.id,
        service_id: service.service_id,
        duration_minutes: service.duration,
        price: service.price
      }))

      const { error: servicesError } = await this.supabase
        .from('appointment_services')
        .insert(appointmentServices)

      if (servicesError) throw servicesError

      const { data: fullAppointment } = await this.getById(appointmentData.id)

      return {
        data: fullAppointment as unknown as AppointmentWithDetails,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  async updateStatus(
    id: string,
    status: 'confirmed' | 'completed' | 'cancelled' | 'no_show',
    cancellation_reason?: string
  ): Promise<ServiceResponse<Appointment>> {
    const updateData: AppointmentUpdate = {
      status,
      updated_at: new Date().toISOString()
    }

    if (status === 'cancelled' && cancellation_reason) {
      updateData.cancellation_reason = cancellation_reason
    }

    return this.update(id, updateData)
  }

  async reschedule(
    id: string,
    newDateTime: string,
    newStaffId?: string
  ): Promise<ServiceResponse<Appointment>> {
    const date = new Date(newDateTime)
    const updateData: AppointmentUpdate = {
      appointment_date: date.toISOString().split('T')[0],
      start_time: date.toISOString().split('T')[1].substring(0, 8),
      updated_at: new Date().toISOString()
    }

    if (newStaffId) {
      updateData.staff_id = newStaffId
    }

    return this.update(id, updateData)
  }

  async getAppointmentStats(
    salon_id: string,
    dateRange?: { from: string; to: string }
  ): Promise<ServiceResponse<{
    total: number
    confirmed: number
    completed: number
    cancelled: number
    no_show: number
    revenue: number
  }>> {
    try {
      let query = this.supabase
        .from('appointments')
        .select('status, computed_total_price')
        .eq('salon_id', salon_id)

      if (dateRange) {
        query = query
          .gte('appointment_date', dateRange.from)
          .lte('appointment_date', dateRange.to)
      }

      const { data, error } = await query

      if (error) throw error

      const stats = {
        total: data?.length || 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        no_show: 0,
        revenue: 0
      }

      data?.forEach(appointment => {
        switch (appointment.status) {
          case 'confirmed':
            stats.confirmed++
            break
          case 'completed':
            stats.completed++
            stats.revenue += appointment.computed_total_price || 0
            break
          case 'cancelled':
            stats.cancelled++
            break
          case 'no_show':
            stats.no_show++
            break
        }
      })

      return {
        data: stats,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }
}