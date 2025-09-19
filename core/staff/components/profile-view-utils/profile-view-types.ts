import type { StaffProfile } from "../../dal/staff-types"

export interface StaffProfileViewProps {
  staff: StaffProfile
  onClose?: () => void
  onUpdate?: (updates: Partial<StaffProfile>) => Promise<void>
  showActions?: boolean
}

export interface ProfileFormData {
  display_name: string
  first_name: string
  last_name: string
  title: string
  email: string
  phone: string
  bio: string
  experience_years: number
  specializations: string[]
  languages: string[]
  commission_rate: number
  hourly_rate: number
  employment_type: "full_time" | "part_time" | "contractor"
  is_bookable: boolean
  is_featured: boolean
}

export interface PerformanceData {
  appointments: {
    total: number
    completed: number
    cancelled: number
    noShow: number
  }
  revenue: {
    total: number
    services: number
    tips: number
    growth: number
  }
  ratings: {
    average: number
    total: number
    distribution: Array<{
      stars: number
      count: number
    }>
  }
  utilization: {
    current: number
    target: number
    trend: "up" | "down" | "stable"
  }
}

export interface FavoriteCustomer {
  id: string
  name: string
  visits: number
  lastVisit: string
}

export interface Review {
  id: string
  customer: string
  rating: number
  comment: string
  date: string
}

export interface ProfileSectionProps {
  staff: StaffProfile
  isEditing: boolean
  formData: ProfileFormData
  onFormDataChange: (data: ProfileFormData) => void
}

export interface ProfileHeaderProps extends ProfileSectionProps {
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onClose?: () => void
  showActions: boolean
}