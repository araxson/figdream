import { BaseService, ServiceResponse, QueryOptions } from './base.service'
import { Database } from '@/types/database.types'

export type ReviewWithDetails = Database['public']['Tables']['reviews']['Row'] & {
  customers?: Database['public']['Tables']['customers']['Row']
  salons?: Database['public']['Tables']['salons']['Row']
  staff_profiles?: Database['public']['Tables']['staff_profiles']['Row']
  services?: Database['public']['Tables']['services']['Row']
}

export class ReviewService extends BaseService<'reviews'> {
  constructor() {
    super('reviews')
  }

  async getWithDetails(id: string): Promise<ServiceResponse<ReviewWithDetails>> {
    try {
      const { data, error } = await this.supabase
        .from('reviews')
        .select(`
          *,
          customers(*),
          salons(*),
          staff_profiles(*),
          services(*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      
      return { data: data as unknown as ReviewWithDetails, error: null }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  async listWithDetails(options?: QueryOptions): Promise<ServiceResponse<ReviewWithDetails[]>> {
    try {
      let query = this.supabase
        .from('reviews')
        .select(`
          *,
          customers(*),
          salons(*),
          staff_profiles(*),
          services(*)
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
      
      return { data: data as unknown as ReviewWithDetails[], error: null }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  async getAverageRating(salonId: string): Promise<ServiceResponse<number>> {
    try {
      const { data, error } = await this.supabase
        .from('reviews')
        .select('rating')
        .eq('salon_id', salonId)

      if (error) throw error
      
      const average = data.length > 0 
        ? data.reduce((sum: number, review) => sum + review.rating, 0) / data.length 
        : 0

      return { data: average, error: null }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }
}