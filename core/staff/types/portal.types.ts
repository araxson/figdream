export interface OnboardingData {
  // Personal Info
  first_name: string
  last_name: string
  display_name: string
  email: string
  phone: string
  avatar_url?: string

  // Professional Info
  title: string
  bio: string
  experience_years: number
  employment_type: "full_time" | "part_time" | "contractor"
  hired_at: string

  // Skills & Specializations
  specializations: string[]
  languages: string[]
  certifications: string[]

  // Compensation
  commission_rate: number
  hourly_rate: number
  payment_method: string

  // Schedule Preferences
  availability: {
    monday: boolean
    tuesday: boolean
    wednesday: boolean
    thursday: boolean
    friday: boolean
    saturday: boolean
    sunday: boolean
  }
  preferred_hours: string

  // Services
  selected_services: string[]

  // Documents
  documents: {
    license?: File
    insurance?: File
    certifications?: File[]
    id_verification?: File
  }

  // Access & Permissions
  is_bookable: boolean
  can_view_reports: boolean
  can_manage_schedule: boolean

  // Legal
  terms_accepted: boolean
  handbook_acknowledged: boolean
}

export const ONBOARDING_STEPS = [
  { id: 1, title: "Personal Info", icon: "User" },
  { id: 2, title: "Professional", icon: "Briefcase" },
  { id: 3, title: "Skills", icon: "Award" },
  { id: 4, title: "Compensation", icon: "DollarSign" },
  { id: 5, title: "Schedule", icon: "Calendar" },
  { id: 6, title: "Services", icon: "Star" },
  { id: 7, title: "Documents", icon: "FileText" },
  { id: 8, title: "Access", icon: "Shield" },
  { id: 9, title: "Review", icon: "Check" }
]

export const DEFAULT_ONBOARDING_DATA: OnboardingData = {
  first_name: "",
  last_name: "",
  display_name: "",
  email: "",
  phone: "",
  title: "",
  bio: "",
  experience_years: 0,
  employment_type: "full_time",
  hired_at: new Date().toISOString().split('T')[0],
  specializations: [],
  languages: ["English"],
  certifications: [],
  commission_rate: 50,
  hourly_rate: 25,
  payment_method: "direct_deposit",
  availability: {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false
  },
  preferred_hours: "9:00 AM - 5:00 PM",
  selected_services: [],
  documents: {},
  is_bookable: true,
  can_view_reports: false,
  can_manage_schedule: true,
  terms_accepted: false,
  handbook_acknowledged: false
}