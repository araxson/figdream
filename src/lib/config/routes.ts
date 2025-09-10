export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // Customer routes
  BOOK: '/book',
  BOOK_SALON: (slug: string) => `/book/${slug}`,
  APPOINTMENTS: '/appointments',
  PROFILE: '/profile',
  REVIEWS: '/reviews',
  
  // Admin routes
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_SALONS: '/admin/salons',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_SETTINGS: '/admin/settings',
  
  // Owner routes (dashboard)
  OWNER: '/dashboard',
  OWNER_APPOINTMENTS: '/dashboard/appointments',
  OWNER_SERVICES: '/dashboard/services',
  OWNER_STAFF: '/dashboard/staff',
  OWNER_CUSTOMERS: '/dashboard/customers',
  OWNER_REVIEWS: '/dashboard/reviews',
  OWNER_CAMPAIGNS: '/dashboard/campaigns',
  OWNER_REPORTS: '/dashboard/reports',
  OWNER_SETTINGS: '/dashboard/settings',
  
  // Staff routes
  STAFF: '/staff',
  STAFF_SCHEDULE: '/staff/schedule',
  STAFF_APPOINTMENTS: '/staff/appointments',
  STAFF_CUSTOMERS: '/staff/customers',
  STAFF_TIPS: '/staff/tips',
  STAFF_PROFILE: '/staff/profile',
  
  // API routes
  API_AUTH_CALLBACK: '/api/auth/callback',
  API_AUTH_SIGNOUT: '/api/auth/signout',
} as const

export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
  ROUTES.BOOK,
]

export const PROTECTED_ROUTES = {
  admin: [
    ROUTES.ADMIN,
    ROUTES.ADMIN_USERS,
    ROUTES.ADMIN_SALONS,
    ROUTES.ADMIN_ANALYTICS,
    ROUTES.ADMIN_SETTINGS,
  ],
  owner: [
    ROUTES.OWNER,
    ROUTES.OWNER_APPOINTMENTS,
    ROUTES.OWNER_SERVICES,
    ROUTES.OWNER_STAFF,
    ROUTES.OWNER_CUSTOMERS,
    ROUTES.OWNER_REVIEWS,
    ROUTES.OWNER_CAMPAIGNS,
    ROUTES.OWNER_REPORTS,
    ROUTES.OWNER_SETTINGS,
  ],
  staff: [
    ROUTES.STAFF,
    ROUTES.STAFF_SCHEDULE,
    ROUTES.STAFF_APPOINTMENTS,
    ROUTES.STAFF_CUSTOMERS,
    ROUTES.STAFF_TIPS,
    ROUTES.STAFF_PROFILE,
  ],
  customer: [
    ROUTES.BOOK,
    ROUTES.APPOINTMENTS,
    ROUTES.PROFILE,
    ROUTES.REVIEWS,
  ],
}