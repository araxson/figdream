import type {
  BookingWizardState,
  BookingStep,
  ServiceSelection,
  Service,
  ServiceCategory,
  StaffProfile,
  TimeSlot,
  CustomerInfo,
  PaymentMethod
} from '../../types'

export interface WizardStepProps {
  state: BookingWizardState
  onStateChange: (updates: Partial<BookingWizardState>) => void
  loading?: boolean
  error?: string | null
}

export interface ServiceStepProps extends WizardStepProps {
  categories: ServiceCategory[]
  services: Service[]
  serviceQuantities: Map<string, number>
  onToggleService: (service: Service, category: ServiceCategory) => void
  onUpdateQuantity: (serviceId: string, quantity: number) => void
}

export interface StaffStepProps extends WizardStepProps {
  staff: StaffProfile[]
}

export interface DateTimeStepProps extends WizardStepProps {
  timeSlots: TimeSlot[]
}

export interface CustomerStepProps extends WizardStepProps {}

export interface AddonsStepProps extends WizardStepProps {
  services: Service[]
}

export interface PaymentStepProps extends WizardStepProps {
  subtotal: number
  tax: number
  total: number
}

export interface ConfirmationStepProps extends WizardStepProps {
  staff: StaffProfile[]
  totalDuration: number
  total: number
}

export const WIZARD_STEPS: { id: BookingStep; label: string; icon: any }[] = [
  { id: 'service', label: 'Services', icon: 'Check' },
  { id: 'staff', label: 'Staff', icon: 'User' },
  { id: 'datetime', label: 'Date & Time', icon: 'CalendarIcon' },
  { id: 'customer', label: 'Your Info', icon: 'User' },
  { id: 'addons', label: 'Add-ons', icon: 'Plus' },
  { id: 'payment', label: 'Payment', icon: 'CreditCard' },
  { id: 'confirmation', label: 'Confirm', icon: 'Check' }
]