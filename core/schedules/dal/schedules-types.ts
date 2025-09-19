import type { Database } from "@/types/database.types";

// Database types for scheduling using existing public schema views
export type StaffSchedule = Database["public"]["Tables"]["staff_schedules"]["Row"];
export type StaffScheduleInsert = Database["public"]["Tables"]["staff_schedules"]["Insert"];
export type StaffScheduleUpdate = Database["public"]["Tables"]["staff_schedules"]["Update"];

export type BlockedTime = Database["public"]["Tables"]["blocked_times"]["Row"];
export type BlockedTimeInsert = Database["public"]["Tables"]["blocked_times"]["Insert"];
export type BlockedTimeUpdate = Database["public"]["Tables"]["blocked_times"]["Update"];

export type TimeOffRequest = Database["public"]["Tables"]["time_off_requests"]["Row"];
export type TimeOffRequestInsert = Database["public"]["Tables"]["time_off_requests"]["Insert"];
export type TimeOffRequestUpdate = Database["public"]["Tables"]["time_off_requests"]["Update"];

export type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
export type AppointmentService = Database["public"]["Tables"]["appointment_services"]["Row"];

// Enums
export type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
export type BlockType = "vacation" | "sick" | "training" | "meeting" | "break" | "maintenance" | "other";
export type TimeOffType = "vacation" | "sick" | "personal" | "training" | "other";
export type RequestStatus = "pending" | "approved" | "rejected" | "cancelled";

// Date and time types
export interface DateRange {
  start: Date;
  end: Date;
}

export interface TimeSlot {
  start: string; // HH:MM format
  end: string; // HH:MM format
}

export interface WorkingHours {
  day: DayOfWeek;
  start: string;
  end: string;
  breakStart?: string;
  breakEnd?: string;
  isWorking: boolean;
}

// Availability calculation types
export interface StaffAvailability {
  staffId: string;
  date: Date;
  availableSlots: AvailableSlot[];
  totalHours: number;
  bookedHours: number;
  breakHours: number;
  isAvailable: boolean;
  conflicts: ScheduleConflict[];
}

export interface AvailableSlot {
  start: Date;
  end: Date;
  duration: number; // minutes
  staffId: string;
  serviceIds?: string[]; // Services this staff can perform during this slot
  bufferBefore?: number; // Buffer time before in minutes
  bufferAfter?: number; // Buffer time after in minutes
  resourceId?: string; // Room/chair/station if applicable
}

// Conflict detection types
export interface ScheduleConflict {
  id: string;
  type: ConflictType;
  severity: ConflictSeverity;
  staffId: string;
  appointmentIds: string[];
  timeRange: DateRange;
  description: string;
  suggestedResolutions: ConflictResolution[];
  autoResolvable: boolean;
  createdAt: Date;
}

export type ConflictType =
  | "double_booking"
  | "staff_unavailable"
  | "service_duration_overlap"
  | "resource_conflict"
  | "travel_time_violation"
  | "break_time_conflict"
  | "working_hours_violation"
  | "time_off_conflict";

export type ConflictSeverity = "low" | "medium" | "high" | "critical";

export interface ConflictResolution {
  id: string;
  type: ResolutionType;
  description: string;
  impact: ResolutionImpact;
  estimatedCost?: number;
  autoApplicable: boolean;
  parameters: Record<string, any>;
}

export type ResolutionType =
  | "reschedule_appointment"
  | "reassign_staff"
  | "split_appointment"
  | "extend_working_hours"
  | "add_staff_break"
  | "cancel_appointment"
  | "book_different_resource";

export interface ResolutionImpact {
  staffAffected: string[];
  customersAffected: string[];
  revenueImpact: number;
  timeImpact: number; // minutes
  satisfactionScore: number; // 0-100
}

// Optimization types
export interface SchedulingCriteria {
  salonId: string;
  dateRange: DateRange;
  objectives: OptimizationObjective[];
  constraints: SchedulingConstraint[];
  preferences: SchedulingPreference[];
}

export interface OptimizationObjective {
  type: ObjectiveType;
  weight: number; // 0-1
  target?: number;
}

export type ObjectiveType =
  | "maximize_utilization"
  | "minimize_wait_time"
  | "maximize_revenue"
  | "balance_workload"
  | "minimize_travel_time"
  | "maximize_satisfaction";

export interface SchedulingConstraint {
  type: ConstraintType;
  staffId?: string;
  serviceId?: string;
  parameters: Record<string, any>;
  mandatory: boolean;
}

export type ConstraintType =
  | "working_hours"
  | "skill_requirements"
  | "customer_preferences"
  | "minimum_break_time"
  | "maximum_consecutive_hours"
  | "travel_time_buffer"
  | "setup_time";

