import { Database } from '@/types/database.types'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type SortField = 'email' | 'role' | 'created_at' | 'full_name'
export type SortOrder = 'asc' | 'desc'

export interface UsersTableProps {
  initialUsers: Profile[]
}