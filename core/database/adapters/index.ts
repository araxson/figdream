/**
 * Database Adapter Layer
 * Bridges schema mismatches and provides compatibility layer
 */

import { createServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';

// Type definitions for adapter responses
export interface UserAdapter {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  created_at: string;
}

export interface SubscriptionAdapter {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'past_due';
  current_period_end: string;
}

export interface RevenueMetrics {
  total_revenue: number;
  monthly_revenue: number;
  average_order_value: number;
  growth_rate: number;
}

/**
 * Database adapters for handling schema mismatches
 */
export const databaseAdapters = {
  /**
   * User adapter - maps auth.users references to profiles table
   */
  users: {
    async findById(id: string): Promise<UserAdapter | null> {
      const supabase = createServerClient();
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (!data) return null;

      return {
        id: data.id,
        email: data.email || '',
        full_name: data.full_name,
        role: data.role,
        created_at: data.created_at
      };
    },

    async findAll(filters?: { role?: string }): Promise<UserAdapter[]> {
      const supabase = createServerClient();
      let query = supabase.from('profiles').select('*');

      if (filters?.role) {
        query = query.eq('role', filters.role);
      }

      const { data } = await query;

      return (data || []).map(profile => ({
        id: profile.id,
        email: profile.email || '',
        full_name: profile.full_name,
        role: profile.role,
        created_at: profile.created_at
      }));
    },

    async findByEmail(email: string): Promise<UserAdapter | null> {
      const supabase = createServerClient();
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (!data) return null;

      return {
        id: data.id,
        email: data.email || '',
        full_name: data.full_name,
        role: data.role,
        created_at: data.created_at
      };
    }
  },

  /**
   * Subscription adapter - provides virtual subscription data
   */
  subscriptions: {
    async findActive(userId: string): Promise<SubscriptionAdapter[]> {
      // Virtual implementation until subscriptions table exists
      // Could be mapped to a different table or external service
      return [];
    },

    async findById(id: string): Promise<SubscriptionAdapter | null> {
      // Virtual implementation
      return null;
    },

    async create(data: Partial<SubscriptionAdapter>): Promise<SubscriptionAdapter> {
      // Virtual implementation
      return {
        id: crypto.randomUUID(),
        user_id: data.user_id || '',
        plan_id: data.plan_id || 'basic',
        status: 'active',
        current_period_end: new Date().toISOString()
      };
    }
  },

  /**
   * Revenue analytics adapter - calculates metrics from existing tables
   */
  revenue_analytics: {
    async getMetrics(salonId: string, period?: { start: Date; end: Date }): Promise<RevenueMetrics> {
      const supabase = createServerClient();

      // Calculate from appointments table
      const { data: appointments } = await supabase
        .from('appointments')
        .select('total_amount, created_at')
        .eq('salon_id', salonId)
        .eq('status', 'completed');

      const total = appointments?.reduce((sum, apt) => sum + (apt.total_amount || 0), 0) || 0;
      const count = appointments?.length || 0;

      return {
        total_revenue: total,
        monthly_revenue: total / 12, // Simplified calculation
        average_order_value: count > 0 ? total / count : 0,
        growth_rate: 0 // Would need historical data
      };
    },

    async getDailyRevenue(salonId: string, days: number = 30): Promise<Array<{ date: string; amount: number }>> {
      const supabase = createServerClient();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data } = await supabase
        .from('appointments')
        .select('total_amount, created_at')
        .eq('salon_id', salonId)
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString());

      // Group by date
      const revenueByDate = new Map<string, number>();

      data?.forEach(apt => {
        const date = new Date(apt.created_at).toISOString().split('T')[0];
        const current = revenueByDate.get(date) || 0;
        revenueByDate.set(date, current + (apt.total_amount || 0));
      });

      return Array.from(revenueByDate.entries()).map(([date, amount]) => ({
        date,
        amount
      }));
    }
  },

  /**
   * Platform subscriptions adapter
   */
  platform_subscriptions: {
    async findBySalonId(salonId: string): Promise<any> {
      // Virtual implementation - could map to settings or external billing
      return {
        salon_id: salonId,
        plan: 'professional',
        status: 'active',
        features: ['unlimited_bookings', 'sms_notifications', 'analytics']
      };
    }
  },

  /**
   * Error logs adapter
   */
  error_logs: {
    async create(error: any): Promise<void> {
      console.error('Error logged:', error);
      // Could send to external error tracking service
    },

    async findRecent(limit: number = 100): Promise<any[]> {
      // Virtual implementation
      return [];
    }
  }
};

/**
 * Helper function to get table or adapter
 */
export function getTable(tableName: string) {
  const supabase = createServerClient();

  // Map common table references to adapters
  const adapterMap: Record<string, any> = {
    'auth.users': databaseAdapters.users,
    'users': databaseAdapters.users,
    'subscriptions': databaseAdapters.subscriptions,
    'revenue_analytics': databaseAdapters.revenue_analytics,
    'platform_subscriptions': databaseAdapters.platform_subscriptions,
    'error_logs': databaseAdapters.error_logs
  };

  return adapterMap[tableName] || supabase.from(tableName as keyof Database['public']['Tables']);
}

/**
 * Query builder with adapter support
 */
export class AdaptedQueryBuilder {
  private tableName: string;
  private filters: Record<string, any> = {};

  constructor(table: string) {
    this.tableName = table;
  }

  eq(column: string, value: any) {
    this.filters[column] = value;
    return this;
  }

  async select(columns?: string) {
    const adapter = getTable(this.tableName);

    // If it's an adapter, use appropriate method
    if (adapter.findAll) {
      return { data: await adapter.findAll(this.filters), error: null };
    }

    // Otherwise use Supabase query
    let query = adapter.select(columns || '*');

    Object.entries(this.filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    return await query;
  }

  async single() {
    const adapter = getTable(this.tableName);

    if (adapter.findById && this.filters.id) {
      return { data: await adapter.findById(this.filters.id), error: null };
    }

    const result = await this.select();
    return {
      data: result.data?.[0] || null,
      error: result.error
    };
  }
}

/**
 * Create adapted Supabase client
 */
export function createAdaptedClient() {
  const supabase = createServerClient();

  return {
    ...supabase,
    from: (table: string) => new AdaptedQueryBuilder(table)
  };
}