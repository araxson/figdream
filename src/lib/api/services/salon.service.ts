import { BaseService, ServiceResponse, QueryOptions } from './base.service'
import { Database } from '@/types/database.types'

export type SalonWithDetails = Database['public']['Tables']['salons']['Row'] & {
  profiles?: Database['public']['Tables']['profiles']['Row']
  staff?: Database['public']['Tables']['staff_profiles']['Row'][]
  services?: Database['public']['Tables']['services']['Row'][]
  appointments?: Database['public']['Tables']['appointments']['Row'][]
}

export class SalonService extends BaseService<'salons'> {
  constructor() {
    super('salons')
  }

  async getWithDetails(id: string): Promise<ServiceResponse<SalonWithDetails>> {
    try {
      const { data, error } = await this.supabase
        .from('salons')
        .select(`
          *,
          profiles!salons_created_by_fkey(*),
          staff_profiles(*),
          services(*),
          appointments(*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      
      return { data: data as SalonWithDetails, error: null }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  async listWithDetails(options?: QueryOptions): Promise<ServiceResponse<SalonWithDetails[]>> {
    try {
      let query = this.supabase
        .from('salons')
        .select(`
          *,
          profiles!salons_created_by_fkey(*),
          staff_profiles(*),
          services(*),
          appointments(*)
        `)

      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value)
          }
        })
      }

      if (options?.orderBy) {
        if (typeof options.orderBy === 'string') {
          query = query.order(options.orderBy, { ascending: options.ascending ?? true })
        } else {
          query = query.order(options.orderBy.column, { 
            ascending: options.orderBy.ascending ?? true 
          })
        }
      }

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) throw error
      
      return { data: data as SalonWithDetails[], error: null }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }
}