export interface SchedulingPreference {
  type: PreferenceType;
  staffId?: string;
  customerId?: string;
  priority: number; // 1-10
  parameters: Record<string, any>;
}

export type PreferenceType =
  | "preferred_staff"
  | "preferred_time"
  | "avoid_peak_hours"
  | "group_services"
  | "minimize_downtime";

// Appointment scheduling types
export interface PendingAppointment {
  id: string;
  customerId: string;
  services: ServiceRequirement[];
  preferredDate?: Date;
  preferredTime?: TimeSlot;
  preferredStaffId?: string;
  flexibility: FlexibilityLevel;
  priority: number;
  requirements: AppointmentRequirement[];
}

export interface ServiceRequirement {
  serviceId: string;
  duration: number;
  staffRequirements: string[]; // Staff IDs who can perform this service
  setupTime?: number;
  cleanupTime?: number;
  resourceRequirements?: string[]; // Required resources
}

export type FlexibilityLevel = "none" | "low" | "medium" | "high";

export interface AppointmentRequirement {
  type: RequirementType;
  value: any;
  mandatory: boolean;
}

export type RequirementType =
  | "specific_staff"
  | "gender_preference"
  | "language_requirement"
  | "accessibility_needs"
  | "consecutive_services"
  | "same_staff_for_all";

// Optimization result types
export interface OptimizationResult {
  success: boolean;
  score: number; // 0-100
  improvements: OptimizationImprovement[];
  suggestedChanges: ScheduleChange[];
  metrics: OptimizationMetrics;
  conflicts: ScheduleConflict[];
  executionTime: number;
}

export interface OptimizationImprovement {
  type: ObjectiveType;
  currentValue: number;
  improvedValue: number;
  improvement: number;
  description: string;
}

export interface ScheduleChange {
  appointmentId: string;
  changeType: ChangeType;
  originalSlot: DateRange;
  newSlot: DateRange;
  originalStaffId?: string;
  newStaffId?: string;
  reason: string;
  impact: ResolutionImpact;
}

export type ChangeType = "reschedule" | "reassign" | "split" | "cancel" | "modify";

export interface OptimizationMetrics {
  utilizationRate: number; // 0-1
  averageWaitTime: number; // minutes
  revenueOptimization: number; // percentage improvement
  workloadBalance: number; // 0-1 (1 = perfectly balanced)
  customerSatisfaction: number; // 0-100
  conflictCount: number;
}

// Filter and query types
export interface ScheduleFilters {
  salonId?: string;
  staffIds?: string[];
  dateRange?: DateRange;
  includeConflicts?: boolean;
  includeAvailability?: boolean;
  conflictTypes?: ConflictType[];
  page?: number;
  limit?: number;
}

export interface AvailabilityQuery {
  salonId: string;
  staffIds?: string[];
  serviceIds?: string[];
  dateRange: DateRange;
  minDuration?: number; // Minimum slot duration in minutes
  bufferTime?: number; // Buffer time between appointments
  considerTravel?: boolean;
  includeAlternatives?: boolean;
}

// Response types
export interface ScheduleResponse {
  staffSchedules: StaffScheduleWithAvailability[];
  conflicts: ScheduleConflict[];
  metrics: ScheduleMetrics;
  total: number;
  page: number;
  limit: number;
}

export interface StaffScheduleWithAvailability extends StaffSchedule {
  availability: StaffAvailability;
  appointments: Appointment[];
  blockedTimes: BlockedTime[];
  workingHours: WorkingHours[];
}

export interface ScheduleMetrics {
  totalStaff: number;
  availableStaff: number;
  totalSlots: number;
  bookedSlots: number;
  utilizationRate: number;
  conflictCount: number;
  optimizationScore: number;
}

// Real-time sync types
export interface ScheduleUpdate {
  type: UpdateType;
  entityId: string;
  entityType: EntityType;
  changes: Record<string, any>;
  timestamp: Date;
  userId: string;
  salonId: string;
}

export type UpdateType = "create" | "update" | "delete" | "conflict_detected" | "conflict_resolved";
export type EntityType = "appointment" | "schedule" | "blocked_time" | "time_off" | "staff_availability";

export interface SyncStatus {
  lastSync: Date;
  pendingUpdates: number;
  conflictsPending: number;
  isOnline: boolean;
  syncErrors: SyncError[];
}

export interface SyncError {
  id: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
}

// Legacy compatibility
export interface schedulesData {
  id: string;
  name?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SchedulesFilter {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface schedulesResponse {
  data: schedulesData[];
  total: number;
  page: number;
  pageSize: number;
}
