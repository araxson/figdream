// Staff Types - Barrel Exports
// This module exports all TypeScript types for the staff domain

// Re-export database types for staff domain
export type {
  StaffProfile,
  StaffProfileInsert,
  StaffProfileUpdate,
  StaffSchedule,
  StaffScheduleInsert,
  StaffScheduleUpdate,
  TimeOffRequest,
  TimeOffRequestInsert,
  TimeOffRequestUpdate,
  StaffService,
  StaffServiceInsert,
  StaffServiceUpdate,
  StaffPerformance,
  StaffPerformanceInsert,
  StaffPerformanceUpdate,
  StaffStatus,
  ProficiencyLevel,
  DayOfWeek,
  TimeOffStatus,
} from '../dal/staff.types';

// Domain-specific enums for UI (not in database)
export enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  FREELANCE = 'freelance'
}

export enum TimeOffType {
  VACATION = 'vacation',
  SICK = 'sick',
  PERSONAL = 'personal',
  MATERNITY = 'maternity',
  PATERNITY = 'paternity',
  BEREAVEMENT = 'bereavement',
  OTHER = 'other'
}

// Use StaffProfileWithRelations from dal/staff.types for consistency
export type { StaffProfileWithRelations as StaffProfileWithDetails } from '../dal/staff.types';

