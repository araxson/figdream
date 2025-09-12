'use client'

import { RoleBasedSidebar, type UserRole } from '@/components/shared/navigation/role-based-sidebar'
import { cn } from '@/lib/utils'

interface AppSidebarProps {
  role: UserRole
  className?: string
}

export function AppSidebar({ role, className }: AppSidebarProps) {
  return <RoleBasedSidebar role={role} className={cn(className)} />
}

// Legacy exports for backward compatibility
export function AppSidebarAdmin({ className }: { className?: string }) {
  return <AppSidebar role="admin" className={cn(className)} />
}

export function AppSidebarOwner({ className }: { className?: string }) {
  return <AppSidebar role="owner" className={cn(className)} />
}

export function AppSidebarStaff({ className }: { className?: string }) {
  return <AppSidebar role="staff" className={cn(className)} />
}

export function AppSidebarCustomer({ className }: { className?: string }) {
  return <AppSidebar role="customer" className={cn(className)} />
}