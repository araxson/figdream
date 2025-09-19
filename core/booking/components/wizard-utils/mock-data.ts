import type { ServiceCategory, Service, StaffProfile } from '../../types'
import { generateTimeSlots } from './wizard-helpers'

export function getMockCategories(salonId: string): ServiceCategory[] {
  return [
    { id: '1', salon_id: salonId, name: 'Hair', display_order: 1, is_active: true },
    { id: '2', salon_id: salonId, name: 'Nails', display_order: 2, is_active: true },
    { id: '3', salon_id: salonId, name: 'Spa', display_order: 3, is_active: true }
  ] as ServiceCategory[]
}

export function getMockServices(salonId: string): Service[] {
  return [
    {
      id: '1',
      salon_id: salonId,
      category_id: '1',
      name: 'Haircut & Style',
      description: 'Professional cut and styling',
      duration_minutes: 45,
      base_price: 50,
      is_active: true,
      is_addon: false
    },
    {
      id: '2',
      salon_id: salonId,
      category_id: '1',
      name: 'Hair Color',
      description: 'Full color treatment',
      duration_minutes: 120,
      base_price: 150,
      is_active: true,
      is_addon: false
    },
    {
      id: '3',
      salon_id: salonId,
      category_id: '2',
      name: 'Manicure',
      description: 'Classic manicure',
      duration_minutes: 30,
      base_price: 35,
      is_active: true,
      is_addon: false
    },
    {
      id: '4',
      salon_id: salonId,
      category_id: '',
      name: 'Scalp Massage',
      description: 'Relaxing scalp massage',
      duration_minutes: 15,
      base_price: 20,
      is_active: true,
      is_addon: true
    }
  ] as Service[]
}

export function getMockStaff(salonId: string): StaffProfile[] {
  return [
    {
      id: '1',
      user_id: '1',
      salon_id: salonId,
      display_name: 'Sarah Johnson',
      title: 'Senior Stylist',
      is_active: true
    },
    {
      id: '2',
      user_id: '2',
      salon_id: salonId,
      display_name: 'Mike Chen',
      title: 'Color Specialist',
      is_active: true
    }
  ] as StaffProfile[]
}

export function getMockTimeSlots() {
  return generateTimeSlots()
}