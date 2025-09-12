export interface Appointment {
  id: string
  start_time: string
  end_time: string
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  computed_total_price: number | null
  computed_total_duration: number | null
  staff?: {
    full_name: string | null
    avatar_url?: string | null
  }
  customer?: {
    first_name: string
    last_name: string
    phone?: string
  }
  salon?: {
    name: string
    address?: string
  }
  services?: Array<{
    name: string
    price: number
    duration_minutes: number
  }>
}