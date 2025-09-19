import type { Database } from '@/types/database.types';

// Platform admin specific types
export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];

// Salon management types for admin
export interface PlatformSalon {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country_code: string | null;
  website: string | null;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  business_hours: Record<string, any> | null;
  settings: Record<string, any> | null;
  is_active: boolean;
  subscription_tier: string | null;
  subscription_expires_at: string | null;
  created_at: string;
  updated_at: string | null;
  owner_id: string | null;
  time_zone: string | null;
  currency_code: string | null;
  tax_rate: number | null;
  booking_lead_time: number | null;
  cancellation_window: number | null;
  max_advance_booking_days: number | null;
  requires_deposit: boolean | null;
  deposit_percentage: number | null;
  allows_walk_ins: boolean | null;
  allows_online_booking: boolean | null;
  social_media: Record<string, any> | null;
  rating: number | null;
  review_count: number | null;
  features: string[] | null;
  payment_methods: string[] | null;
  cancellation_policy: string | null;
  booking_notes: string | null;
}

// Admin user management types
export interface AdminUser {
  id: string;
  email: string;
  email_verified: boolean;
  phone: string | null;
  phone_verified: boolean;
  created_at: string;
  updated_at: string | null;
  last_sign_in_at: string | null;
  app_metadata: Record<string, any>;
  user_metadata: Record<string, any>;
  is_active: boolean;
  role: string;
  profile?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    salon_id: string | null;
  };
}

// Admin dashboard metrics
export interface AdminDashboardMetrics {
  totalUsers: number;
  totalSalons: number;
  totalAppointments: number;
  totalRevenue: number;
  activeSubscriptions: number;
  newUsersThisMonth: number;
  newSalonsThisMonth: number;
  appointmentsThisMonth: number;
  revenueThisMonth: number;
  userGrowthRate: number;
  salonGrowthRate: number;
  appointmentGrowthRate: number;
  revenueGrowthRate: number;
  topSalons: Array<{
    id: string;
    name: string;
    appointmentCount: number;
    revenue: number;
  }>;
  platformHealth: {
    uptime: number;
    errorRate: number;
    avgResponseTime: number;
    activeUsers: number;
  };
}

// Admin audit log types
export interface AdminAuditLog {
  id: string;
  instance_id: string | null;
  client_id: string | null;
  event_message: string | null;
  event_type: string | null;
  ip_address: string | null;
  x_forwarded_for: string | null;
  user_agent: string | null;
  origin: string | null;
  referer: string | null;
  created_at: string;
  payload: Record<string, any> | null;
}

// Admin system health types
export interface SystemHealthMetrics {
  database: {
    status: 'healthy' | 'degraded' | 'down';
    connections: number;
    maxConnections: number;
    avgQueryTime: number;
    slowQueries: number;
  };
  api: {
    status: 'healthy' | 'degraded' | 'down';
    requestsPerMin: number;
    avgResponseTime: number;
    errorRate: number;
    p95ResponseTime: number;
  };
  storage: {
    status: 'healthy' | 'degraded' | 'down';
    usedSpace: number;
    totalSpace: number;
    percentUsed: number;
  };
  services: Array<{
    name: string;
    status: 'healthy' | 'degraded' | 'down';
    lastCheck: string;
    message?: string;
  }>;
}

// Admin subscription management types
export interface PlatformSubscription {
  id: string;
  salon_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired' | 'pending' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  cancel_at: string | null;
  cancelled_at: string | null;
  trial_start: string | null;
  trial_end: string | null;
  amount: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  created_at: string;
  updated_at: string | null;
  salon?: PlatformSalon;
}

// Admin permission types
export interface AdminPermission {
  id: string;
  user_id: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  granted_at: string;
  granted_by: string;
  expires_at: string | null;
}

// Admin notification types
export interface AdminNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  read_at: string | null;
  action_url: string | null;
  metadata: Record<string, any> | null;
}

// Admin report types
export interface AdminReport {
  id: string;
  name: string;
  type: 'users' | 'salons' | 'revenue' | 'appointments' | 'custom';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  start_date: string;
  end_date: string;
  data: Record<string, any>;
  generated_at: string;
  generated_by: string;
}

// Export all admin types
export type {
  Tables,
  Enums,
};