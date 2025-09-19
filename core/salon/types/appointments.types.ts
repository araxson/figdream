// Re-export all appointment types from DAL
export {
  type Appointment,
  type AppointmentInsert,
  type AppointmentUpdate,
  type AppointmentService,
  type AppointmentServiceInsert,
  type AppointmentServiceUpdate,
  type AppointmentStatus,
  type PaymentStatus,
  type AppointmentWithRelations,
  type AppointmentFilters,
  type AppointmentStats,
  type AppointmentListResponse,
  type AvailableSlot,
} from "../dal/salon.types";

// Import for component types
import type {
  AppointmentWithRelations as AppointmentWithServices,
  AppointmentFilters,
} from "../dal/salon.types";

// Component Props Types
export interface AppointmentsListProps {
  appointments: AppointmentWithServices[];
  onView?: (appointment: AppointmentWithServices) => void;
  onEdit?: (appointment: AppointmentWithServices) => void;
  onCancel?: (appointment: AppointmentWithServices) => void;
  onCheckIn?: (appointment: AppointmentWithServices) => void;
  onComplete?: (appointment: AppointmentWithServices) => void;
}

export interface AppointmentFormProps {
  salonId: string;
  customerId?: string;
  staffId?: string;
  serviceIds?: string[];
  onSubmit?: (appointmentId: string) => void;
  onCancel?: () => void;
}

export interface AppointmentDetailProps {
  appointment: AppointmentWithServices;
  onEdit?: () => void;
  onCancel?: () => void;
  onCheckIn?: () => void;
  onComplete?: () => void;
  onNoShow?: () => void;
}

export interface AppointmentCalendarProps {
  appointments: AppointmentWithServices[];
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
  onAppointmentClick?: (appointment: AppointmentWithServices) => void;
  onSlotClick?: (date: Date, time: string) => void;
}

export interface AppointmentFiltersProps {
  filters: AppointmentFilters;
  onFiltersChange: (filters: AppointmentFilters) => void;
}

export interface AppointmentStatsProps {
  salonId?: string;
  startDate?: string;
  endDate?: string;
}
