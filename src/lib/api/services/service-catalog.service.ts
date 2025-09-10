import { BaseService, ServiceResponse } from '@/lib/api/services/base.service'
import { Database } from '@/types/database.types'
import { SupabaseClient } from '@supabase/supabase-js'

type Tables = Database['public']['Tables']
type Service = Tables['services']['Row']

export interface ServiceWithDetails extends Service {
  service_categories?: Tables['service_categories']['Row'] | null
  staff_services?: Tables['staff_services']['Row'][]
  appointment_services?: Tables['appointment_services']['Row'][]
}

export interface ServiceFilters {
  salon_id?: string
  category?: string
  is_active?: boolean
  min_price?: number
  max_price?: number
  search?: string
}

export class ServiceCatalogService extends BaseService<'services'> {
  constructor(supabase: SupabaseClient<Database>) {
    super('services', supabase)
  }

  async getServicesWithDetails(
    filters: ServiceFilters = {}
  ): Promise<ServiceResponse<ServiceWithDetails[]>> {
    try {
      let query = this.supabase
        .from('services')
        .select(`
          *,
          service_categories(
            id,
            name,
            description,
            display_order
          ),
          staff_services(
            staff_id,
            can_perform
          )
        `)
        .order('category_id', { ascending: true })
        .order('created_at', { ascending: true })

      if (filters.salon_id) {
        query = query.eq('salon_id', filters.salon_id)
      }

      if (filters.category) {
        query = query.eq('category_id', filters.category)
      }

      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active)
      }

      if (filters.min_price !== undefined) {
        query = query.gte('price', filters.min_price)
      }

      if (filters.max_price !== undefined) {
        query = query.lte('price', filters.max_price)
      }

      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        )
      }

      const { data, error } = await query

      if (error) throw error

      return {
        data: data as unknown as ServiceWithDetails[],
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  async getServicesByCategory(
    salon_id: string
  ): Promise<ServiceResponse<{ [category: string]: Service[] }>> {
    try {
      const { data, error } = await this.supabase
        .from('services')
        .select('*')
        .eq('salon_id', salon_id)
        .eq('is_active', true)
        .order('category_id')
        .order('created_at')

      if (error) throw error

      const groupedServices: { [category: string]: Service[] } = {}
      
      data?.forEach(service => {
        const category = service.category_id || 'Other'
        if (!groupedServices[category]) {
          groupedServices[category] = []
        }
        groupedServices[category].push(service)
      })

      return {
        data: groupedServices,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  async getServicesByStaff(
    staff_id: string
  ): Promise<ServiceResponse<Service[]>> {
    try {
      const { data, error } = await this.supabase
        .from('staff_services')
        .select(`
          services!inner(*)
        `)
        .eq('staff_id', staff_id)

      if (error) throw error

      const services = data?.map(item => item.services).filter(Boolean) || []

      return {
        data: services as Service[],
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  async updateServicePricing(
    service_id: string,
    pricing: {
      price: number
    }
  ): Promise<ServiceResponse<Service>> {
    return this.update(service_id, pricing)
  }

  async toggleServiceStatus(
    service_id: string
  ): Promise<ServiceResponse<Service>> {
    try {
      const { data: current } = await this.getById(service_id)
      
      if (!current) {
        throw new Error('Service not found')
      }

      return this.update(service_id, {
        is_active: !current.is_active
      })
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  // Note: Services table doesn't have display_order field - ordering should be handled via metadata or UI state
  async reorderServices(
    updates: { id: string; display_order: number }[]
  ): Promise<ServiceResponse<Service[]>> {
    try {
      // Services don't have display_order - store ordering in metadata instead
      const results = await Promise.all(
        updates.map(async ({ id, display_order }) => {
          const { data: service } = await this.getById(id)
          if (!service) throw new Error(`Service ${id} not found`)
          
          const metadata = (service.metadata as Record<string, unknown>) || {}
          metadata.display_order = display_order
          
          return this.update(id, { metadata: metadata as Database['public']['Tables']['services']['Row']['metadata'] })
        })
      )

      const hasError = results.some(r => r.error)
      if (hasError) {
        const firstError = results.find(r => r.error)?.error
        throw firstError
      }

      const data = results.map(r => r.data).filter(Boolean) as Service[]

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

  async getPopularServices(
    salon_id: string,
    limit: number = 10
  ): Promise<ServiceResponse<Array<Service & { booking_count: number }>>> {
    try {
      const { data, error } = await this.supabase
        .from('appointment_services')
        .select(`
          service_id,
          services!inner(*)
        `)
        .eq('services.salon_id', salon_id)
        .order('service_id')

      if (error) throw error

      const serviceCounts = new Map<string, { service: Service; count: number }>()
      
      data?.forEach(item => {
        if (item.services) {
          const existing = serviceCounts.get(item.service_id) || {
            service: item.services,
            count: 0
          }
          existing.count++
          serviceCounts.set(item.service_id, existing)
        }
      })

      const popular = Array.from(serviceCounts.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
        .map(({ service, count }) => ({
          ...service,
          booking_count: count
        }))

      return {
        data: popular,
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