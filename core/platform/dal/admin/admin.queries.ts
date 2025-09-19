/**
 * Admin Data Access Layer - Query Operations
 * Secure read operations with super admin authentication
 */

import { createClient } from '@/lib/supabase/server';
import {
  adaptUserData,
  adaptSalonData,
  isSelectQueryError
} from '@/core/shared/dal/database-adapters';
import type {
  AdminDashboardStats,
  PlatformUser,
  PlatformSalon,
  SystemHealthMetrics,
  AdminAuditLog,
  AdminFilters
} from '../types';

/**
 * Verify super admin access
 */
async function verifySuperAdmin() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Authentication required');
  }

  // Check if user is super admin via user_roles table
  const { data: userRole, error: userError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (userError || userRole?.role !== 'super_admin') {
    throw new Error('Super admin access required');
  }

  return user;
}

/**
 * Log admin action for audit trail
 * Note: Audit logging disabled until audit table is available
 */
async function logAdminAction(
  adminUserId: string,
  action: string,
  targetType: string,
  targetId?: string,
  details?: any
) {
  // TODO: Implement audit logging when admin_audit_logs table is available
  console.log('Admin action:', {
    adminUserId,
    action,
    targetType,
    targetId,
    details,
    timestamp: new Date().toISOString()
  });
}

/**
 * Get comprehensive dashboard statistics
 */
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const adminUser = await verifySuperAdmin();
  const supabase = await createClient();

  try {
    // Get total user count
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get salon count
    const { count: totalSalons } = await supabase
      .from('salons')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get appointment count (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: totalAppointments } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    // Get revenue (last 30 days) - appointments don't have total_amount
    // Use a placeholder for now
    const totalRevenue = 0; // TODO: Join with billing table when available

    // Get active subscriptions - counting active salons for now
    const { count: activeSubscriptions } = await supabase
      .from('salons')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Calculate growth rates (comparing to previous 30 days)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const { count: previousUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', thirtyDaysAgo.toISOString())
      .gte('created_at', sixtyDaysAgo.toISOString());

    const { count: previousSalons } = await supabase
      .from('salons')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', thirtyDaysAgo.toISOString())
      .gte('created_at', sixtyDaysAgo.toISOString());

    // Mock system metrics (would integrate with monitoring service)
    const systemMetrics = {
      uptime: 99.9,
      responseTime: 250,
      errorRate: 0.01
    };

    const monthlyGrowth = {
      users: previousUsers ? ((totalUsers || 0) - previousUsers) / previousUsers * 100 : 0,
      salons: previousSalons ? ((totalSalons || 0) - previousSalons) / previousSalons * 100 : 0,
      revenue: 15.5 // This would be calculated from revenue data
    };

    // Determine platform health
    let platformHealth: "healthy" | "warning" | "critical" = "healthy";
    if (systemMetrics.errorRate > 0.05 || systemMetrics.responseTime > 1000) {
      platformHealth = "warning";
    }
    if (systemMetrics.errorRate > 0.1 || systemMetrics.responseTime > 2000) {
      platformHealth = "critical";
    }

    await logAdminAction(
      adminUser.id,
      'view_dashboard_stats',
      'admin_dashboard'
    );

    return {
      totalUsers: totalUsers || 0,
      totalSalons: totalSalons || 0,
      totalAppointments: totalAppointments || 0,
      totalRevenue,
      activeSubscriptions: activeSubscriptions || 0,
      platformHealth,
      monthlyGrowth,
      systemMetrics
    };

  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    throw new Error('Failed to fetch dashboard statistics');
  }
}

/**
 * Get platform users with filtering and pagination
 */
