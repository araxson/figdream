import { Database } from '@/types/database.types';

export type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];

export type AppointmentDTO = {
  id: string;
  customer_id: string;
  salon_id: string;
  staff_id: string | null;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  total_price: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export interface RawAppointment {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  computed_total_price: number | null;
  computed_total_duration: number | null;
  staff_profiles?: { profiles?: unknown };
  customers?: unknown;
  salons?: unknown;
  appointment_services?: Array<{ services: unknown }>;
}

export interface AppointmentWithDetails {
  id: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  computed_total_price: number | null;
  computed_total_duration: number | null;
  staff?: {
    full_name: string | null;
    avatar_url?: string | null;
  };
  customer?: {
    first_name: string;
    last_name: string;
    phone?: string;
  };
  salon?: {
    name: string;
    address?: string;
  };
  services: Array<{
    name: string;
    price: number;
    duration_minutes: number;
  }>;
}