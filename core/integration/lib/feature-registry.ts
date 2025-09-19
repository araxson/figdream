// Central registry of all platform features with dynamic loading capabilities
import type { FeatureModule, UserRole } from '../types'

class FeatureRegistry {
  private features: Map<string, FeatureModule> = new Map()
  private loadedModules: Set<string> = new Set()

  constructor() {
    this.registerAllFeatures()
  }

  private registerAllFeatures() {
    // Admin features
    this.register({
      id: 'admin',
      name: 'Admin',
      path: '/admin',
      roles: ['super_admin', 'platform_admin'],
      children: [
        {
          id: 'admin-users',
          name: 'User Management',
          path: '/admin/users/management',
          roles: ['super_admin', 'platform_admin'],
          description: 'Manage platform users and permissions'
        },
        {
          id: 'admin-roles',
          name: 'Role Management',
          path: '/admin/roles',
          roles: ['super_admin'],
          description: 'Configure user roles and permissions'
        },
        {
          id: 'admin-monitoring',
          name: 'System Monitoring',
          path: '/admin/monitoring',
          roles: ['super_admin', 'platform_admin'],
          description: 'Monitor system health and performance'
        },
        {
          id: 'admin-audit',
          name: 'Audit Logs',
          path: '/admin/audit-logs',
          roles: ['super_admin', 'platform_admin'],
          description: 'View system audit logs'
        }
      ]
    })

    // Dashboard features
    this.register({
      id: 'dashboard',
      name: 'Dashboard',
      path: '/dashboard',
      roles: ['salon_owner', 'salon_manager', 'salon_admin'],
      children: [
        {
          id: 'dashboard-salon',
          name: 'Salon Overview',
          path: '/dashboard/salon',
          roles: ['salon_owner', 'salon_manager', 'salon_admin'],
          description: 'Salon performance and metrics'
        },
        {
          id: 'dashboard-appointments',
          name: 'Appointments',
          path: '/dashboard/appointments',
          roles: ['salon_owner', 'salon_manager', 'salon_admin', 'receptionist'],
          description: 'Manage salon appointments'
        },
        {
          id: 'dashboard-staff',
          name: 'Staff Management',
          path: '/dashboard/staff',
          roles: ['salon_owner', 'salon_manager'],
          description: 'Manage staff and schedules'
        },
        {
          id: 'dashboard-services',
          name: 'Services',
          path: '/dashboard/services',
          roles: ['salon_owner', 'salon_manager', 'salon_admin'],
          description: 'Manage service catalog'
        },
        {
          id: 'dashboard-customers',
          name: 'Customers',
          path: '/dashboard/customers',
          roles: ['salon_owner', 'salon_manager', 'salon_admin', 'receptionist'],
          description: 'Customer management'
        },
        {
          id: 'dashboard-analytics',
          name: 'Analytics',
          path: '/dashboard/analytics',
          roles: ['salon_owner', 'salon_manager'],
          description: 'Business analytics and insights'
        },
        {
          id: 'dashboard-billing',
          name: 'Billing',
          path: '/dashboard/billing',
          roles: ['salon_owner'],
          description: 'Billing and revenue management'
        },
        {
          id: 'dashboard-campaigns',
          name: 'Campaigns',
          path: '/dashboard/campaigns',
          roles: ['salon_owner', 'salon_manager', 'salon_admin'],
          description: 'Marketing campaigns'
        },
        {
          id: 'dashboard-reviews',
          name: 'Reviews',
          path: '/dashboard/reviews',
          roles: ['salon_owner', 'salon_manager', 'salon_admin'],
          description: 'Customer reviews management'
        },
        {
          id: 'dashboard-settings',
          name: 'Settings',
          path: '/dashboard/settings',
          roles: ['salon_owner', 'salon_manager'],
          description: 'Salon settings and configuration'
        }
      ]
    })

    // Staff features
    this.register({
      id: 'staff',
      name: 'Staff Portal',
      path: '/staff',
      roles: ['staff', 'senior_staff'],
      children: [
        {
          id: 'staff-appointments',
          name: 'My Appointments',
          path: '/staff/appointments',
          roles: ['staff', 'senior_staff'],
          description: 'View and manage your appointments'
        },
        {
          id: 'staff-schedule',
          name: 'My Schedule',
          path: '/staff/schedule',
          roles: ['staff', 'senior_staff'],
          description: 'Manage your work schedule'
        },
        {
          id: 'staff-customers',
          name: 'My Customers',
          path: '/staff/customers',
          roles: ['staff', 'senior_staff'],
          description: 'Your customer relationships'
        },
        {
          id: 'staff-analytics',
          name: 'My Performance',
          path: '/staff/analytics',
          roles: ['staff', 'senior_staff'],
          description: 'View your performance metrics'
        },
        {
          id: 'staff-time-off',
          name: 'Time Off',
          path: '/staff/time-off',
          roles: ['staff', 'senior_staff'],
          description: 'Request and manage time off'
        },
        {
          id: 'staff-services',
          name: 'My Services',
          path: '/staff/services',
          roles: ['staff', 'senior_staff'],
          description: 'Services you provide'
        },
        {
          id: 'staff-profile',
          name: 'My Profile',
          path: '/staff/profile',
          roles: ['staff', 'senior_staff'],
          description: 'Manage your profile'
        }
      ]
    })

    // Customer features
    this.register({
      id: 'customer',
      name: 'Customer Portal',
      path: '/customer',
      roles: ['customer'],
      children: [
        {
          id: 'customer-appointments',
          name: 'My Appointments',
          path: '/customer/appointments',
          roles: ['customer'],
          description: 'View upcoming and past appointments'
        },
        {
          id: 'customer-booking',
          name: 'Book Appointment',
          path: '/booking',
          roles: ['customer'],
          description: 'Book a new appointment'
        },
        {
          id: 'customer-favorites',
          name: 'My Favorites',
          path: '/customer/favorites',
          roles: ['customer'],
          description: 'Favorite salons and staff'
        },
        {
          id: 'customer-reviews',
          name: 'My Reviews',
          path: '/customer/reviews',
          roles: ['customer'],
          description: 'Your reviews and ratings'
        },
        {
          id: 'customer-loyalty',
          name: 'Rewards',
          path: '/customer/loyalty',
          roles: ['customer'],
          description: 'Loyalty points and rewards'
        },
        {
          id: 'customer-profile',
          name: 'My Profile',
          path: '/customer/profile',
          roles: ['customer'],
          description: 'Manage your profile'
        }
      ]
    })

    // Booking system (public and authenticated)
    this.register({
      id: 'booking',
      name: 'Booking System',
      path: '/booking',
      roles: ['customer', 'guest'],
      children: [
        {
          id: 'booking-search',
          name: 'Find Salons',
          path: '/booking',
          roles: ['customer', 'guest'],
          description: 'Search for salons and services'
        },
        {
          id: 'booking-manage',
          name: 'Manage Booking',
          path: '/booking/manage',
          roles: ['customer'],
          description: 'Modify or cancel bookings'
        },
        {
          id: 'booking-demo',
          name: 'Demo Booking',
          path: '/booking/demo',
          roles: ['guest'],
          description: 'Try the booking system'
        }
      ]
    })

    // Shared features
    this.register({
      id: 'notifications',
      name: 'Notifications',
      path: '/notifications',
      roles: ['super_admin', 'platform_admin', 'salon_owner', 'salon_manager',
              'salon_admin', 'receptionist', 'staff', 'senior_staff', 'customer'],
      description: 'Notification center'
    })

    this.register({
      id: 'messages',
      name: 'Messages',
      path: '/messages',
      roles: ['salon_owner', 'salon_manager', 'salon_admin', 'receptionist',
              'staff', 'senior_staff', 'customer'],
      description: 'Messaging system'
    })

    this.register({
      id: 'settings',
      name: 'Settings',
      path: '/settings',
      roles: ['super_admin', 'platform_admin', 'salon_owner', 'salon_manager',
              'salon_admin', 'staff', 'senior_staff', 'customer'],
      description: 'Personal settings'
    })
  }

