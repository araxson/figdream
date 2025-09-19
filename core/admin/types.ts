/**
 * Admin Module Types
 */

import type { Database } from '@/types/database.types';

// Platform Overview Types
export interface AdminDashboardStats {
  totalUsers: number;
  totalSalons: number;
  totalAppointments: number;
  totalRevenue: number;
  activeSubscriptions: number;
  platformHealth: "healthy" | "warning" | "critical";
  monthlyGrowth: {
    users: number;
    salons: number;
    revenue: number;
  };
  systemMetrics: {
    uptime: number;
    responseTime: number;
    errorRate: number;
  };
}

// User Management Types
export interface PlatformUser {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  banned_until: string | null;
  deleted_at: string | null;
  is_super_admin: boolean;
  profile?: {
    full_name: string;
    avatar_url: string | null;
    phone: string | null;
  };
  roles: UserRole[];
  salon_associations: SalonAssociation[];
  last_activity: string | null;
  status: 'active' | 'inactive' | 'banned' | 'pending_verification';
}

export interface UserRole {
  id: string;
  role: string;
  salon_id: string | null;
  granted_at: string;
  granted_by: string;
  expires_at: string | null;
  is_active: boolean;
}

export interface SalonAssociation {
  salon_id: string;
  salon_name: string;
  role: string;
  status: 'active' | 'pending' | 'suspended';
}

// Salon Management Types
export interface PlatformSalon {
  id: string;
  name: string;
  slug: string;
  business_name: string | null;
  business_type: string;
  owner_id: string;
  email: string;
  phone: string;
  address: any;
  subscription_tier: string;
  subscription_expires_at: string | null;
  is_active: boolean;
  is_verified: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  verified_at: string | null;
  owner: {
    email: string;
    profile?: {
      full_name: string;
    };
  };
  stats: {
    total_bookings: number;
    total_revenue: number;
    rating_average: number;
    rating_count: number;
    employee_count: number;
  };
  subscription_status: 'active' | 'expired' | 'cancelled' | 'trial';
}

// System Health Types
export interface SystemHealthMetrics {
  timestamp: string;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  active_connections: number;
  response_time_avg: number;
  error_rate: number;
  uptime_percentage: number;
  database_status: 'healthy' | 'degraded' | 'down';
  storage_status: 'healthy' | 'degraded' | 'down';
  api_status: 'healthy' | 'degraded' | 'down';
}

// Audit Log Types
export interface AdminAuditLog {
  id: string;
  admin_user_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  old_values: any;
  new_values: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
  admin_user: {
    email: string;
    profile?: {
      full_name: string;
    };
  };
}

// Platform Analytics Types
export interface PlatformAnalytics {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date: string;
  metrics: {
    user_registrations: number;
    salon_registrations: number;
    appointments_booked: number;
    revenue_generated: number;
    subscription_upgrades: number;
    churn_rate: number;
    retention_rate: number;
  };
  growth_rates: {
    users: number;
    salons: number;
    revenue: number;
  };
  top_performing_salons: Array<{
    id: string;
    name: string;
    revenue: number;
    bookings: number;
  }>;
}

// Financial Management Types
export interface PlatformFinancials {
  total_revenue: number;
  monthly_recurring_revenue: number;
  average_revenue_per_salon: number;
  churn_rate: number;
  lifetime_value: number;
  commission_earned: number;
  outstanding_payments: number;
  subscription_breakdown: {
    free: number;
    basic: number;
    pro: number;
    enterprise: number;
  };
}

export interface SubscriptionOverview {
  id: string;
  salon_id: string;
  salon_name: string;
  customer_id: string;
  customer_email: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  trial_end: string | null;
  created_at: string;
  updated_at: string;
  monthly_revenue: number;
  next_billing_date: string | null;
}

// Content Management Types
export interface PlatformFAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order_index: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  view_count: number;
  helpful_count: number;
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'critical' | 'maintenance';
  target_audience: 'all' | 'salon_owners' | 'staff' | 'customers';
  is_active: boolean;
  starts_at: string;
  ends_at: string | null;
  created_by: string;
  created_at: string;
}

// Campaign Management Types
export interface PlatformCampaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push';
  subject: string;
  content: string;
  target_audience: 'all_users' | 'salon_owners' | 'customers' | 'custom';
  target_criteria: any;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
  scheduled_at: string | null;
  sent_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  stats: {
    total_recipients: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
}

// Settings and Configuration Types
export interface PlatformSettings {
  id: string;
  category: string;
  key: string;
  value: any;
  description: string;
  is_public: boolean;
  data_type: 'string' | 'number' | 'boolean' | 'json';
  validation_rules: any;
  updated_by: string;
  updated_at: string;
}

export interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  is_enabled: boolean;
  rollout_percentage: number;
  target_audience: 'all' | 'beta_users' | 'premium_salons' | 'specific_users';
  target_criteria: any;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Error Monitoring Types
export interface SystemError {
  id: string;
  error_type: string;
  message: string;
  stack_trace: string;
  request_path: string;
  request_method: string;
  user_id: string | null;
  salon_id: string | null;
  ip_address: string;
  user_agent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'investigating' | 'resolved' | 'ignored';
  resolved_by: string | null;
  resolved_at: string | null;
  first_occurred: string;
  last_occurred: string;
  occurrence_count: number;
  created_at: string;
}

// API Usage Types
export interface APIUsageMetrics {
  endpoint: string;
  method: string;
  total_requests: number;
  success_rate: number;
  avg_response_time: number;
  error_count: number;
  rate_limit_hits: number;
  unique_users: number;
  peak_usage_hour: string;
  date: string;
}

// Admin Filter and Sort Types
export interface AdminFilters {
  search?: string;
  status?: string;
  role?: string;
  salon_tier?: string;
  date_range?: {
    start: string;
    end: string;
  };
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Admin Action Types
export interface AdminAction {
  type: 'user_action' | 'salon_action' | 'system_action';
  action: string;
  target_id: string;
  reason?: string;
  notify_user?: boolean;
  scheduled_at?: string;
}

export interface BulkOperation {
  operation: 'activate' | 'deactivate' | 'delete' | 'update' | 'notify';
  target_ids: string[];
  parameters?: any;
  estimated_count: number;
  dry_run?: boolean;
}