export interface StaffScheduleTemplate {
  id: string;
  staff_id: string;
  name: string;
  schedule: WeeklySchedule;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface WeeklySchedule {
  [key in DayOfWeek]?: DaySchedule;
}

export interface DaySchedule {
  start_time: string;
  end_time: string;
  breaks?: ScheduleBreak[];
  is_working: boolean;
}

export interface ScheduleBreak {
  start_time: string;
  end_time: string;
  type: 'lunch' | 'short' | 'other';
}

export interface StaffAttendance {
  id: string;
  staff_id: string;
  date: string;
  clock_in?: string;
  clock_out?: string;
  breaks: AttendanceBreak[];
  total_hours: number;
  overtime_hours: number;
  status: 'present' | 'absent' | 'late' | 'early_leave' | 'holiday';
  notes?: string;
}

export interface AttendanceBreak {
  start_time: string;
  end_time: string;
  duration_minutes: number;
}

export interface CommissionRule {
  id: string;
  salon_id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'tiered';
  base_rate: number;
  tiers?: CommissionTier[];
  service_overrides?: Record<string, number>;
  effective_from: string;
  effective_until?: string;
  is_active: boolean;
}

export interface CommissionTier {
  min_revenue: number;
  max_revenue?: number;
  rate: number;
}

export interface StaffEarnings {
  id: string;
  staff_id: string;
  period_start: string;
  period_end: string;
  base_salary?: number;
  commission_earned: number;
  tips_earned: number;
  bonuses: Bonus[];
  deductions: Deduction[];
  gross_earnings: number;
  net_earnings: number;
  payment_status: 'pending' | 'processing' | 'paid' | 'failed';
  payment_date?: string;
  payment_method?: string;
}

export interface Bonus {
  type: string;
  amount: number;
  description: string;
}

export interface Deduction {
  type: string;
  amount: number;
  description: string;
}

export interface StaffDocument {
  id: string;
  staff_id: string;
  type: 'license' | 'certification' | 'contract' | 'id' | 'other';
  name: string;
  file_url: string;
  expiry_date?: string;
  verified: boolean;
  verified_by?: string;
  verified_at?: string;
  uploaded_at: string;
}

export interface PerformanceGoal {
  id: string;
  staff_id: string;
  title: string;
  description: string;
  metric_type: 'appointments' | 'revenue' | 'satisfaction' | 'efficiency';
  target_value: number;
  current_value: number;
  period_start: string;
  period_end: string;
  status: 'not_started' | 'in_progress' | 'achieved' | 'missed';
  reward?: string;
}

export interface PerformanceReview {
  id: string;
  staff_id: string;
  reviewer_id: string;
  review_date: string;
  period_start: string;
  period_end: string;
  overall_rating: number;
  categories: ReviewCategory[];
  strengths: string;
  areas_for_improvement: string;
  goals: string[];
  comments: string;
  staff_comments?: string;
  acknowledged: boolean;
  acknowledged_at?: string;
}

export interface ReviewCategory {
  name: string;
  rating: number;
  comments?: string;
}

export interface ScheduleSwapRequest {
  id: string;
  requester_id: string;
  target_id: string;
  requester_date: string;
  target_date: string;
  status: 'pending' | 'approved' | 'denied' | 'cancelled';
  reason: string;
  approved_by?: string;
  approved_at?: string;
  denial_reason?: string;
  created_at: string;
}

export interface StaffNotification {
  id: string;
  staff_id: string;
  type: 'schedule_change' | 'time_off_response' | 'new_appointment' | 'review' | 'announcement';
  title: string;
  message: string;
  read: boolean;
  action_url?: string;
  created_at: string;
}

// Form DTOs
export interface CreateStaffProfileDTO {
  user_id: string;
  salon_id: string;
  title: string;
  bio?: string;
  experience_years?: number;
  specializations?: string[];
  certifications?: any[];
  languages?: string[];
  commission_rate?: number;
  hourly_rate?: number;
  employment_type: EmploymentType;
  hired_at: string;
  profile_image_url?: string;
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface UpdateStaffProfileDTO {
  title?: string;
  bio?: string;
  experience_years?: number;
  specializations?: string[];
  certifications?: any[];
  languages?: string[];
  commission_rate?: number;
  hourly_rate?: number;
  status?: StaffStatus;
  profile_image_url?: string;
  is_bookable?: boolean;
  is_featured?: boolean;
}

export interface CreateScheduleDTO {
  staff_id: string;
  salon_id: string;
  schedule: WeeklySchedule;
  effective_from: string;
  effective_until?: string;
}

export interface CreateTimeOffRequestDTO {
  staff_id: string;
  salon_id: string;
  start_date: string;
  end_date: string;
  type: TimeOffType;
  reason: string;
  notify_customers?: boolean;
  auto_reschedule?: boolean;
}

export interface ClockInOutDTO {
  staff_id: string;
  timestamp: string;
  type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end';
  location?: {
    latitude: number;
    longitude: number;
  };
  notes?: string;
}

// Filter types
export interface StaffFilters {
  salon_id?: string;
  status?: StaffStatus[];
  employment_type?: EmploymentType[];
  is_bookable?: boolean;
  is_featured?: boolean;
  search?: string;
  services?: string[];
  min_rating?: number;
  availability?: {
    date: string;
    time: string;
  };
}

export interface AttendanceFilters {
  staff_id?: string;
  salon_id?: string;
  date_from?: string;
  date_to?: string;
  status?: string[];
}

export interface EarningsFilters {
  staff_id?: string;
  salon_id?: string;
  period_from?: string;
  period_to?: string;
  payment_status?: string[];
  min_amount?: number;
  max_amount?: number;
}

// Analytics types
export interface StaffAnalytics {
  total_staff: number;
  active_staff: number;
  on_break: number;
  off_duty: number;
  average_rating: number;
  total_appointments_today: number;
  total_revenue_today: number;
  utilization_rate: number;
  average_service_time: number;
  top_performers: StaffPerformanceSummary[];
}

export interface StaffPerformanceSummary {
  staff_id: string;
  name: string;
  avatar_url?: string;
  total_appointments: number;
  completion_rate: number;
  average_rating: number;
  revenue_generated: number;
  utilization_rate: number;
  rank: number;
}

export interface PayrollSummary {
  period: string;
  total_base_salary: number;
  total_commission: number;
  total_tips: number;
  total_bonuses: number;
  total_deductions: number;
  total_gross: number;
  total_net: number;
  staff_count: number;
  payment_status: {
    paid: number;
    pending: number;
    processing: number;
    failed: number;
  };
}

// Component props types
export * from './component-props.types';

// Schedule types
export * from './schedule.types';

// Time-off types
export * from './time-off.types';