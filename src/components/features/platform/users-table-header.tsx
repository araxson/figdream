'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UsersTableHeaderProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  roleFilter: string
  onRoleFilterChange: (value: string) => void
}

export function UsersTableHeader({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange
}: UsersTableHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row gap-4 mb-6")}>
      <div className={cn("relative flex-1")}>
        <Search className={cn("absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4")} />
        <Input
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn("pl-10")}
        />
      </div>
      <div className={cn("flex gap-2")}>
        <Select value={roleFilter} onValueChange={onRoleFilterChange}>
          <SelectTrigger className={cn("w-[180px]")}>
            <Filter className={cn("h-4 w-4 mr-2")} />
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="salon_owner">Salon Owner</SelectItem>
            <SelectItem value="salon_manager">Manager</SelectItem>
            <SelectItem value="super_admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}