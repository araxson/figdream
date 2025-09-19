import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import type { ProfileWithRelations } from '../dal/users-types'
import { UserTableRow } from './user-table-row'

interface UsersTableProps {
  users: ProfileWithRelations[]
  selectedUsers: string[]
  isAllSelected: boolean
  isLoading: boolean
  onSelectAll: () => void
  onSelectUser: (userId: string) => void
  onUserAction: (userId: string, action: string) => void
}

export function UsersTable({
  users,
  selectedUsers,
  isAllSelected,
  isLoading,
  onSelectAll,
  onSelectUser,
  onUserAction
}: UsersTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableHead>
                  <Skeleton className="h-4 w-4" />
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </TableHead>
                <TableHead>
                  <Skeleton className="h-6 w-20" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-6 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-8 w-8" />
                </TableHead>
              </TableRow>
            ))
          ) : users.length === 0 ? (
            <TableRow>
              <TableHead colSpan={7} className="text-center py-8 text-muted-foreground">
                No users found
              </TableHead>
            </TableRow>
          ) : (
            users.map((user) => (
              <UserTableRow
                key={user.id}
                user={user}
                isSelected={selectedUsers.includes(user.id)}
                onSelect={() => onSelectUser(user.id)}
                onAction={(action) => onUserAction(user.id, action)}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}