import { BaseService, ServiceResponse } from '@/lib/api/services/base.service'
import { Database } from '@/types/database.types'
import { SupabaseClient } from '@supabase/supabase-js'

type Tables = Database['public']['Tables']
type Customer = Tables['customers']['Row']
type Appointment = Tables['appointments']['Row']
type Review = Tables['reviews']['Row']

export interface CustomerWithDetails extends Customer {
  appointments?: Appointment[]
  reviews?: Review[]
  appointment_count?: number
  review_count?: number
  last_appointment?: string | null
}

export interface CustomerFilters {
  salon_id?: string
  search?: string
  is_vip?: boolean
  created_from?: string
  created_to?: string
}

export class CustomerService extends BaseService<'customers'> {
  constructor(supabase: SupabaseClient<Database>) {
    super('customers', supabase)
  }

  async getCustomersWithDetails(
    filters: CustomerFilters = {}
  ): Promise<ServiceResponse<CustomerWithDetails[]>> {
    try {
      let query = this.supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters.salon_id) {
        query = query.eq('salon_id', filters.salon_id)
      }

      if (filters.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`)
      }

      if (filters.is_vip !== undefined) {
        query = query.eq('is_vip', filters.is_vip)
      }

      if (filters.created_from) {
        query = query.gte('created_at', filters.created_from)
      }

      if (filters.created_to) {
        query = query.lte('created_at', filters.created_to)
      }

      const { data: customers, error } = await query

      if (error) throw error

      // Fetch appointments for each customer
      const customersWithStats = await Promise.all((customers || []).map(async (customer) => {
        const { data: appointments } = await this.supabase
          .from('appointments')
          .select('*')
          .eq('customer_id', customer.id)
          .order('appointment_date', { ascending: false })

        const { data: reviews } = await this.supabase
          .from('reviews')
          .select('*')
          .eq('customer_id', customer.id)
          .order('created_at', { ascending: false })

        const completedAppointments = appointments?.filter(
          app => app.status === 'completed'
        ) || []

        const lastAppointment = completedAppointments[0]

        return {
          ...customer,
          appointments,
          reviews,
          appointment_count: appointments?.length || 0,
          review_count: reviews?.length || 0,
          last_appointment: lastAppointment?.appointment_date || null
        }
      }))

      return {
        data: customersWithStats as CustomerWithDetails[],
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  async getCustomerById(id: string): Promise<ServiceResponse<CustomerWithDetails>> {
    try {
      const { data: customer, error } = await this.supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      // Fetch appointments
      const { data: appointments } = await this.supabase
        .from('appointments')
        .select(`
          *,
          staff_profiles(
            id,
            display_name,
            avatar_url
          )
        `)
        .eq('customer_id', id)
        .order('appointment_date', { ascending: false })

      // Fetch reviews
      const { data: reviews } = await this.supabase
        .from('reviews')
        .select(`
          *,
          staff_profiles(
            id,
            display_name
          )
        `)
        .eq('customer_id', id)
        .order('created_at', { ascending: false })

      const completedAppointments = appointments?.filter(
        app => app.status === 'completed'
      ) || []

      const lastAppointment = completedAppointments[0]

      return {
        data: {
          ...customer,
          appointments,
          reviews,
          appointment_count: appointments?.length || 0,
          review_count: reviews?.length || 0,
          last_appointment: lastAppointment?.appointment_date || null
        } as CustomerWithDetails,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  async searchCustomers(
    salon_id: string,
    searchTerm: string
  ): Promise<ServiceResponse<Customer[]>> {
    try {
      const { data, error } = await this.supabase
        .from('customers')
        .select('*')
        .eq('salon_id', salon_id)
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .limit(10)

      if (error) throw error

      return {
        data: data as Customer[],
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  async getCustomersByStaff(
    staff_id: string,
    limit?: number
  ): Promise<ServiceResponse<CustomerWithDetails[]>> {
    try {
      // Get appointments for this staff member
      const { data: appointments, error } = await this.supabase
        .from('appointments')
        .select('customer_id')
        .eq('staff_id', staff_id)
        .eq('status', 'completed')
        .order('appointment_date', { ascending: false })

      if (error) throw error

      // Get unique customer IDs
      const uniqueCustomerIds = [...new Set(appointments?.map(a => a.customer_id) || [])]
        .slice(0, limit || undefined)

      if (uniqueCustomerIds.length === 0) {
        return { data: [], error: null }
      }

      // Fetch customer details
      const { data: customers, error: custError } = await this.supabase
        .from('customers')
        .select('*')
        .in('id', uniqueCustomerIds)

      if (custError) throw custError

      return {
        data: customers as CustomerWithDetails[],
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  async updateCustomerVipStatus(
    customer_id: string,
    is_vip: boolean
  ): Promise<ServiceResponse<Customer>> {
    try {
      const { data, error } = await this.supabase
        .from('customers')
        .update({ is_vip, updated_at: new Date().toISOString() })
        .eq('id', customer_id)
        .select()
        .single()

      if (error) throw error

      return {
        data,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  async updateCustomerNotes(
    customer_id: string,
    notes: string
  ): Promise<ServiceResponse<Customer>> {
    try {
      const { data, error } = await this.supabase
        .from('customers')
        .update({ notes, updated_at: new Date().toISOString() })
        .eq('id', customer_id)
        .select()
        .single()

      if (error) throw error

      return {
        data,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  async updateCustomerTags(
    customer_id: string,
    tags: string[]
  ): Promise<ServiceResponse<Customer>> {
    try {
      const { data, error } = await this.supabase
        .from('customers')
        .update({ 
          tags, 
          has_tags: tags.length > 0,
          updated_at: new Date().toISOString() 
        })
        .eq('id', customer_id)
        .select()
        .single()

      if (error) throw error

      return {
        data,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  async getCustomerStats(
    salon_id: string,
    dateRange?: { from: string; to: string }
  ): Promise<ServiceResponse<{
    total_customers: number
    new_customers: number
    returning_customers: number
    vip_customers: number
    average_visit_value: number
    top_customers: CustomerWithDetails[]
  }>> {
    try {
      let customersQuery = this.supabase
        .from('customers')
        .select('*')
        .eq('salon_id', salon_id)

      if (dateRange) {
        customersQuery = customersQuery
          .gte('created_at', dateRange.from)
          .lte('created_at', dateRange.to)
      }

      const { data: customers, error } = await customersQuery

      if (error) throw error

      const stats = {
        total_customers: customers?.length || 0,
        new_customers: 0,
        returning_customers: 0,
        vip_customers: 0,
        average_visit_value: 0,
        top_customers: [] as CustomerWithDetails[]
      }

      // Count VIP customers
      stats.vip_customers = customers?.filter(c => c.is_vip).length || 0

      // Count new vs returning based on visit_count
      customers?.forEach(customer => {
        if (customer.visit_count === 0) {
          stats.new_customers++
        } else if (customer.visit_count > 0) {
          stats.returning_customers++
        }
      })

      // Calculate average visit value
      const totalValue = customers?.reduce((sum, c) => sum + (c.computed_total_spent || 0), 0) || 0
      const totalVisits = customers?.reduce((sum, c) => sum + (c.computed_total_visits || 0), 0) || 1
      stats.average_visit_value = totalValue / totalVisits

      // Get top customers by total spent
      stats.top_customers = (customers || [])
        .sort((a, b) => (b.computed_total_spent || 0) - (a.computed_total_spent || 0))
        .slice(0, 10)
        .map(customer => ({
          ...customer,
          appointment_count: customer.computed_total_visits || 0
        }))

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

  async mergeCustomers(
    primaryCustomerId: string,
    secondaryCustomerId: string
  ): Promise<ServiceResponse<Customer>> {
    try {
      // Update appointments to point to primary customer
      const { error: appointmentsError } = await this.supabase
        .from('appointments')
        .update({ customer_id: primaryCustomerId })
        .eq('customer_id', secondaryCustomerId)

      if (appointmentsError) throw appointmentsError

      // Update reviews to point to primary customer
      const { error: reviewsError } = await this.supabase
        .from('reviews')
        .update({ customer_id: primaryCustomerId })
        .eq('customer_id', secondaryCustomerId)

      if (reviewsError) throw reviewsError

      // Delete secondary customer
      const { error: deleteError } = await this.supabase
        .from('customers')
        .delete()
        .eq('id', secondaryCustomerId)

      if (deleteError) throw deleteError

      // Get updated primary customer
      const { data, error } = await this.supabase
        .from('customers')
        .select('*')
        .eq('id', primaryCustomerId)
        .single()

      if (error) throw error

      return {
        data: data as Customer,
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