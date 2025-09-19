import type { Database } from '@/types/database.types'

export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type UserWithProfile = User & {
  profiles?: Database['public']['Tables']['profiles']['Row']
}