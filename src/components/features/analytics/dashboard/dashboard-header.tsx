interface DashboardHeaderProps {
  userRole: 'super_admin' | 'salon_owner' | 'salon_manager' | 'staff' | 'customer'
}

export function DashboardHeader({ userRole }: DashboardHeaderProps) {
  const getHeaderContent = () => {
    switch (userRole) {
      case 'super_admin':
        return {
          title: 'Admin Dashboard',
          description: 'System overview and management'
        }
      case 'salon_owner':
      case 'salon_manager':
        return {
          title: 'Salon Dashboard',
          description: 'Manage your salon operations'
        }
      case 'staff':
        return {
          title: 'My Dashboard',
          description: 'Your appointments and schedule'
        }
      case 'customer':
        return {
          title: 'Customer Dashboard',
          description: 'Your bookings and account overview'
        }
      default:
        return {
          title: 'Dashboard',
          description: 'Welcome to your dashboard'
        }
    }
  }

  const { title, description } = getHeaderContent()

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">
        {description}
      </p>
    </div>
  )
}