export async function getPlatformUsers(filters: AdminFilters = {}): Promise<{
  users: PlatformUser[];
  totalCount: number;
  totalPages: number;
}> {
  const adminUser = await verifySuperAdmin();
  const supabase = await createClient();

  try {
    const limit = filters.limit || 20;
    const offset = ((filters.page || 1) - 1) * limit;

    let query = supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        created_at,
        updated_at,
        is_active,
        last_sign_in_at,
        user_roles!inner(role)
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.search) {
      query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    if (filters.role) {
      query = query.eq('user_roles.role', filters.role);
    }

    if (filters.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    const { data: usersData, error: usersError } = await query;

    if (usersError) {
      if (isSelectQueryError(usersError)) {
        console.error('User query error:', usersError);
        throw new Error('Database query failed');
      }
      throw usersError;
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    if (filters.search) {
      countQuery = countQuery.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    const { count: totalCount } = await countQuery;

    const users = usersData?.map(adaptUserData) || [];

    await logAdminAction(
      adminUser.id,
      'view_platform_users',
      'platform_users',
      undefined,
      filters
    );

    return {
      users,
      totalCount: totalCount || 0,
      totalPages: Math.ceil((totalCount || 0) / limit)
    };

  } catch (error) {
    console.error('Error fetching platform users:', error);
    throw new Error('Failed to fetch platform users');
  }
}

/**
 * Get platform salons with filtering and pagination
 */
export async function getPlatformSalons(filters: AdminFilters = {}): Promise<{
  salons: PlatformSalon[];
  totalCount: number;
  totalPages: number;
}> {
  const adminUser = await verifySuperAdmin();
  const supabase = await createClient();

  try {
    const limit = filters.limit || 20;
    const offset = ((filters.page || 1) - 1) * limit;

    let query = supabase
      .from('salons')
      .select(`
        id,
        name,
        description,
        address,
        phone,
        email,
        website,
        is_active,
        created_at,
        updated_at,
        owner_id,
        subscription_status,
        profiles!salons_owner_id_fkey(
          full_name,
          email
        )
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    if (filters.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    if (filters.subscriptionStatus) {
      query = query.eq('subscription_status', filters.subscriptionStatus);
    }

    const { data: salonsData, error: salonsError } = await query;

    if (salonsError) {
      if (isSelectQueryError(salonsError)) {
        console.error('Salon query error:', salonsError);
        throw new Error('Database query failed');
      }
      throw salonsError;
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('salons')
      .select('id', { count: 'exact', head: true });

    if (filters.search) {
      countQuery = countQuery.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    const { count: totalCount } = await countQuery;

    const salons = salonsData?.map(adaptSalonData) || [];

    await logAdminAction(
      adminUser.id,
      'view_platform_salons',
      'platform_salons',
      undefined,
      filters
    );

    return {
      salons,
      totalCount: totalCount || 0,
      totalPages: Math.ceil((totalCount || 0) / limit)
    };

  } catch (error) {
    console.error('Error fetching platform salons:', error);
    throw new Error('Failed to fetch platform salons');
  }
}

/**
 * Get system health metrics
 */
export async function getSystemHealthMetrics(): Promise<SystemHealthMetrics> {
  const adminUser = await verifySuperAdmin();

  // Mock implementation - in production, integrate with monitoring services
  const metrics: SystemHealthMetrics = {
    timestamp: new Date().toISOString(),
    cpu_usage: 23.7,
    memory_usage: 68.5,
    disk_usage: 45.2,
    active_connections: 1247,
    response_time_avg: 185,
    error_rate: 0.02,
    uptime_percentage: 99.95,
    database_status: 'healthy',
    storage_status: 'healthy',
    api_status: 'healthy'
  };

  await logAdminAction(
    adminUser.id,
    'view_system_health',
    'system_metrics'
  );

  return metrics;
}

/**
 * Get admin audit logs with filtering and pagination
 * Note: Returns empty results until audit table is available
 */
export async function getAdminAuditLogs(filters: AdminFilters = {}): Promise<{
  logs: AdminAuditLog[];
  totalCount: number;
  totalPages: number;
}> {
  const adminUser = await verifySuperAdmin();

  // TODO: Implement when admin_audit_logs table is available
  console.log('Audit logs requested with filters:', filters);

  return {
    logs: [],
    totalCount: 0,
    totalPages: 0
  };
}

// Export shared utilities
export { verifySuperAdmin, logAdminAction };