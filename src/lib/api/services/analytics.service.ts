import { ServiceResponse } from './base.service'
import { Database } from '@/types/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

export interface AnalyticsData {
  revenue: {
    total: number
    monthly: number
    growth: number
  }
  appointments: {
    total: number
    completed: number
    cancelled: number
    noShow: number
  }
  customers: {
    total: number
    new: number
    returning: number
  }
  services: {
    popular: Array<{
      id: string
      name: string
      count: number
    }>
  }
}

export class AnalyticsService {
  protected supabase: SupabaseClient<Database>

  constructor() {
    this.supabase = createClient()
  }

  async getDashboardAnalytics(salonId: string, dateRange?: { from: Date; to: Date }): Promise<ServiceResponse<AnalyticsData>> {
    try {
      const from = dateRange?.from || new Date(new Date().setMonth(new Date().getMonth() - 1))
      const to = dateRange?.to || new Date()

      // Get revenue data
      const { data: revenueData } = await this.supabase
        .from('appointments')
        .select('computed_total_price')
        .eq('salon_id', salonId)
        .eq('status', 'completed')
        .gte('appointment_date', from.toISOString())
        .lte('appointment_date', to.toISOString())

      const totalRevenue = revenueData?.reduce((sum, apt) => sum + (apt.computed_total_price || 0), 0) || 0

      // Get appointment stats
      const { data: appointments } = await this.supabase
        .from('appointments')
        .select('status')
        .eq('salon_id', salonId)
        .gte('appointment_date', from.toISOString())
        .lte('appointment_date', to.toISOString())

      const appointmentStats = {
        total: appointments?.length || 0,
        completed: appointments?.filter(a => a.status === 'completed').length || 0,
        cancelled: appointments?.filter(a => a.status === 'cancelled').length || 0,
        noShow: appointments?.filter(a => a.status === 'no_show').length || 0
      }

      // Get customer stats
      const { data: customers } = await this.supabase
        .from('customers')
        .select('id, created_at')
        .eq('salon_id', salonId)

      const newCustomers = customers?.filter(c => 
        new Date(c.created_at) >= from && new Date(c.created_at) <= to
      ).length || 0

      // Get popular services
      const { data: services } = await this.supabase
        .from('appointment_services')
        .select(`
          service_id,
          services(id, name)
        `)
        .eq('salon_id', salonId)
        .gte('created_at', from.toISOString())
        .lte('created_at', to.toISOString())

      const serviceCount: Record<string, { name: string; count: number }> = {}
      services?.forEach(s => {
        const service = s.services as Record<string, unknown> | null
        if (s.service_id && service?.name) {
          if (!serviceCount[s.service_id]) {
            serviceCount[s.service_id] = { 
              name: String(service.name), 
              count: 0 
            }
          }
          serviceCount[s.service_id].count++
        }
      })

      const popularServices = Object.entries(serviceCount)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      const analyticsData: AnalyticsData = {
        revenue: {
          total: totalRevenue,
          monthly: totalRevenue,
          growth: 0 // Would need previous period data to calculate
        },
        appointments: appointmentStats,
        customers: {
          total: customers?.length || 0,
          new: newCustomers,
          returning: (customers?.length || 0) - newCustomers
        },
        services: {
          popular: popularServices
        }
      }

      return { data: analyticsData, error: null }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

}