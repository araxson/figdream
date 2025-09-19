/**
 * Staff Component Props Types
 * UI component prop types for staff domain components
 */

// Re-export DAL types for component use
export type {
  StaffProfileWithDetails as StaffWithDetails,
  StaffFilters,
  StaffSchedule,
} from './index';

// Component Props Types
export type StaffScheduleData = StaffSchedule;

export interface StaffListProps {
  staff: StaffWithDetails[];
  onView?: (staff: StaffWithDetails) => void;
  onEdit?: (staff: StaffWithDetails) => void;
  onActivate?: (staff: StaffWithDetails) => void;
  onDeactivate?: (staff: StaffWithDetails) => void;
  onDelete?: (staff: StaffWithDetails) => void;
}

export interface StaffFormProps {
  salonId: string;
  staff?: StaffWithDetails;
  onSubmit?: (staffId: string) => void;
  onCancel?: () => void;
}

export interface StaffDetailProps {
  staff: StaffWithDetails;
  onEdit?: () => void;
  onActivate?: () => void;
  onDeactivate?: () => void;
  onManageSchedule?: () => void;
  onManageServices?: () => void;
}

export interface StaffScheduleFormProps {
  staffId: string;
  schedules?: StaffScheduleData[];
  onSubmit?: () => void;
  onCancel?: () => void;
}

export interface StaffCardProps {
  staff: StaffWithDetails;
  onView?: () => void;
  onBook?: () => void;
}

export interface StaffFiltersProps {
  filters: StaffFilters;
  onFiltersChange: (filters: StaffFilters) => void;
}

export interface StaffPerformanceProps {
  staffId: string;
  startDate?: string;
  endDate?: string;
}

export interface StaffAvailabilityCalendarProps {
  staffId: string;
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
  onSlotClick?: (slot: { start: string; end: string }) => void;
}

export interface StaffServicesManagerProps {
  staffId: string;
  salonId: string;
  onUpdate?: () => void;
}