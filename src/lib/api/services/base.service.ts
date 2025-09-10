import { SupabaseClient, RealtimePostgresChangesPayload, PostgrestError } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'
import { createClient } from '@/lib/supabase/client'

export type Tables = Database['public']['Tables']
export type TableName = keyof Tables

type TableRow<T extends TableName> = Tables[T]['Row']
type TableInsert<T extends TableName> = Tables[T]['Insert']
type TableUpdate<T extends TableName> = Tables[T]['Update']

export interface QueryOptions {
  limit?: number
  offset?: number
  orderBy?: {
    column: string
    ascending?: boolean
  } | string
  ascending?: boolean
  filters?: Record<string, unknown>
}

export interface ServiceResponse<T> {
  data: T | null
  error: Error | null
  count?: number
}

export abstract class BaseService<T extends TableName> {
  protected tableName: T
  protected supabase: SupabaseClient<Database>

  constructor(tableName: T, supabase?: SupabaseClient<Database>) {
    this.tableName = tableName
    this.supabase = supabase || createClient()
  }

  async getAll(options: QueryOptions = {}): Promise<ServiceResponse<TableRow<T>[]>> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact' })

      if (options.limit) {
        query = query.limit(options.limit)
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }

      if (options.orderBy) {
        if (typeof options.orderBy === 'string') {
          query = query.order(options.orderBy, { ascending: options.ascending ?? false })
        } else {
          query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? false })
        }
      }

      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            // TypeScript cannot infer column names dynamically from generic table type
            // The runtime safety is ensured by Supabase's error handling
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            query = (query as any).eq(key, value)
          }
        })
      }

      const { data, error, count } = await query

      if (error) throw error

      return {
        data: (data as unknown as TableRow<T>[] | null) || null,
        error: null,
        count: count ?? undefined
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error,
        count: undefined
      }
    }
  }

  async getById(id: string): Promise<ServiceResponse<TableRow<T>>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .eq('id' as any, id)
        .single()

      if (error) throw error

      return {
        data: (data as unknown as TableRow<T> | null) || null,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  async create(payload: TableInsert<T>): Promise<ServiceResponse<TableRow<T>>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert([payload] as any)
        .select()
        .single()

      if (error) throw error

      return {
        data: (data as unknown as TableRow<T> | null) || null,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  async update(id: string, payload: TableUpdate<T>): Promise<ServiceResponse<TableRow<T>>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update(payload as any)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .eq('id' as any, id)
        .select()
        .single()

      if (error) throw error

      return {
        data: (data as unknown as TableRow<T> | null) || null,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  async delete(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .eq('id' as any, id)

      if (error) throw error

      return {
        data: true,
        error: null
      }
    } catch (error) {
      return {
        data: false,
        error: error as Error
      }
    }
  }

  async bulkCreate(payload: TableInsert<T>[]): Promise<ServiceResponse<TableRow<T>[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert(payload as any)
        .select()

      if (error) throw error

      return {
        data: (data as unknown as TableRow<T>[] | null) || null,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  async bulkUpdate(updates: { id: string; payload: TableUpdate<T> }[]): Promise<ServiceResponse<TableRow<T>[]>> {
    try {
      const results = await Promise.all(
        updates.map(({ id, payload }) => this.update(id, payload))
      )

      const hasError = results.some(r => r.error)
      const data = results.filter(r => r.data).map(r => r.data!)

      if (hasError) {
        const firstError = results.find(r => r.error)?.error
        throw firstError
      }

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

  async bulkDelete(ids: string[]): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .in('id' as any, ids)

      if (error) throw error

      return {
        data: true,
        error: null
      }
    } catch (error) {
      return {
        data: false,
        error: error as Error
      }
    }
  }

  subscribeToChanges(
    callback: (payload: RealtimePostgresChangesPayload<TableRow<T>>) => void,
    events: ('INSERT' | 'UPDATE' | 'DELETE')[] = ['INSERT', 'UPDATE', 'DELETE']
  ) {
    const channel = this.supabase
      .channel(`${this.tableName}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.tableName as string,
        },
        (payload) => {
          if (events.includes(payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE')) {
            callback(payload as RealtimePostgresChangesPayload<TableRow<T>>)
          }
        }
      )
      .subscribe()

    return () => {
      this.supabase.removeChannel(channel)
    }
  }

  async search(searchTerm: string, columns: string[]): Promise<ServiceResponse<TableRow<T>[]>> {
    try {
      const searchConditions = columns
        .map(col => `${col}.ilike.%${searchTerm}%`)
        .join(',')

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .or(searchConditions)

      if (error) throw error

      return {
        data: (data as unknown as TableRow<T>[] | null) || null,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  async count(filters?: Record<string, unknown>): Promise<ServiceResponse<number>> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            // TypeScript cannot infer column names dynamically from generic table type
            // The runtime safety is ensured by Supabase's error handling
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            query = (query as any).eq(key, value)
          }
        })
      }

      const { count, error } = await query

      if (error) throw error

      return {
        data: count ?? 0,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  async exists(id: string): Promise<boolean> {
    const { data } = await this.count({ id } as Record<string, unknown>)
    return (data ?? 0) > 0
  }

  protected handleError(error: unknown): ServiceResponse<null> {
    if (error instanceof Error) {
      return {
        data: null,
        error: error
      }
    }
    
    const postgrestError = error as PostgrestError
    if (postgrestError?.message) {
      return {
        data: null,
        error: new Error(postgrestError.message)
      }
    }
    
    return {
      data: null,
      error: new Error('An unknown error occurred')
    }
  }
}