  register(feature: FeatureModule): void {
    this.features.set(feature.id, feature)
    if (feature.children) {
      feature.children.forEach(child => {
        this.features.set(child.id, { ...child, roles: child.roles || feature.roles })
      })
    }
  }

  getFeature(id: string): FeatureModule | undefined {
    return this.features.get(id)
  }

  getFeaturesForRole(role: UserRole): FeatureModule[] {
    const features: FeatureModule[] = []

    this.features.forEach(feature => {
      if (!feature.id.includes('-') && feature.roles.includes(role)) {
        const featureWithChildren = {
          ...feature,
          children: feature.children?.filter(child =>
            child.roles.includes(role)
          )
        }
        features.push(featureWithChildren)
      }
    })

    return features
  }

  getAllFeatures(): FeatureModule[] {
    const topLevel: FeatureModule[] = []
    this.features.forEach(feature => {
      if (!feature.id.includes('-')) {
        topLevel.push(feature)
      }
    })
    return topLevel
  }

  isFeatureAccessible(featureId: string, role: UserRole): boolean {
    const feature = this.features.get(featureId)
    return feature ? feature.roles.includes(role) : false
  }

  async loadFeature(featureId: string): Promise<void> {
    if (this.loadedModules.has(featureId)) {
      return
    }

    // Dynamic import based on feature ID
    try {
      switch (featureId) {
        case 'dashboard':
          await import('@/core/salons/components')
          break
        case 'booking':
          await import('@/core/booking/components')
          break
        case 'admin-users':
          await import('@/core/users/components')
          break
        case 'staff':
          await import('@/core/staff/components')
          break
        // Add more dynamic imports as needed
      }

      this.loadedModules.add(featureId)
    } catch (error) {
      console.error(`Failed to load feature ${featureId}:`, error)
      throw error
    }
  }

  getLoadedModules(): string[] {
    return Array.from(this.loadedModules)
  }

  getHealthStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {}
    this.features.forEach((_, id) => {
      status[id] = this.loadedModules.has(id)
    })
    return status
  }
}

// Singleton instance
export const featureRegistry = new FeatureRegistry()