import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Download, Upload, UserPlus } from 'lucide-react'
import type { UserFilters } from '../dal/users-types'

interface UsersToolbarProps {
  filters: UserFilters
  onSearch: (value: string) => void
  onFilterChange: (key: keyof UserFilters, value: string) => void
  onExport?: () => void
  onImport?: () => void
  onAddUser?: () => void
}

export function UsersToolbar({
  filters,
  onSearch,
  onFilterChange,
  onExport,
  onImport,
  onAddUser
}: UsersToolbarProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* Search and Filters */}
      <div className="flex flex-1 gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={filters.search}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select
          value={filters.role}
          onValueChange={(value) => onFilterChange('role', value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="platform_admin">Platform Admin</SelectItem>
            <SelectItem value="salon_owner">Salon Owner</SelectItem>
            <SelectItem value="salon_staff">Salon Staff</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(value) => onFilterChange('status', value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        )}

        {onImport && (
          <Button variant="outline" size="sm" onClick={onImport}>
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
        )}

        {onAddUser && (
          <Button size="sm" onClick={onAddUser}>
            <UserPlus className="h-4 w-4 mr-1" />
            Add User
          </Button>
        )}
      </div>
    </div>
  )
}