import { QueryClient } from '@tanstack/react-query'

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
        refetchOnMount: true,
      },
      mutations: {
        retry: 1,
        retryDelay: 1000,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient()
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

// Query keys factory for type-safe query keys
export const queryKeys = {
  all: [''] as const,
  
  // Appointments
  appointments: () => ['appointments'] as const,
  appointment: (id: string) => ['appointments', id] as const,
  appointmentsByCustomer: (customerId: string) => ['appointments', 'customer', customerId] as const,
  appointmentsByStaff: (staffId: string) => ['appointments', 'staff', staffId] as const,
  
  // Customers
  customers: () => ['customers'] as const,
  customer: (id: string) => ['customers', id] as const,
  customerSearch: (query: string) => ['customers', 'search', query] as const,
  
  // Services
  services: () => ['services'] as const,
  service: (id: string) => ['services', id] as const,
  servicesBySalon: (salonId: string) => ['services', 'salon', salonId] as const,
  servicesByCategory: (categoryId: string) => ['services', 'category', categoryId] as const,
  
  // Staff
  staff: () => ['staff'] as const,
  staffMember: (id: string) => ['staff', id] as const,
  staffBySalon: (salonId: string) => ['staff', 'salon', salonId] as const,
  staffSchedule: (staffId: string) => ['staff', staffId, 'schedule'] as const,
  
  // Salons
  salons: () => ['salons'] as const,
  salon: (id: string) => ['salons', id] as const,
  salonLocations: (salonId: string) => ['salons', salonId, 'locations'] as const,
  
  // Analytics
  analytics: () => ['analytics'] as const,
  analyticsRevenue: (salonId: string, period: string) => ['analytics', 'revenue', salonId, period] as const,
  analyticsCustomers: (salonId: string) => ['analytics', 'customers', salonId] as const,
  analyticsServices: (salonId: string) => ['analytics', 'services', salonId] as const,
  
  // Predictions
  predictions: () => ['predictions'] as const,
  demandForecast: (salonId: string, days: number) => ['predictions', 'demand', salonId, days] as const,
  churnPrediction: (salonId: string) => ['predictions', 'churn', salonId] as const,
  revenueProjection: (salonId: string, months: number) => ['predictions', 'revenue', salonId, months] as const,
  
  // Loyalty
  loyalty: () => ['loyalty'] as const,
  loyaltyProgram: (salonId: string) => ['loyalty', 'program', salonId] as const,
  loyaltyCustomer: (customerId: string) => ['loyalty', 'customer', customerId] as const,
  loyaltyTransactions: (salonId: string) => ['loyalty', 'transactions', salonId] as const,
  
  // Notifications
  notifications: () => ['notifications'] as const,
  notificationsByUser: (userId: string) => ['notifications', 'user', userId] as const,
  unreadNotifications: (userId: string) => ['notifications', 'unread', userId] as const,
} as const

// Mutation keys factory
export const mutationKeys = {
  // Appointments
  createAppointment: () => ['createAppointment'] as const,
  updateAppointment: () => ['updateAppointment'] as const,
  cancelAppointment: () => ['cancelAppointment'] as const,
  rescheduleAppointment: () => ['rescheduleAppointment'] as const,
  
  // Customers
  createCustomer: () => ['createCustomer'] as const,
  updateCustomer: () => ['updateCustomer'] as const,
  deleteCustomer: () => ['deleteCustomer'] as const,
  
  // Services
  createService: () => ['createService'] as const,
  updateService: () => ['updateService'] as const,
  deleteService: () => ['deleteService'] as const,
  
  // Staff
  createStaff: () => ['createStaff'] as const,
  updateStaff: () => ['updateStaff'] as const,
  deleteStaff: () => ['deleteStaff'] as const,
  updateStaffSchedule: () => ['updateStaffSchedule'] as const,
  
  // Loyalty
  adjustPoints: () => ['adjustPoints'] as const,
  redeemReward: () => ['redeemReward'] as const,
  
  // Time-off
  requestTimeOff: () => ['requestTimeOff'] as const,
  approveTimeOff: () => ['approveTimeOff'] as const,
  denyTimeOff: () => ['denyTimeOff'] as const,
} as const