export interface WalkInFormData {
  customer_name: string
  customer_email: string
  customer_phone: string
  staff_id: string
  payment_method: string
  collect_payment_now: boolean
}

export interface Service {
  id: string
  name: string
  price: number
  duration_minutes: number
}

export interface StaffMember {
  id: string
  profiles?: {
    first_name: string | null
    last_name: string | null
  }
}

export interface WalkInFormProps {
  salonId: string
  staffMembers?: StaffMember[]
  services?: Service[]
}